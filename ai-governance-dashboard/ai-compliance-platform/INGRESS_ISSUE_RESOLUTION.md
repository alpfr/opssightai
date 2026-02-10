# AI Compliance Platform - Ingress Issue Resolution

**Issue**: 502 Bad Gateway when accessing via hostname  
**Root Cause**: GKE Ingress Controller doesn't support cross-namespace service routing with ExternalName services

---

## Current Situation

The AI Compliance Platform is deployed in the `ai-compliance` namespace, while OpsSightAI is in the `opssightai` namespace. The shared ingress in the `opssightai` namespace cannot properly route to services in a different namespace using ExternalName services.

### What We Tried
1. ✅ ExternalName services - Created but GKE Ingress doesn't support them
2. ✅ Headless services with endpoints - GKE Ingress health checks fail
3. ✅ Services with ClusterIP endpoints - Still shows "Unknown" health status

### Current Status
- **Pods**: ✅ All running healthy
- **Services**: ✅ Working within namespace
- **Ingress**: ❌ Cross-namespace routing not working

---

## Solutions

### Solution 1: Use Port Forward (Current Workaround) ✅

**This works perfectly for testing and development:**

```bash
# Frontend
kubectl port-forward -n ai-compliance deployment/ai-compliance-frontend 3000:3000
# Access: http://localhost:3000

# Backend
kubectl port-forward -n ai-compliance statefulset/ai-compliance-backend 8000:8000
# Access: http://localhost:8000
```

### Solution 2: Move to Same Namespace (Recommended) ⭐

Move AI Compliance to the `opssightai` namespace:

```bash
# Export current deployment
kubectl get all -n ai-compliance -o yaml > ai-compliance-backup.yaml

# Delete from ai-compliance namespace
helm uninstall ai-compliance -n ai-compliance

# Redeploy to opssightai namespace
helm install ai-compliance ./ai-compliance-platform/k8s/helm/ai-compliance \
  --namespace opssightai \
  --values ./ai-compliance-platform/k8s/helm/ai-compliance/values-sqlite.yaml \
  --set frontend.image.repository=gcr.io/alpfr-splunk-integration/ai-compliance-frontend \
  --set frontend.image.tag=minimal \
  --set backend.image.repository=gcr.io/alpfr-splunk-integration/ai-compliance-backend \
  --set backend.image.tag=latest \
  --set backend.secrets.jwtSecret=$(openssl rand -base64 32)

# Update ingress to use local services
kubectl patch ingress opssightai-ingress-ssl -n opssightai --type=json -p='[
  {
    "op": "replace",
    "path": "/spec/rules/2/http/paths/0/backend/service/name",
    "value": "ai-compliance-backend"
  },
  {
    "op": "replace",
    "path": "/spec/rules/2/http/paths/1/backend/service/name",
    "value": "ai-compliance-frontend"
  }
]'
```

### Solution 3: Use Nginx Ingress Controller

Install Nginx Ingress Controller which supports cross-namespace routing:

```bash
# Install Nginx Ingress
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm install nginx-ingress ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace

# Create new ingress using nginx class
# (nginx supports cross-namespace routing)
```

### Solution 4: Create Proxy Pods

Deploy nginx proxy pods in opssightai namespace that forward to ai-compliance:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ai-compliance-proxy
  namespace: opssightai
spec:
  replicas: 2
  selector:
    matchLabels:
      app: ai-compliance-proxy
  template:
    metadata:
      labels:
        app: ai-compliance-proxy
    spec:
      containers:
      - name: nginx
        image: nginx:alpine
        ports:
        - containerPort: 80
        volumeMounts:
        - name: config
          mountPath: /etc/nginx/nginx.conf
          subPath: nginx.conf
      volumes:
      - name: config
        configMap:
          name: ai-compliance-proxy-config
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: ai-compliance-proxy-config
  namespace: opssightai
data:
  nginx.conf: |
    events {}
    http {
      server {
        listen 80;
        location /api {
          proxy_pass http://ai-compliance-backend.ai-compliance.svc.cluster.local:8000;
        }
        location / {
          proxy_pass http://ai-compliance-frontend.ai-compliance.svc.cluster.local:3000;
        }
      }
    }
```

---

## Recommended Approach

**For Production**: Use Solution 2 (Move to Same Namespace)

**Pros**:
- Simplest and most reliable
- No additional components
- Works with GKE Ingress
- Better resource organization

**Cons**:
- Both apps in same namespace
- Less namespace isolation

**Implementation**:
1. Backup current deployment
2. Uninstall from ai-compliance namespace
3. Reinstall in opssightai namespace
4. Update ingress to use local service names
5. Test and verify

---

## Current Workaround

Until the ingress issue is resolved, use port forwarding:

```bash
# Start port forwards in separate terminals

# Terminal 1 - Frontend
kubectl port-forward -n ai-compliance deployment/ai-compliance-frontend 3000:3000

# Terminal 2 - Backend  
kubectl port-forward -n ai-compliance statefulset/ai-compliance-backend 8000:8000

# Access:
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```

Or add to /etc/hosts and use kubectl proxy:
```bash
# Add to /etc/hosts
127.0.0.1 compliance.local

# Start kubectl proxy
kubectl proxy --port=8001

# Access via proxy
# http://localhost:8001/api/v1/namespaces/ai-compliance/services/ai-compliance-frontend:3000/proxy/
```

---

## Testing

### Verify Pods are Healthy
```bash
kubectl get pods -n ai-compliance
# All should be Running with 1/1 Ready
```

### Test Backend Directly
```bash
kubectl port-forward -n ai-compliance statefulset/ai-compliance-backend 8000:8000 &
curl http://localhost:8000
# Expected: {"message":"AI Compliance Platform API is running","version":"1.0.0"}
kill %1
```

### Test Frontend Directly
```bash
kubectl port-forward -n ai-compliance deployment/ai-compliance-frontend 3000:3000 &
curl http://localhost:3000
# Expected: HTML content
kill %1
```

---

## Next Steps

1. **Immediate**: Use port-forward for testing
2. **Short-term**: Move to same namespace (opssightai)
3. **Long-term**: Consider service mesh for better cross-namespace routing

---

## Summary

The AI Compliance Platform is **fully deployed and working**. The only issue is the ingress cross-namespace routing, which is a limitation of GKE Ingress Controller. The application can be accessed via port-forward, and moving to the same namespace will resolve the ingress issue permanently.

**Status**: 🟡 Deployed but ingress needs adjustment  
**Workaround**: ✅ Port-forward works perfectly  
**Permanent Fix**: Move to opssightai namespace
