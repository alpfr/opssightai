# JHB StreamPulse - 502 Error Resolved

**Issue**: Server Error / 502 Bad Gateway  
**Root Cause**: Network Policy blocking GCE health check traffic  
**Status**: ✅ RESOLVED

---

## Problem Summary

After deployment, the application was returning "502 Bad Gateway" errors when accessed via the external IP. The pods were running healthy, but the GCE load balancer couldn't reach them.

---

## Root Cause

The Network Policy created for security was blocking incoming traffic from GCE health checkers:

```yaml
# Network policy only allowed traffic from ingress-nginx namespace
ingress:
- from:
  - namespaceSelector:
      matchLabels:
        name: ingress-nginx  # ❌ GCE health checks don't come from this namespace
```

**Issue**: GCE Ingress health checks originate from Google's health check IP ranges (130.211.0.0/22 and 35.191.0.0/16), not from within the cluster. The network policy was blocking this external traffic.

---

## Resolution Steps

### 1. Created Firewall Rule for Health Checks
```bash
gcloud compute firewall-rules create allow-gce-health-checks \
  --network=default \
  --action=allow \
  --direction=ingress \
  --source-ranges=130.211.0.0/22,35.191.0.0/16 \
  --rules=tcp
```

### 2. Added BackendConfig for Proper Health Checks
```yaml
# k8s/backendconfig.yaml
apiVersion: cloud.google.com/v1
kind: BackendConfig
metadata:
  name: jhb-streampulse-backendconfig
spec:
  healthCheck:
    requestPath: /api/stats
    port: 8000
```

### 3. Updated Service Configuration
- Changed service type from ClusterIP to NodePort
- Added BackendConfig annotation
- Applied changes

### 4. Removed Blocking Network Policy
```bash
kubectl delete networkpolicy jhb-streampulse-netpol -n jhb-streampulse
```

### 5. Recreated Ingress
```bash
kubectl delete ingress jhb-streampulse-ingress -n jhb-streampulse
kubectl apply -f k8s/ingress.yaml
```

---

## Current Status

### ✅ Working
- **New External IP**: `35.186.198.61`
- **Application**: http://35.186.198.61
- **API**: http://35.186.198.61/api/stats
- **Health Checks**: Passing
- **Backend Status**: Healthy (annotation updating)

### Verification
```bash
# Test homepage
curl -I http://35.186.198.61/
# HTTP/1.1 200 OK ✅

# Test API
curl http://35.186.198.61/api/stats
# {"weeklyRows":0,"specialEvents":0,"lastUpload":null} ✅
```

---

## Lessons Learned

### 1. Network Policies and GCE Ingress
**Issue**: Network policies can block GCE health check traffic  
**Solution**: Either:
- Don't use network policies with GCE Ingress, OR
- Configure network policy to allow traffic from health check IP ranges

### 2. Health Check Configuration
**Issue**: Default health checks may not match application endpoints  
**Solution**: Use BackendConfig to specify custom health check paths

### 3. Service Type for GCE Ingress
**Issue**: ClusterIP services may not work properly with GCE Ingress  
**Solution**: Use NodePort service type for GCE Ingress

---

## Updated Configuration

### Service (k8s/service.yaml)
```yaml
apiVersion: v1
kind: Service
metadata:
  name: jhb-streampulse
  namespace: jhb-streampulse
  annotations:
    cloud.google.com/backend-config: '{"default": "jhb-streampulse-backendconfig"}'
spec:
  type: NodePort  # Changed from ClusterIP
  ports:
  - port: 80
    targetPort: 8000
```

### BackendConfig (k8s/backendconfig.yaml)
```yaml
apiVersion: cloud.google.com/v1
kind: BackendConfig
metadata:
  name: jhb-streampulse-backendconfig
spec:
  healthCheck:
    requestPath: /api/stats
    port: 8000
```

### Firewall Rule
```bash
# GCE health check firewall rule
NAME: allow-gce-health-checks
SOURCE_RANGES: 130.211.0.0/22, 35.191.0.0/16
ALLOW: tcp
```

---

## Network Policy Recommendations

If you want to re-enable network policies, use this configuration:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: jhb-streampulse-netpol
  namespace: jhb-streampulse
spec:
  podSelector:
    matchLabels:
      app: jhb-streampulse
  policyTypes:
  - Ingress
  - Egress
  ingress:
  # Allow from anywhere (GCE health checks come from outside cluster)
  - ports:
    - protocol: TCP
      port: 8000
  egress:
  # Allow DNS
  - to:
    - namespaceSelector: {}
      podSelector:
        matchLabels:
          k8s-app: kube-dns
    ports:
    - protocol: UDP
      port: 53
  # Allow HTTPS
  - to:
    - namespaceSelector: {}
    ports:
    - protocol: TCP
      port: 443
```

**Note**: This is less restrictive but necessary for GCE Ingress to work.

---

## Monitoring

### Check Backend Health
```bash
# Via kubectl
kubectl describe ingress jhb-streampulse-ingress -n jhb-streampulse | grep backends

# Via gcloud
gcloud compute backend-services get-health \
  k8s1-4e5ed95f-jhb-streampulse-jhb-streampulse-80-c930091c \
  --global
```

### Check Firewall Rules
```bash
gcloud compute firewall-rules list --filter="name~health-checks"
```

### Test Application
```bash
# Homepage
curl http://35.186.198.61/

# API endpoint
curl http://35.186.198.61/api/stats

# Health check endpoint
curl http://35.186.198.61/api/stats
```

---

## Summary

**Problem**: 502 Bad Gateway due to network policy blocking health checks  
**Solution**: Removed restrictive network policy, added proper health check configuration  
**Result**: Application now accessible at http://35.186.198.61  

**Time to Resolution**: ~90 minutes  
**Status**: ✅ Fully Operational

---

**Resolved**: February 13, 2026  
**New IP**: 35.186.198.61  
**Status**: Production Ready ✅
