# JHB StreamPulse - Optimization & Improvement Guide

Comprehensive recommendations for improving security, performance, reliability, and maintainability.

---

## 🔒 Security Improvements

### 1. Enhanced Authentication

**Current**: Simple PIN-based auth with plain text transmission

**Recommended**:
```javascript
// Install dependencies
npm install jsonwebtoken bcrypt express-rate-limit

// Implement JWT-based auth
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// Hash PIN on first setup
const hashedPin = await bcrypt.hash(ADMIN_PIN, 10);

// Generate JWT on successful auth
const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });

// Verify JWT in middleware
function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}
```

**Benefits**:
- Secure token-based sessions
- Automatic expiration
- No PIN transmission after initial auth
- Revocable tokens

### 2. Rate Limiting

**Implementation**: See `add-rate-limiting.patch`

**Apply**:
```bash
npm install express-rate-limit
# Add code from patch file to server.js
```

**Benefits**:
- Prevents brute force attacks
- Protects against DoS
- Limits upload abuse

### 3. HTTPS Enforcement

**Update ingress for HTTPS redirect**:
```yaml
# Add to k8s/ingress.yaml annotations
kubernetes.io/ingress.allow-http: "false"
cert-manager.io/cluster-issuer: "letsencrypt-prod"
```

### 4. Security Headers

**Add helmet middleware**:
```bash
npm install helmet
```

```javascript
import helmet from 'helmet';
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

---

## ⚡ Performance Optimizations

### 1. Resource Right-Sizing

**Current Usage**: 3m CPU, 21-29Mi memory  
**Current Requests**: 250m CPU, 256Mi memory  
**Waste**: ~95% over-provisioned

**Optimized Configuration** (already applied):
```yaml
resources:
  requests:
    memory: "64Mi"   # 2.5x actual usage
    cpu: "50m"       # 16x actual usage
  limits:
    memory: "256Mi"  # 10x actual usage
    cpu: "200m"      # 66x actual usage
```

**Benefits**:
- Better cluster resource utilization
- Lower costs
- Faster pod scheduling

### 2. Database Query Optimization

**Add indexes to SQLite**:
```javascript
// In db.js, add after table creation
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_weekly_service ON weekly_data(service);
  CREATE INDEX IF NOT EXISTS idx_weekly_date ON weekly_data(date);
  CREATE INDEX IF NOT EXISTS idx_weekly_month ON weekly_data(month);
  CREATE INDEX IF NOT EXISTS idx_events_date ON special_events(start_date);
`);
```

**Benefits**:
- Faster queries
- Better performance with large datasets

### 3. Response Caching

**Add caching for read-heavy endpoints**:
```javascript
import NodeCache from 'node-cache';
const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes

app.get("/api/data", (req, res) => {
  const cached = cache.get('all-data');
  if (cached) return res.json(cached);
  
  const data = getWeeklyData();
  const events = getSpecialEvents();
  const result = { data, events };
  
  cache.set('all-data', result);
  res.json(result);
});

// Invalidate cache on updates
app.post("/api/upload", requireAdmin, upload.single("csv"), (req, res) => {
  // ... upload logic ...
  cache.flushAll(); // Clear cache after upload
  res.json(result);
});
```

### 4. Frontend Build Optimization

**Update vite.config.js**:
```javascript
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'charts': ['recharts'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
};
```

---

## 💾 Backup & Disaster Recovery

### 1. Automated Backups

**Deploy backup CronJob**:
```bash
# Create GCS bucket first
gsutil mb -l us-central1 gs://jhb-streampulse-backups

# Apply backup CronJob
kubectl apply -f k8s/backup-cronjob.yaml
```

**Verify backups**:
```bash
# Check CronJob status
kubectl get cronjobs -n jhb-streampulse

# View backup jobs
kubectl get jobs -n jhb-streampulse

# List backups in GCS
gsutil ls gs://jhb-streampulse-backups/
```

### 2. Manual Backup Script

**Create backup script**:
```bash
#!/bin/bash
# backup.sh

POD=$(kubectl get pod -n jhb-streampulse -l app=jhb-streampulse -o jsonpath='{.items[0].metadata.name}')
DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="streampulse-backup-${DATE}.db"

kubectl cp jhb-streampulse/$POD:/app/data/streampulse.db ./$BACKUP_FILE
echo "Backup saved: $BACKUP_FILE"
```

### 3. Restore Procedure

```bash
#!/bin/bash
# restore.sh

BACKUP_FILE=$1
POD=$(kubectl get pod -n jhb-streampulse -l app=jhb-streampulse -o jsonpath='{.items[0].metadata.name}')

# Copy backup to pod
kubectl cp $BACKUP_FILE jhb-streampulse/$POD:/app/data/streampulse.db

# Restart deployment
kubectl rollout restart deployment/jhb-streampulse -n jhb-streampulse

echo "Database restored from: $BACKUP_FILE"
```

---

## 📊 Monitoring & Observability

### 1. Application Metrics

**Add Prometheus metrics**:
```bash
npm install prom-client
```

```javascript
import promClient from 'prom-client';

// Create metrics
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

const uploadCounter = new promClient.Counter({
  name: 'csv_uploads_total',
  help: 'Total number of CSV uploads',
  labelNames: ['mode'],
  registers: [register],
});

// Expose metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Track metrics
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration.labels(req.method, req.route?.path || req.path, res.statusCode).observe(duration);
  });
  next();
});
```

### 2. Structured Logging

**Implementation**: See `add-logging.patch`

**Apply**:
```bash
npm install winston morgan
# Add code from patch file
```

**Benefits**:
- Searchable logs
- Better debugging
- Audit trail

### 3. Health Checks

**Add dedicated endpoints**: See `add-health-endpoint.patch`

**Update deployment**:
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8000
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /ready
    port: 8000
  initialDelaySeconds: 10
  periodSeconds: 5
```

### 4. Grafana Dashboard

**Create dashboard for key metrics**:
- Request rate and latency
- Upload frequency and size
- Database size growth
- Error rates
- Pod resource usage

---

## 🌐 DNS & SSL Configuration

### 1. Configure DNS

**Update DNS records**:
```bash
# In your DNS provider (e.g., Cloudflare, Route53):
streampulse.jesushouse.com      A    34.107.248.179
www.streampulse.jesushouse.com  A    34.107.248.179
```

**Verify**:
```bash
dig streampulse.jesushouse.com
nslookup streampulse.jesushouse.com
```

### 2. SSL Certificate Status

**Check certificate**:
```bash
kubectl describe managedcertificate jhb-streampulse-cert -n jhb-streampulse
```

**Expected timeline**:
- DNS propagation: 5-60 minutes
- Certificate provisioning: 15-60 minutes after DNS
- Total: 20-120 minutes

### 3. Force HTTPS

**Once SSL is active**:
```yaml
# Update k8s/ingress.yaml
annotations:
  kubernetes.io/ingress.allow-http: "false"  # Change from "true"
```

---

## 🔧 Code Quality Improvements

### 1. Add TypeScript

**Convert to TypeScript for better type safety**:
```bash
npm install --save-dev typescript @types/node @types/express
npx tsc --init
```

### 2. Add ESLint

```bash
npm install --save-dev eslint eslint-config-airbnb-base
npx eslint --init
```

### 3. Add Tests

```bash
npm install --save-dev jest supertest
```

**Example test**:
```javascript
// server.test.js
import request from 'supertest';
import app from './server.js';

describe('API Endpoints', () => {
  test('GET /api/stats returns stats', async () => {
    const res = await request(app).get('/api/stats');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('totalWeeks');
  });

  test('POST /api/auth with valid PIN', async () => {
    const res = await request(app)
      .post('/api/auth')
      .send({ pin: '1234' });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
```

---

## 🚀 Deployment Improvements

### 1. Apply All Optimizations

```bash
# Update deployment with optimized resources
kubectl apply -f k8s/deployment.yaml

# Add network policy
kubectl apply -f k8s/networkpolicy.yaml

# Add pod disruption budget
kubectl apply -f k8s/pdb.yaml

# Set up backups
kubectl apply -f k8s/backup-cronjob.yaml

# Add monitoring
kubectl apply -f k8s/servicemonitor.yaml
```

### 2. Update Deployment Script

**Add to deploy-to-gke.sh**:
```bash
# Apply additional resources
kubectl apply -f k8s/networkpolicy.yaml
kubectl apply -f k8s/pdb.yaml
kubectl apply -f k8s/backup-cronjob.yaml
kubectl apply -f k8s/servicemonitor.yaml
```

### 3. CI/CD Pipeline

**Create GitHub Actions workflow**:
```yaml
# .github/workflows/deploy.yml
name: Deploy to GKE
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Cloud SDK
        uses: google-github-actions/setup-gcloud@v1
        with:
          project_id: alpfr-splunk-integration
      
      - name: Build and Deploy
        run: |
          gcloud container clusters get-credentials sermon-slicer-cluster --region=us-central1
          ./deploy-to-gke.sh
```

---

## 📈 Scaling Recommendations

### Current Configuration
- **Replicas**: 2-5 (auto-scaling)
- **CPU Target**: 70%
- **Memory Target**: 80%

### Recommendations

**For higher traffic**:
```yaml
# Update k8s/hpa.yaml
spec:
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 60  # Lower threshold
```

**For cost optimization**:
```yaml
spec:
  minReplicas: 1  # Single replica during low traffic
  maxReplicas: 5
```

---

## 💰 Cost Optimization

### Current Costs
- **Pods**: ~$5-10/month (shared cluster)
- **Storage**: ~$0.80/month (5Gi)
- **Load Balancer**: ~$18/month
- **Total**: ~$25-30/month

### Optimization Strategies

1. **Right-sized resources** (already applied): Save ~$2-3/month
2. **Reduce min replicas to 1**: Save ~$2-5/month
3. **Use preemptible nodes**: Save ~60% on compute
4. **Compress backups**: Reduce storage costs

---

## ✅ Implementation Checklist

### Immediate (High Priority)
- [ ] Apply optimized resource limits
- [ ] Set up automated backups
- [ ] Configure DNS records
- [ ] Add rate limiting
- [ ] Implement structured logging
- [ ] Add health check endpoints

### Short-term (This Week)
- [ ] Enhance authentication (JWT)
- [ ] Add Prometheus metrics
- [ ] Deploy network policy
- [ ] Deploy pod disruption budget
- [ ] Set up monitoring dashboard
- [ ] Add database indexes

### Medium-term (This Month)
- [ ] Convert to TypeScript
- [ ] Add comprehensive tests
- [ ] Set up CI/CD pipeline
- [ ] Implement response caching
- [ ] Add security headers
- [ ] Create restore procedures

### Long-term (Future)
- [ ] Multi-region deployment
- [ ] Database replication
- [ ] Advanced analytics
- [ ] User management system
- [ ] API versioning
- [ ] GraphQL API

---

## 📞 Support & Maintenance

### Regular Tasks

**Daily**:
- Check pod health: `kubectl get pods -n jhb-streampulse`
- Review logs: `kubectl logs -f deployment/jhb-streampulse -n jhb-streampulse`

**Weekly**:
- Verify backups: `gsutil ls gs://jhb-streampulse-backups/`
- Check resource usage: `kubectl top pods -n jhb-streampulse`
- Review metrics in Grafana

**Monthly**:
- Test backup restore procedure
- Review and rotate secrets
- Update dependencies: `npm audit fix`
- Review and optimize costs

---

**Last Updated**: February 13, 2026  
**Version**: 2.0.0  
**Status**: Production Deployed ✅
