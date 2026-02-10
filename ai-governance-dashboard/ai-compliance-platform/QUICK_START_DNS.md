# Quick Start: DNS Configuration

## 🎯 What We Just Did

1. ✅ Reserved static IP: **136.110.221.17**
2. ✅ Updated configuration for domain: **aicompliance.opssightai.com**
3. ✅ Created SSL certificate configuration
4. ✅ Committed changes to git

## 🚀 What You Need to Do Now

### Step 1: Update DNS (5 minutes)

Go to your DNS provider and add this A record:

```
Type: A
Name: aicompliance
Value: 136.110.221.17
TTL: 3600
```

**Result**: `aicompliance.opssightai.com` will point to your GKE cluster

### Step 2: Wait for DNS Propagation (5-60 minutes)

Check if DNS is working:

```bash
nslookup aicompliance.opssightai.com
# Should return: 136.110.221.17
```

### Step 3: Deploy Updated Configuration (5 minutes)

Once DNS is working, run:

```bash
cd ai-compliance-platform/k8s/helm/ai-compliance

helm upgrade ai-compliance . \
  --namespace ai-compliance \
  --values values-sqlite.yaml \
  --set backend.secrets.jwtSecret="$(openssl rand -base64 32)" \
  --wait
```

### Step 4: Wait for SSL Certificate (15-60 minutes)

Monitor certificate provisioning:

```bash
kubectl get managedcertificate ai-compliance-ssl-cert -n ai-compliance -w
```

Wait for status to change to **Active**.

### Step 5: Test Your Platform

```bash
# Test HTTPS
curl -I https://aicompliance.opssightai.com

# Open in browser
open https://aicompliance.opssightai.com
```

Login with: **admin / admin123**

## ⏱️ Total Time

- **DNS Update**: 5 minutes (your action)
- **DNS Propagation**: 5-60 minutes (automatic)
- **Deployment**: 5 minutes (your action)
- **SSL Provisioning**: 15-60 minutes (automatic)

**Total**: 30-130 minutes

## 📞 Need Help?

- **Detailed Guide**: See `DNS_SSL_SETUP.md`
- **Next Steps**: See `DNS_CONFIGURATION_NEXT_STEPS.md`
- **Troubleshooting**: Check the guides above

---

**Current Status**: ✅ Configuration ready, waiting for DNS update
