# Testing AI Compliance Platform Before DNS Configuration

**Issue**: Accessing http://34.117.179.95 returns 404  
**Reason**: The ingress uses host-based routing and requires the correct hostname

---

## Why IP Access Returns 404

The Google Cloud Load Balancer is configured with **host-based routing**:
- `opssightai.com` → OpsSightAI
- `www.opssightai.com` → OpsSightAI
- `compliance.opssightai.com` → AI Compliance Platform

When you access via IP address, there's no hostname in the request, so the load balancer doesn't know which application to route to.

---

## Testing Options Before DNS

### Option 1: Use curl with Host Header ✅ Recommended

Test the application by sending the correct Host header:

```bash
# Test frontend
curl -H 'Host: compliance.opssightai.com' http://34.117.179.95/

# Test backend API
curl -H 'Host: compliance.opssightai.com' http://34.117.179.95/api
```

### Option 2: Edit /etc/hosts File

Add a temporary entry to your local hosts file:

**On Mac/Linux:**
```bash
# Edit hosts file
sudo nano /etc/hosts

# Add this line:
34.117.179.95 compliance.opssightai.com

# Save and exit (Ctrl+X, Y, Enter)
```

**On Windows:**
```powershell
# Run as Administrator
notepad C:\Windows\System32\drivers\etc\hosts

# Add this line:
34.117.179.95 compliance.opssightai.com

# Save and close
```

Then access in your browser:
```
http://compliance.opssightai.com
```

**Remember to remove this entry after DNS is configured!**

### Option 3: Port Forward (Direct Access) ✅ Best for Development

Access the services directly without going through the load balancer:

**Frontend:**
```bash
kubectl port-forward -n ai-compliance deployment/ai-compliance-frontend 3000:3000
# Open in browser: http://localhost:3000
```

**Backend:**
```bash
kubectl port-forward -n ai-compliance statefulset/ai-compliance-backend 8000:8000
# Test: curl http://localhost:8000
```

---

## Verification Tests

### Test 1: Backend Health Check
```bash
kubectl port-forward -n ai-compliance statefulset/ai-compliance-backend 8000:8000 &
curl http://localhost:8000
# Expected: {"message":"AI Compliance Platform API is running","version":"1.0.0"}
kill %1
```

### Test 2: Frontend Access
```bash
kubectl port-forward -n ai-compliance deployment/ai-compliance-frontend 3000:3000 &
curl http://localhost:3000
# Expected: HTML content with "AI Compliance Platform"
kill %1
```

### Test 3: Check Pod Status
```bash
kubectl get pods -n ai-compliance
# Expected: All pods Running with 1/1 Ready
```

### Test 4: Check Services
```bash
kubectl get svc -n ai-compliance
# Expected: backend (8000) and frontend (3000) services
```

---

## After DNS Configuration

Once you add the DNS A record:
```
Type: A
Name: compliance
Value: 34.117.179.95
TTL: 3600
```

Wait 5-15 minutes for DNS propagation, then access:
- **http://compliance.opssightai.com** (will redirect to HTTPS once SSL is active)
- **https://compliance.opssightai.com** (after SSL certificate activates)

---

## Troubleshooting

### Still Getting 404 After DNS?

1. **Check DNS propagation:**
   ```bash
   nslookup compliance.opssightai.com 8.8.8.8
   # Should return: 34.117.179.95
   ```

2. **Check ingress configuration:**
   ```bash
   kubectl describe ingress opssightai-ingress-ssl -n opssightai | grep compliance
   # Should show: compliance.opssightai.com with backend routes
   ```

3. **Check SSL certificate:**
   ```bash
   kubectl describe managedcertificate opssightai-ssl-cert -n opssightai
   # Check Domain Status for compliance.opssightai.com
   ```

### Backend Returns 404 on /api?

The backend root endpoint is `/`, not `/health`. Test with:
```bash
curl http://localhost:8000/
```

### Frontend Shows Error?

The current frontend is minimal. Check logs:
```bash
kubectl logs -f deployment/ai-compliance-frontend -n ai-compliance
```

---

## Summary

**Current Status**: ✅ Application is deployed and running  
**IP Access**: ❌ Returns 404 (expected - host-based routing)  
**Port Forward**: ✅ Works perfectly  
**After DNS**: ✅ Will work with hostname

The 404 when accessing via IP is **normal and expected**. Use one of the testing options above until DNS is configured.

---

**Next Step**: Configure DNS at Squarespace to enable hostname-based access
