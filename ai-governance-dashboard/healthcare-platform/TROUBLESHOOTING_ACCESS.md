# Vantedge Health - Access Troubleshooting Guide

**Issue**: Cannot access the healthcare platform via IP or DNS

**External IP**: `34.111.20.151`

---

## ✅ Server Status (Confirmed Working)

From the server side, everything is operational:
- ✅ Pods: 3/3 Running
- ✅ Service: Active
- ✅ Ingress: Configured with IP 34.111.20.151
- ✅ HTTP Response: 200 OK (tested from server)
- ✅ All pages responding correctly

---

## 🔍 Troubleshooting Steps

### Step 1: Test from Command Line

Try these commands from your terminal:

```bash
# Test 1: Direct IP access
curl -v http://34.111.20.151/

# Test 2: With Host header
curl -v -H "Host: vantedgehealth.com" http://34.111.20.151/

# Test 3: Check DNS resolution (if you've updated DNS)
nslookup vantedgehealth.com

# Test 4: Ping the IP
ping 34.111.20.151
```

**Expected Results**:
- Test 1 & 2: Should return HTML content with "200 OK"
- Test 3: Should show the IP 34.111.20.151
- Test 4: Should get responses

---

### Step 2: Check Browser Issues

If curl works but browser doesn't:

**Clear Browser Cache**:
- Chrome: Cmd+Shift+Delete (Mac) or Ctrl+Shift+Delete (Windows)
- Safari: Cmd+Option+E
- Firefox: Cmd+Shift+Delete

**Try Incognito/Private Mode**:
- This bypasses cache and extensions

**Disable Browser Extensions**:
- Ad blockers or security extensions might block the connection

**Check Browser Console**:
- Open Developer Tools (F12)
- Check Console tab for errors
- Check Network tab to see if requests are being made

---

### Step 3: Check Network/Firewall

**Corporate Network/VPN**:
- Some corporate networks block external IPs
- Try disconnecting from VPN
- Try from a different network (mobile hotspot)

**Firewall**:
- Check if your firewall is blocking port 80
- Temporarily disable firewall to test

**ISP Restrictions**:
- Some ISPs block certain IP ranges
- Try from mobile data instead of WiFi

---

### Step 4: DNS Issues (If Using Domain)

If you've updated DNS but it's not working:

**Check DNS Propagation**:
```bash
# Check if DNS has propagated
dig vantedgehealth.com
dig www.vantedgehealth.com

# Or use online tools
# https://www.whatsmydns.net/
```

**DNS Cache**:
```bash
# Flush DNS cache

# macOS
sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder

# Windows
ipconfig /flushdns

# Linux
sudo systemd-resolve --flush-caches
```

**Use Google DNS**:
- Try using 8.8.8.8 as your DNS server temporarily

---

### Step 5: Test from Different Location

**Online Tools**:
1. **Down For Everyone Or Just Me**: https://downforeveryoneorjustme.com/34.111.20.151
2. **Is It Down Right Now**: https://www.isitdownrightnow.com/
3. **Ping Test**: https://ping.eu/ping/

**From Mobile**:
- Try accessing from your phone using mobile data (not WiFi)
- This rules out local network issues

---

## 🔧 Alternative Access Methods

### Method 1: Port Forward (Guaranteed to Work)

Access the application directly through kubectl:

```bash
# Forward port from your local machine to the pod
kubectl port-forward -n vantedge-health service/vantedge-health 8080:80

# Then access in browser:
# http://localhost:8080
```

This bypasses the ingress entirely and connects directly to the service.

### Method 2: Use LoadBalancer Service

If ingress continues to have issues, we can expose the service directly:

```bash
# Change service type to LoadBalancer
kubectl patch service vantedge-health -n vantedge-health -p '{"spec":{"type":"LoadBalancer"}}'

# Wait a minute, then get the external IP
kubectl get service vantedge-health -n vantedge-health
```

This will give you a different external IP that bypasses the ingress.

---

## 📊 Diagnostic Information

### Check Current Status

```bash
# 1. Check ingress
kubectl get ingress -n vantedge-health
kubectl describe ingress vantedge-health-ingress -n vantedge-health

# 2. Check service
kubectl get service -n vantedge-health
kubectl describe service vantedge-health -n vantedge-health

# 3. Check pods
kubectl get pods -n vantedge-health
kubectl logs -f deployment/vantedge-health -n vantedge-health

# 4. Check endpoints
kubectl get endpoints vantedge-health -n vantedge-health

# 5. Test from within cluster
kubectl run test-pod --rm -it --image=curlimages/curl -- curl http://vantedge-health.vantedge-health.svc.cluster.local
```

### Get Detailed Logs

```bash
# Application logs
kubectl logs -n vantedge-health deployment/vantedge-health --tail=100

# Ingress controller logs
kubectl logs -n kube-system -l k8s-app=glbc --tail=100
```

---

## 🆘 Common Issues & Solutions

### Issue 1: "Connection Refused"
**Cause**: Firewall or network blocking  
**Solution**: Try from different network or use port-forward method

### Issue 2: "Connection Timeout"
**Cause**: IP not reachable from your location  
**Solution**: Check if IP is accessible: `ping 34.111.20.151`

### Issue 3: "404 Not Found"
**Cause**: Ingress routing issue  
**Solution**: Use Host header: `curl -H "Host: vantedgehealth.com" http://34.111.20.151/`

### Issue 4: "DNS Not Resolving"
**Cause**: DNS not updated or not propagated  
**Solution**: Use IP directly or wait for DNS propagation (up to 48 hours)

### Issue 5: "SSL/Certificate Error"
**Cause**: Certificate not yet provisioned  
**Solution**: Use HTTP (not HTTPS) until certificate is active

---

## ✅ Verification Checklist

Run through this checklist:

- [ ] Can ping 34.111.20.151
- [ ] Can curl http://34.111.20.151/
- [ ] Pods are running (3/3)
- [ ] Service has endpoints
- [ ] Ingress has external IP
- [ ] Tried from different network
- [ ] Tried from incognito/private browser
- [ ] Cleared browser cache
- [ ] Disabled VPN
- [ ] Checked firewall settings
- [ ] Tried port-forward method

---

## 📞 Get Help

If none of the above works, provide this information:

1. **Error Message**: Exact error you're seeing
2. **Curl Output**: Result of `curl -v http://34.111.20.151/`
3. **Ping Output**: Result of `ping 34.111.20.151`
4. **Network**: Are you on corporate network/VPN?
5. **Location**: What country/region are you in?
6. **Browser**: Which browser and version?

---

## 🎯 Quick Test Script

Run this script to test everything:

```bash
#!/bin/bash

echo "=== Vantedge Health Access Test ==="
echo ""

echo "1. Testing ping..."
ping -c 3 34.111.20.151

echo ""
echo "2. Testing HTTP access..."
curl -s -o /dev/null -w "Status: %{http_code}\n" http://34.111.20.151/

echo ""
echo "3. Testing with Host header..."
curl -s -o /dev/null -w "Status: %{http_code}\n" -H "Host: vantedgehealth.com" http://34.111.20.151/

echo ""
echo "4. Testing DNS (if configured)..."
nslookup vantedgehealth.com

echo ""
echo "5. Checking Kubernetes resources..."
kubectl get pods -n vantedge-health
kubectl get service -n vantedge-health
kubectl get ingress -n vantedge-health

echo ""
echo "=== Test Complete ==="
```

Save as `test-access.sh`, make executable (`chmod +x test-access.sh`), and run it.

---

**Last Updated**: February 12, 2026  
**IP Address**: 34.111.20.151  
**Status**: Server is operational and responding correctly
