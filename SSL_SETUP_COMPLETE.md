# OpsSightAI - SSL/HTTPS Setup Complete

**Date**: February 8, 2026  
**Status**: ✅ SSL Certificate Provisioning

---

## 🔒 SSL Configuration

### Static IP Address Reserved
- **IP Address**: `34.117.179.95`
- **Name**: `opssightai-ip`
- **Type**: Global Static IP

### SSL Certificate Created
- **Type**: Google-managed SSL certificate
- **Domains**: 
  - opssightai.com
  - www.opssightai.com
- **Status**: Provisioning (takes 15-60 minutes)
- **Auto-renewal**: Yes (automatic)

### Ingress Configured
- **Name**: `opssightai-ingress-ssl`
- **Load Balancer**: Google Cloud Load Balancer
- **Protocols**: HTTP (80) and HTTPS (443)

---

## 📋 DNS Configuration Required

**IMPORTANT**: Update your DNS records to point to the new static IP address.

### DNS Records to Add/Update

In your domain registrar (where you registered opssightai.com), update these records:

#### 1. Root Domain (opssightai.com)
```
Type: A
Name: @ (or leave blank)
Value: 34.117.179.95
TTL: 3600
```

#### 2. WWW Subdomain (www.opssightai.com)
```
Type: A
Name: www
Value: 34.117.179.95
TTL: 3600
```

---

## ⏱️ Timeline

### Immediate (Now)
1. ✅ Static IP reserved: `34.117.179.95`
2. ✅ SSL certificate requested
3. ✅ Ingress configured with SSL

### Within 5-60 Minutes
- DNS propagation (after you update DNS records)
- SSL certificate provisioning
- HTTPS becomes available

### After DNS Propagates
Your site will be accessible at:
- ✅ http://opssightai.com (redirects to HTTPS)
- ✅ https://opssightai.com (secure)
- ✅ http://www.opssightai.com (redirects to HTTPS)
- ✅ https://www.opssightai.com (secure)

---

## 🔍 Check Status

### Check SSL Certificate Status
```bash
kubectl describe managedcertificate opssightai-ssl-cert -n opssightai
```

Look for:
- `Certificate Status: Active` (when ready)
- `Domain Status: Active` for both domains

### Check Ingress Status
```bash
kubectl get ingress opssightai-ingress-ssl -n opssightai
```

Wait for the `ADDRESS` column to show: `34.117.179.95`

### Check DNS Propagation
Visit: https://dnschecker.org
- Enter: `opssightai.com`
- Check that it resolves to: `34.117.179.95`

---

## 🚨 Troubleshooting

### SSL Certificate Stuck in "Provisioning"

**Common Causes**:
1. DNS not configured yet
2. DNS not propagated
3. Domain not pointing to the correct IP

**Solution**:
1. Verify DNS records point to `34.117.179.95`
2. Wait for DNS propagation (check dnschecker.org)
3. Google will automatically provision the certificate once DNS is verified

### Certificate Status Messages

| Status | Meaning |
|--------|---------|
| `Provisioning` | Certificate is being created (normal, wait 15-60 min) |
| `FailedNotVisible` | DNS not configured or not propagated yet |
| `Active` | Certificate is ready and HTTPS is working |

### Check Certificate Status
```bash
# Detailed status
kubectl describe managedcertificate opssightai-ssl-cert -n opssightai

# Quick status check
kubectl get managedcertificate opssightai-ssl-cert -n opssightai -o jsonpath='{.status.certificateStatus}'
```

---

## 📊 Current Configuration

### Old Configuration (Temporary)
- **IP**: `34.57.180.112` (LoadBalancer service)
- **Access**: http://34.57.180.112
- **Status**: Still working (will be deprecated)

### New Configuration (Production)
- **IP**: `34.117.179.95` (Global Static IP)
- **Access**: https://opssightai.com
- **Status**: Provisioning

---

## 🔄 Migration Steps

### Step 1: Update DNS (Do This Now)
Update your DNS records to point to `34.117.179.95`

### Step 2: Wait for DNS Propagation (5 min - 48 hours)
Check status at: https://dnschecker.org

### Step 3: Wait for SSL Certificate (15-60 minutes after DNS)
```bash
kubectl get managedcertificate opssightai-ssl-cert -n opssightai
```

### Step 4: Verify HTTPS Works
Once certificate status is "Active":
- Visit: https://opssightai.com
- Check for green padlock in browser
- Verify certificate is valid

### Step 5: Remove Old LoadBalancer (Optional)
Once HTTPS is working, you can remove the old LoadBalancer:
```bash
kubectl patch service opssightai-frontend -n opssightai -p '{"spec":{"type":"ClusterIP"}}'
```

---

## 🎯 Expected Timeline

| Time | Event |
|------|-------|
| Now | DNS records updated by you |
| +5-60 min | DNS propagates globally |
| +15-60 min | SSL certificate provisioned |
| +30-120 min | HTTPS fully working |

---

## ✅ Verification Checklist

- [ ] DNS A record for opssightai.com points to 34.117.179.95
- [ ] DNS A record for www.opssightai.com points to 34.117.179.95
- [ ] DNS propagation complete (check dnschecker.org)
- [ ] SSL certificate status is "Active"
- [ ] https://opssightai.com loads successfully
- [ ] https://www.opssightai.com loads successfully
- [ ] Browser shows green padlock (secure connection)
- [ ] HTTP automatically redirects to HTTPS

---

## 📞 Support Commands

### View All Resources
```bash
kubectl get all,ingress,managedcertificate -n opssightai
```

### View Ingress Details
```bash
kubectl describe ingress opssightai-ingress-ssl -n opssightai
```

### View Certificate Details
```bash
kubectl describe managedcertificate opssightai-ssl-cert -n opssightai
```

### View Static IP
```bash
gcloud compute addresses describe opssightai-ip --global
```

---

## 🎉 Success Criteria

Your SSL setup is complete when:

1. ✅ DNS resolves opssightai.com to 34.117.179.95
2. ✅ Certificate status shows "Active"
3. ✅ https://opssightai.com loads with green padlock
4. ✅ HTTP requests redirect to HTTPS
5. ✅ All API endpoints work over HTTPS

---

**Next Step**: Update your DNS records to point to `34.117.179.95` and wait for propagation!

**Status**: 🟡 Waiting for DNS configuration
