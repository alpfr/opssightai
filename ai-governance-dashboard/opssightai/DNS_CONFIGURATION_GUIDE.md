# DNS Configuration Guide for OpsSightAI

**Domain**: opssightai.com  
**Registrar**: Squarespace Domains LLC  
**Target IP**: 34.117.179.95  
**Date**: February 9, 2026

---

## 🎯 Quick Summary

You need to update your DNS records at Squarespace to point your domain to your GKE deployment.

**Current DNS**: Points to 198.49.23.145 (Squarespace parking page)  
**Required DNS**: Should point to 34.117.179.95 (your GKE load balancer)

---

## 📋 Step-by-Step Instructions for Squarespace

### Step 1: Log into Squarespace

1. Go to: https://account.squarespace.com/
2. Log in with your Squarespace account credentials
3. Navigate to **Domains** section

### Step 2: Access DNS Settings

1. Find **opssightai.com** in your domains list
2. Click on the domain name
3. Click **DNS Settings** or **Advanced DNS Settings**
4. You should see a list of DNS records

### Step 3: Update A Records

You need to **delete or update** existing A records and add new ones:

#### Delete These Records (if they exist):
- Any A records pointing to Squarespace IPs (198.49.23.x, 198.185.159.x)
- Any A records for @ (root domain)
- Any A records for www

#### Add These New Records:

**Record 1: Root Domain**
```
Type: A
Host: @ (or leave blank, or "opssightai.com")
Value: 34.117.179.95
TTL: 3600 (or Auto)
```

**Record 2: WWW Subdomain**
```
Type: A
Host: www
Value: 34.117.179.95
TTL: 3600 (or Auto)
```

### Step 4: Save Changes

1. Click **Save** or **Apply Changes**
2. Confirm the changes if prompted
3. Note the time you made the changes

---

## ⏱️ What to Expect

### Timeline

| Time | What Happens |
|------|--------------|
| Immediately | Changes saved in Squarespace |
| 5-15 minutes | DNS starts propagating |
| 30-60 minutes | Most DNS servers updated |
| 1-2 hours | Global DNS propagation complete |
| 1.5-3 hours | SSL certificate provisioned |
| 2-3 hours | HTTPS fully working |

### Status Progression

1. **Now**: DNS points to Squarespace (198.49.23.145)
2. **After update**: DNS starts pointing to GKE (34.117.179.95)
3. **After propagation**: Google verifies domain ownership
4. **After verification**: SSL certificate becomes Active
5. **Final**: https://opssightai.com works with green padlock

---

## 🔍 How to Verify DNS Changes

### Method 1: Command Line (Mac/Linux)

```bash
# Check DNS resolution
nslookup opssightai.com 8.8.8.8

# Should show:
# Name:    opssightai.com
# Address: 34.117.179.95
```

### Method 2: Online Tool

1. Visit: https://dnschecker.org
2. Enter: `opssightai.com`
3. Select: `A` record type
4. Click: **Search**
5. Wait for results to show: `34.117.179.95` globally

### Method 3: Browser Test

Once DNS propagates, try accessing:
- http://opssightai.com (should load your app)
- http://www.opssightai.com (should load your app)

---

## 🔒 SSL Certificate Monitoring

After DNS propagates, monitor SSL certificate status:

### Check Certificate Status

```bash
# Quick status check
kubectl get managedcertificate opssightai-ssl-cert -n opssightai

# Detailed status
kubectl describe managedcertificate opssightai-ssl-cert -n opssightai | grep -A 5 "Domain Status"
```

### Certificate Status Meanings

| Status | Meaning | Action |
|--------|---------|--------|
| `Provisioning` | Certificate being created | Wait for DNS propagation |
| `FailedNotVisible` | DNS not configured/propagated | Check DNS settings |
| `Active` | Certificate ready, HTTPS working | ✅ Done! |

---

## 🚨 Troubleshooting

### Issue 1: DNS Not Updating

**Symptoms**: nslookup still shows old IP after 2+ hours

**Solutions**:
1. Clear your local DNS cache:
   ```bash
   # Mac
   sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
   
   # Linux
   sudo systemd-resolve --flush-caches
   ```

2. Check DNS at different locations using dnschecker.org
3. Verify you saved changes in Squarespace
4. Check if there are conflicting CNAME records

### Issue 2: SSL Certificate Stuck in "Provisioning"

**Symptoms**: Certificate status doesn't change to Active after 2+ hours

**Solutions**:
1. Verify DNS is fully propagated (use dnschecker.org)
2. Check domain status in certificate:
   ```bash
   kubectl describe managedcertificate opssightai-ssl-cert -n opssightai
   ```
3. Look for error messages in Events section
4. Ensure no conflicting ingress resources exist

### Issue 3: "FailedNotVisible" Status

**Symptoms**: Certificate shows FailedNotVisible status

**Solutions**:
1. DNS is not configured correctly - double-check A records
2. DNS hasn't propagated yet - wait longer
3. Verify the IP address is exactly: 34.117.179.95
4. Check for typos in domain name

### Issue 4: Site Not Loading After DNS Update

**Symptoms**: DNS resolves but site doesn't load

**Solutions**:
1. Check if pods are running:
   ```bash
   kubectl get pods -n opssightai
   ```
2. Check ingress status:
   ```bash
   kubectl get ingress -n opssightai
   ```
3. Test the temporary URL: http://34.57.180.112
4. Check backend health: http://34.57.180.112/api/health

---

## 📞 Squarespace-Specific Tips

### Finding DNS Settings

Squarespace has different interfaces depending on when you registered:

**New Interface** (2023+):
1. Domains → Click domain → DNS Settings

**Old Interface**:
1. Settings → Domains → Click domain → Advanced Settings → DNS

### Common Squarespace Issues

1. **Parking Page Still Shows**: 
   - Squarespace may cache the parking page
   - Wait 24 hours or contact Squarespace support

2. **Can't Find DNS Settings**:
   - Ensure domain is not locked
   - Check if domain transfer is in progress
   - Verify you have admin access

3. **Changes Not Saving**:
   - Try a different browser
   - Clear browser cache
   - Contact Squarespace support

### Squarespace Support

If you need help with DNS settings:
- **Help Center**: https://support.squarespace.com/hc/en-us/articles/205812378-Editing-DNS-settings
- **Live Chat**: Available in your Squarespace account
- **Email**: domains@squarespace.com

---

## ✅ Verification Checklist

Use this checklist to track your progress:

### DNS Configuration
- [ ] Logged into Squarespace account
- [ ] Accessed DNS settings for opssightai.com
- [ ] Deleted old A records (if any)
- [ ] Added A record for @ → 34.117.179.95
- [ ] Added A record for www → 34.117.179.95
- [ ] Saved changes
- [ ] Noted the time of changes

### DNS Propagation
- [ ] Waited at least 30 minutes
- [ ] Checked DNS with nslookup (shows 34.117.179.95)
- [ ] Checked DNS with dnschecker.org (shows 34.117.179.95 globally)
- [ ] Can access http://opssightai.com
- [ ] Can access http://www.opssightai.com

### SSL Certificate
- [ ] Certificate status changed from "Provisioning"
- [ ] Certificate status shows "Active"
- [ ] Can access https://opssightai.com
- [ ] Can access https://www.opssightai.com
- [ ] Browser shows green padlock
- [ ] HTTP redirects to HTTPS automatically

### Final Verification
- [ ] All API endpoints work over HTTPS
- [ ] Application loads correctly
- [ ] No SSL warnings in browser
- [ ] Old temporary URL still works (http://34.57.180.112)

---

## 🎉 Success Criteria

Your DNS configuration is complete when:

1. ✅ `nslookup opssightai.com` returns `34.117.179.95`
2. ✅ dnschecker.org shows `34.117.179.95` globally
3. ✅ Certificate status is `Active`
4. ✅ https://opssightai.com loads with green padlock
5. ✅ http://opssightai.com redirects to HTTPS
6. ✅ All API endpoints work over HTTPS

---

## 📊 Current Status

**Before DNS Update:**
- DNS: 198.49.23.145 (Squarespace parking)
- SSL: Provisioning (waiting for DNS)
- Access: http://34.57.180.112 (temporary)

**After DNS Update:**
- DNS: 34.117.179.95 (GKE load balancer)
- SSL: Active (after propagation)
- Access: https://opssightai.com (production)

---

## 🔗 Useful Links

- **DNS Checker**: https://dnschecker.org
- **Squarespace DNS Help**: https://support.squarespace.com/hc/en-us/articles/205812378
- **Google Cloud DNS**: https://cloud.google.com/dns/docs
- **SSL Certificate Status**: Run `kubectl get managedcertificate -n opssightai`

---

## 📝 Notes

- Keep the temporary URL (http://34.57.180.112) working until HTTPS is confirmed
- DNS changes are reversible - you can always change back
- SSL certificate renews automatically (no action needed)
- Once working, you can remove the old LoadBalancer service

---

## 🆘 Need Help?

If you encounter issues:

1. **Check deployment status**:
   ```bash
   kubectl get all -n opssightai
   ```

2. **Check certificate details**:
   ```bash
   kubectl describe managedcertificate opssightai-ssl-cert -n opssightai
   ```

3. **Check ingress status**:
   ```bash
   kubectl describe ingress opssightai-ingress-ssl -n opssightai
   ```

4. **Test API directly**:
   ```bash
   curl http://34.57.180.112/api/health
   ```

---

**Ready to update DNS?** Follow the steps above and your site will be live at https://opssightai.com within 1-3 hours! 🚀

**Last Updated**: February 9, 2026  
**Status**: Waiting for DNS configuration
