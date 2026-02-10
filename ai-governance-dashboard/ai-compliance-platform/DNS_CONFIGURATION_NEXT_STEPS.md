# DNS Configuration - Next Steps

## ✅ Completed

1. **Reserved Static IP**: `136.110.221.17`
   - Name: `ai-compliance-ip`
   - Type: Global IPv4
   - Status: Reserved

2. **Updated Configuration Files**:
   - ✅ `values-sqlite.yaml` - Domain changed to `aicompliance.opssightai.com`
   - ✅ `managed-certificate.yaml` - Created for SSL certificate
   - ✅ CORS origins updated to include new domain

## 🎯 Action Required: Update DNS

You need to update your DNS records for `opssightai.com`:

### DNS Record to Create/Update

**Go to your DNS provider (Squarespace or wherever opssightai.com is hosted):**

```
Type: A
Name: aicompliance
Value: 136.110.221.17
TTL: 3600 (1 hour)
```

This will make `aicompliance.opssightai.com` point to your new static IP.

### How to Update DNS on Squarespace

1. Log in to Squarespace
2. Go to Settings → Domains → opssightai.com
3. Click "DNS Settings"
4. Add a new A record:
   - **Host**: `aicompliance`
   - **Data**: `136.110.221.17`
   - **TTL**: 3600
5. Save changes

### Verify DNS Propagation

After updating DNS, wait 5-10 minutes and verify:

```bash
# Check if DNS is propagated
nslookup aicompliance.opssightai.com

# Should return: 136.110.221.17
```

## 🚀 After DNS is Updated

Once DNS is pointing to the new IP, deploy the updated configuration:

```bash
# Navigate to helm chart directory
cd ai-compliance-platform/k8s/helm/ai-compliance

# Deploy with updated configuration
helm upgrade ai-compliance . \
  --namespace ai-compliance \
  --values values-sqlite.yaml \
  --set backend.secrets.jwtSecret="$(openssl rand -base64 32)" \
  --wait

# Check deployment status
kubectl get ingress,managedcertificate -n ai-compliance

# Watch certificate provisioning (takes 15-60 minutes)
kubectl get managedcertificate ai-compliance-ssl-cert -n ai-compliance -w
```

## 📊 Expected Timeline

| Step | Duration | Status |
|------|----------|--------|
| Reserve Static IP | Instant | ✅ Complete |
| Update DNS Records | 5 minutes | ⏳ **Action Required** |
| DNS Propagation | 5-60 minutes | ⏳ Waiting |
| Deploy Updated Config | 2-5 minutes | ⏳ Pending |
| SSL Certificate Provisioning | 15-60 minutes | ⏳ Pending |
| **Total Time** | **30-120 minutes** | |

## 🔍 Monitoring Progress

### Check DNS Propagation
```bash
# Quick check
dig aicompliance.opssightai.com +short

# Detailed check
dig aicompliance.opssightai.com

# Check from multiple locations
curl https://dns.google/resolve?name=aicompliance.opssightai.com
```

### Check SSL Certificate Status
```bash
# View certificate status
kubectl describe managedcertificate ai-compliance-ssl-cert -n ai-compliance

# Watch for status changes
kubectl get managedcertificate -n ai-compliance -w
```

Certificate status meanings:
- **Provisioning**: Certificate creation started
- **FailedNotVisible**: DNS not propagated yet (normal, wait for DNS)
- **Active**: ✅ Certificate ready, HTTPS working!

### Check Ingress Status
```bash
# View ingress details
kubectl get ingress -n ai-compliance

# Should show:
# NAME                    HOSTS                        ADDRESS          PORTS
# ai-compliance-ingress   aicompliance.opssightai.com  136.110.221.17   80, 443
```

## 🎉 When Complete

Once SSL certificate is **Active**, test your platform:

```bash
# Test HTTP
curl -I http://aicompliance.opssightai.com

# Test HTTPS
curl -I https://aicompliance.opssightai.com

# Test API
curl https://aicompliance.opssightai.com/api/

# Test in browser
open https://aicompliance.opssightai.com
```

### Login Credentials
- **Admin**: admin / admin123
- **Inspector**: inspector / inspector123

## 📝 Documentation Updates Needed

After everything is working, update these files:

1. **README.md**
   - Change URL from `http://136.110.182.171/` to `https://aicompliance.opssightai.com`
   
2. **MVP_OVERVIEW.md**
   - Update deployment section with new URL
   
3. **DEPLOYMENT_COMPLETE.md**
   - Update access information

4. **Commit changes to git**
   ```bash
   git add .
   git commit -m "feat: Configure DNS and SSL for aicompliance.opssightai.com"
   git push origin scripts-01
   ```

## ⚠️ Important Notes

1. **Old IP (136.110.182.171)** will stop working after we deploy the new configuration
2. **DNS propagation** can take up to 48 hours globally (usually 5-60 minutes)
3. **SSL certificate** requires DNS to be working first
4. **Don't delete** the old ingress until the new one is working

## 🆘 Troubleshooting

### DNS Not Resolving
```bash
# Check if DNS record exists
dig aicompliance.opssightai.com @8.8.8.8

# If not found, double-check DNS provider settings
```

### Certificate Stuck in "FailedNotVisible"
- Wait for DNS propagation (can take up to 1 hour)
- Verify DNS points to correct IP: `136.110.221.17`
- Check domain ownership in GCP

### 502 Bad Gateway After Deployment
```bash
# Check pod status
kubectl get pods -n ai-compliance

# Check logs
kubectl logs -n ai-compliance deployment/ai-compliance-backend
kubectl logs -n ai-compliance deployment/ai-compliance-frontend
```

---

## 📞 Current Status Summary

✅ **Static IP Reserved**: 136.110.221.17  
✅ **Configuration Updated**: Domain, CORS, SSL certificate  
⏳ **Waiting For**: DNS update (your action required)  
⏳ **Next Step**: Deploy updated configuration after DNS is updated  

**Estimated Time to Production**: 30-120 minutes after DNS update

---

**Questions?** Check the detailed guide in `DNS_SSL_SETUP.md`
