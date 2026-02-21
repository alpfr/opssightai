# OpsSight AI - Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Production Deployment](#production-deployment)
4. [Docker Deployment](#docker-deployment)
5. [Kubernetes Deployment](#kubernetes-deployment)
6. [Environment Configuration](#environment-configuration)
7. [Database Setup](#database-setup)
8. [Monitoring & Logging](#monitoring--logging)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **Node.js**: v18+ (LTS recommended)
- **npm**: v9+ or **yarn**: v1.22+
- **Docker**: v20+ (for containerized deployment)
- **Docker Compose**: v2+
- **PostgreSQL**: v14+ with TimescaleDB extension
- **Redis**: v7+ (for caching)
- **Git**: v2.30+

### Optional
- **Kubernetes**: v1.24+ (for K8s deployment)
- **Helm**: v3+ (for K8s package management)
- **Nginx**: v1.20+ (for reverse proxy)

---

## Local Development Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd opssightai
```

### 2. Install Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### 3. Start Infrastructure Services
```bash
# From project root
docker-compose up -d
```

This starts:
- TimescaleDB on port 5433
- Redis on port 6380
- RabbitMQ on ports 5672 (AMQP) and 15672 (Management UI)

### 4. Initialize Database
```bash
# Database is automatically initialized via init-db.sql
# Verify connection:
docker exec opssightai-timescaledb psql -U postgres -d opssightai -c "\dt"
```

### 5. Start Backend API
```bash
cd backend
npm run dev
```

Backend runs on: http://localhost:4000

### 6. Start Frontend
```bash
cd frontend
npm run dev
```

Frontend runs on: http://localhost:4001

### 7. Verify Installation
```bash
# Check backend health
curl http://localhost:4000/api/health

# Check frontend
open http://localhost:4001
```

---

## Production Deployment

### Architecture Overview
```
┌─────────────┐
│   Nginx     │ (Reverse Proxy, SSL)
│   Port 80   │
└──────┬──────┘
       │
       ├─────────────────┬─────────────────┐
       │                 │                 │
┌──────▼──────┐   ┌─────▼──────┐   ┌─────▼──────┐
│  Frontend   │   │  Backend   │   │ TimescaleDB│
│  (Static)   │   │  API       │   │  (Data)    │
│  Port 4001  │   │  Port 4000 │   │  Port 5433 │
└─────────────┘   └────────────┘   └────────────┘
```

### 1. Build for Production

#### Backend
```bash
cd backend
npm run build
```

#### Frontend
```bash
cd frontend
npm run build
```

### 2. Environment Variables

Create `.env.production` files:

**Backend (.env.production)**
```env
NODE_ENV=production
PORT=4000

# Database
DB_HOST=localhost
DB_PORT=5433
DB_NAME=opssightai
DB_USER=postgres
DB_PASSWORD=<secure-password>

# Redis
REDIS_HOST=localhost
REDIS_PORT=6380
REDIS_PASSWORD=<secure-password>

# RabbitMQ
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=admin
RABBITMQ_PASSWORD=<secure-password>

# Security
JWT_SECRET=<generate-secure-secret>
CORS_ORIGIN=https://yourdomain.com

# External Services (Optional)
SENDGRID_API_KEY=<your-sendgrid-key>
TWILIO_ACCOUNT_SID=<your-twilio-sid>
TWILIO_AUTH_TOKEN=<your-twilio-token>
```

**Frontend (.env.production)**
```env
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com
```

### 3. Database Migration
```bash
# Backup existing data
pg_dump -U postgres -d opssightai > backup.sql

# Run migrations
npm run migrate:prod
```

### 4. Start Production Services

#### Using PM2 (Process Manager)
```bash
# Install PM2
npm install -g pm2

# Start backend
cd backend
pm2 start dist/index.js --name opssightai-api

# Serve frontend with nginx (see nginx config below)
```

#### Using systemd
Create `/etc/systemd/system/opssightai-api.service`:
```ini
[Unit]
Description=OpsSight AI API
After=network.target

[Service]
Type=simple
User=opssightai
WorkingDirectory=/opt/opssightai/backend
Environment=NODE_ENV=production
ExecStart=/usr/bin/node dist/index.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable opssightai-api
sudo systemctl start opssightai-api
```

### 5. Nginx Configuration

Create `/etc/nginx/sites-available/opssightai`:
```nginx
# Frontend
server {
    listen 80;
    server_name yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Frontend static files
    root /opt/opssightai/frontend/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # WebSocket support (for future real-time features)
    location /ws {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/opssightai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. SSL Certificate (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## Docker Deployment

### 1. Build Docker Images

**Backend Dockerfile** (`backend/Dockerfile`):
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

EXPOSE 4000
CMD ["node", "dist/index.js"]
```

**Frontend Dockerfile** (`frontend/Dockerfile`):
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 2. Build Images
```bash
# Backend
docker build -t opssightai-backend:latest ./backend

# Frontend
docker build -t opssightai-frontend:latest ./frontend
```

### 3. Docker Compose Production

**docker-compose.prod.yml**:
```yaml
version: '3.8'

services:
  timescaledb:
    image: timescale/timescaledb:latest-pg15
    environment:
      POSTGRES_DB: opssightai
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - timescaledb-data:/var/lib/postgresql/data
    networks:
      - opssightai-network
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis-data:/data
    networks:
      - opssightai-network
    restart: unless-stopped

  rabbitmq:
    image: rabbitmq:3-management-alpine
    environment:
      RABBITMQ_DEFAULT_USER: ${RABBITMQ_USER}
      RABBITMQ_DEFAULT_PASS: ${RABBITMQ_PASSWORD}
    volumes:
      - rabbitmq-data:/var/lib/rabbitmq
    networks:
      - opssightai-network
    restart: unless-stopped

  backend:
    image: opssightai-backend:latest
    environment:
      NODE_ENV: production
      DB_HOST: timescaledb
      DB_PORT: 5432
      REDIS_HOST: redis
      RABBITMQ_HOST: rabbitmq
    depends_on:
      - timescaledb
      - redis
      - rabbitmq
    networks:
      - opssightai-network
    restart: unless-stopped

  frontend:
    image: opssightai-frontend:latest
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
    networks:
      - opssightai-network
    restart: unless-stopped

volumes:
  timescaledb-data:
  redis-data:
  rabbitmq-data:

networks:
  opssightai-network:
    driver: bridge
```

### 4. Deploy with Docker Compose
```bash
# Create .env file with secrets
cp .env.example .env
# Edit .env with production values

# Deploy
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop
docker-compose -f docker-compose.prod.yml down
```

---

## Kubernetes Deployment

### 1. Prerequisites
- Kubernetes cluster (EKS, GKE, AKS, or self-hosted)
- kubectl configured
- Helm 3 installed

### 2. Create Namespace
```bash
kubectl create namespace opssightai
```

### 3. Create Secrets
```bash
kubectl create secret generic opssightai-secrets \
  --from-literal=db-password=<password> \
  --from-literal=redis-password=<password> \
  --from-literal=jwt-secret=<secret> \
  -n opssightai
```

### 4. Deploy with Helm

**values.yaml**:
```yaml
replicaCount: 3

image:
  backend:
    repository: opssightai-backend
    tag: latest
  frontend:
    repository: opssightai-frontend
    tag: latest

service:
  type: LoadBalancer
  port: 80

ingress:
  enabled: true
  className: nginx
  hosts:
    - host: opssightai.yourdomain.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: opssightai-tls
      hosts:
        - opssightai.yourdomain.com

postgresql:
  enabled: true
  auth:
    database: opssightai
    existingSecret: opssightai-secrets

redis:
  enabled: true
  auth:
    existingSecret: opssightai-secrets

resources:
  limits:
    cpu: 1000m
    memory: 1Gi
  requests:
    cpu: 500m
    memory: 512Mi

autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 80
```

Deploy:
```bash
helm install opssightai ./helm -n opssightai -f values.yaml
```

### 5. Verify Deployment
```bash
kubectl get pods -n opssightai
kubectl get services -n opssightai
kubectl logs -f deployment/opssightai-backend -n opssightai
```

---

## Environment Configuration

### Development
```env
NODE_ENV=development
LOG_LEVEL=debug
ENABLE_CORS=true
```

### Staging
```env
NODE_ENV=staging
LOG_LEVEL=info
ENABLE_CORS=true
API_RATE_LIMIT=1000
```

### Production
```env
NODE_ENV=production
LOG_LEVEL=warn
ENABLE_CORS=false
API_RATE_LIMIT=500
ENABLE_COMPRESSION=true
ENABLE_HELMET=true
```

---

## Database Setup

### Initial Setup
```sql
-- Create database
CREATE DATABASE opssightai;

-- Enable TimescaleDB
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Run migrations
\i docker/init-db.sql
```

### Backup Strategy
```bash
# Daily backup
pg_dump -U postgres -d opssightai -F c -f backup_$(date +%Y%m%d).dump

# Restore
pg_restore -U postgres -d opssightai backup_20260208.dump
```

### Performance Tuning
```sql
-- Optimize hypertables
SELECT add_compression_policy('sensor_readings', INTERVAL '7 days');
SELECT add_retention_policy('sensor_readings', INTERVAL '1 year');

-- Create indexes
CREATE INDEX idx_assets_plant_risk ON assets(plant_id, current_risk_score DESC);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read_at) WHERE read_at IS NULL;
```

---

## Monitoring & Logging

### Health Checks
```bash
# Backend health
curl http://localhost:4000/api/health

# Database health
docker exec opssightai-timescaledb pg_isready -U postgres

# Redis health
docker exec opssightai-redis redis-cli ping
```

### Logging

**Winston Configuration** (already implemented):
```typescript
// Logs to:
// - Console (development)
// - File: logs/combined.log
// - File: logs/error.log (errors only)
```

**Log Aggregation** (recommended):
- **ELK Stack**: Elasticsearch, Logstash, Kibana
- **Grafana Loki**: Lightweight log aggregation
- **CloudWatch**: For AWS deployments

### Metrics

**Prometheus Integration** (future):
```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'opssightai'
    static_configs:
      - targets: ['localhost:4000']
```

### Alerts

**Example Alert Rules**:
- API response time > 1s
- Error rate > 5%
- Database connection failures
- Memory usage > 80%
- Disk space < 10%

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```bash
# Check if TimescaleDB is running
docker ps | grep timescaledb

# Check logs
docker logs opssightai-timescaledb

# Test connection
docker exec opssightai-timescaledb psql -U postgres -d opssightai -c "SELECT 1"
```

#### 2. Frontend Can't Connect to Backend
```bash
# Check CORS settings
# Verify API_URL in frontend .env
# Check nginx proxy configuration
```

#### 3. High Memory Usage
```bash
# Check Node.js memory
pm2 monit

# Increase memory limit
NODE_OPTIONS="--max-old-space-size=4096" node dist/index.js
```

#### 4. Slow Queries
```sql
-- Enable query logging
ALTER SYSTEM SET log_min_duration_statement = 1000;

-- Check slow queries
SELECT * FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;
```

### Debug Mode
```bash
# Backend
DEBUG=* npm run dev

# View all logs
docker-compose logs -f
```

### Performance Issues
```bash
# Check system resources
docker stats

# Database performance
docker exec opssightai-timescaledb psql -U postgres -d opssightai -c "
  SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
  FROM pg_tables
  ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
"
```

---

## Security Checklist

- [ ] Change default passwords
- [ ] Enable SSL/TLS
- [ ] Configure firewall rules
- [ ] Enable rate limiting
- [ ] Implement authentication
- [ ] Set up CORS properly
- [ ] Enable Helmet.js security headers
- [ ] Regular security updates
- [ ] Database encryption at rest
- [ ] Secure environment variables
- [ ] Enable audit logging
- [ ] Implement backup strategy

---

## Maintenance

### Regular Tasks

**Daily**:
- Monitor error logs
- Check system health
- Review critical alerts

**Weekly**:
- Database backup verification
- Performance metrics review
- Security patch updates

**Monthly**:
- Full system backup
- Capacity planning review
- Security audit
- Dependency updates

### Scaling

**Horizontal Scaling**:
```bash
# Docker Compose
docker-compose up -d --scale backend=3

# Kubernetes
kubectl scale deployment opssightai-backend --replicas=5 -n opssightai
```

**Vertical Scaling**:
- Increase container resources
- Upgrade database instance
- Add read replicas

---

## Support & Resources

### Documentation
- API Documentation: `/api/docs` (Swagger)
- User Guide: `USER_GUIDE.md`
- Architecture: `ARCHITECTURE.md`

### Contact
- Technical Support: support@opssightai.com
- Security Issues: security@opssightai.com

### Useful Commands
```bash
# Quick health check
curl http://localhost:4000/api/health | jq

# View all assets
curl http://localhost:4000/api/assets | jq

# Check notification count
curl "http://localhost:4000/api/notifications?userId=<uuid>&unreadOnly=true" | jq '.total'

# Generate executive summary
curl http://localhost:4000/api/summary/PLANT-001 | jq '.summary.overallHealthScore'
```

---

## Version History

- **v1.0.0** (2026-02-08): Initial production release
  - Core features: Asset management, Risk scoring, Anomaly detection
  - Executive summary dashboard
  - Notification system
  - Charts and visualizations

---

**Last Updated**: February 8, 2026  
**Maintained By**: OpsSight AI Team
