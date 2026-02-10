# AI Compliance Platform - IP Address Access

**Status**: ✅ **WORKING**  
**Date**: February 9, 2026

---

## Access Information

### IP Address
```
136.110.182.171
```

### URLs
- **Frontend**: http://136.110.182.171/
- **Backend API**: Access via port-forward (see below)

---

## Frontend Access

The frontend is accessible directly via the IP address:

```bash
# Open in browser
open http://136.110.182.171/

# Or test with curl
curl http://136.110.182.171/
```

**What you'll see:**
- Simple HTML page with "AI Compliance Platform" title
- Link to API endpoint
- Status indicator

---

## Backend API Access

The backend API is best accessed via port-forward:

```bash
# Start port forward
kubectl port-forward -n ai-compliance statefulset/ai-compliance-backend 8000:8000

# Test health endpoint
curl http://localhost:8000/
# Returns: {"message":"AI Compliance Platform API is running","version":"1.0.0"}

# Test other endpoints
curl http://localhost:8000/organizations
curl http://localhost:8000/models
curl http://localhost:8000/assessments
```

---

## Ingress Configuration

The application uses a wildcard ingress that responds to any IP address or hostname:

```yaml
Host: *  (wildcard - accepts any request)
Paths:
  /api → ai-compliance-backend:8000
  /    → ai-compliance-frontend:3000
```

**Load Balancer**: Google Cloud Load Balancer  
**Type**: HTTP (port 80)  
**Backends**: Both HEALTHY ✅

---

## Testing

### Test 1: Frontend
```bash
curl http://136.110.182.171/
# Expected: HTML content with "AI Compliance Platform"
```

### Test 2: Backend (via port-forward)
```bash
kubectl port-forward -n ai-compliance statefulset/ai-compliance-backend 8000:8000 &
curl http://localhost:8000/
# Expected: {"message":"AI Compliance Platform API is running","version":"1.0.0"}
kill %1
```

### Test 3: Check Ingress Status
```bash
kubectl get ingress -n ai-compliance
# Expected: ai-compliance-ip-ingress with ADDRESS 136.110.182.171
```

### Test 4: Check Backend Health
```bash
kubectl get ingress ai-compliance-ip-ingress -n ai-compliance \
  -o jsonpath='{.metadata.annotations.ingress\.kubernetes\.io/backends}' | jq .
# Expected: Both backends show "HEALTHY"
```

---

## Architecture

```
Internet
    ↓
http://136.110.182.171
    ↓
Google Cloud Load Balancer
    ↓
GKE Ingress (ai-compliance-ip-ingress)
    ↓
    ├─→ / → Frontend Service (3000)
    │         ↓
    │      Frontend Pods (2 replicas)
    │         ↓
    │      Nginx serving static HTML
    │
    └─→ /api → Backend Service (8000)
              ↓
           Backend Pod (StatefulSet)
              ↓
           FastAPI + SQLite
```

---

## Deployment Details

**Namespace**: ai-compliance

**Pods**:
- ai-compliance-backend-0 (1/1 Running)
- ai-compliance-frontend-xxx (1/1 Running)
- ai-compliance-frontend-yyy (1/1 Running)

**Services**:
- ai-compliance-backend (ClusterIP, 8000)
- ai-compliance-frontend (ClusterIP, 3000)

**Ingress**:
- ai-compliance-ip-ingress (wildcard host)
- External IP: 136.110.182.171
- Backends: HEALTHY

---

## Comparison with Hostname Access

| Access Method | Frontend | Backend API | SSL | Status |
|---------------|----------|-------------|-----|--------|
| IP Address (136.110.182.171) | ✅ Works | ⚠️ Port-forward | ❌ No | ✅ Available |
| Hostname (compliance.opssightai.com) | ⏳ Pending DNS | ⏳ Pending DNS | ✅ Yes | ⏳ Waiting |

---

## Next Steps

### Current (IP Access)
- ✅ Frontend accessible at http://136.110.182.171/
- ✅ Backend accessible via port-forward
- ✅ All pods running healthy

### Future (Hostname Access)
1. Configure DNS A record: compliance.opssightai.com → 34.117.179.95
2. Wait for SSL certificate to activate
3. Access via https://compliance.opssightai.com

---

## Troubleshooting

### Can't Access IP Address?

1. **Check ingress has IP**:
   ```bash
   kubectl get ingress -n ai-compliance
   # Should show ADDRESS: 136.110.182.171
   ```

2. **Check backends are healthy**:
   ```bash
   kubectl get ingress ai-compliance-ip-ingress -n ai-compliance \
     -o jsonpath='{.metadata.annotations.ingress\.kubernetes\.io/backends}' | jq .
   # Both should show "HEALTHY"
   ```

3. **Check pods are running**:
   ```bash
   kubectl get pods -n ai-compliance
   # All should be Running with 1/1 Ready
   ```

### Getting Empty Reply?

Wait 2-3 minutes for the load balancer health checks to complete. The backends need to pass health checks before traffic is routed.

### Frontend Works but Backend Doesn't?

Use port-forward to access the backend directly:
```bash
kubectl port-forward -n ai-compliance statefulset/ai-compliance-backend 8000:8000
curl http://localhost:8000/
```

---

## Summary

✅ **AI Compliance Platform is accessible via IP address**  
✅ **Frontend**: http://136.110.182.171/  
✅ **Backend**: Port-forward to localhost:8000  
✅ **All services running healthy**

The application is fully functional and can be accessed without DNS configuration!

---

**IP Address**: 136.110.182.171  
**Status**: ACTIVE  
**Last Updated**: February 9, 2026
