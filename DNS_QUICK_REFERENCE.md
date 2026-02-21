# DNS Quick Reference Card

**Domain**: opssightai.com  
**Registrar**: Squarespace Domains  
**Target IP**: 34.117.179.95

---

## 🎯 What You Need to Do

### 1. Log into Squarespace
→ https://account.squarespace.com/
→ Domains → opssightai.com → DNS Settings

### 2. Add These Two Records

**Record 1:**
```
Type: A
Host: @
Value: 34.117.179.95
TTL: 3600
```

**Record 2:**
```
Type: A
Host: www
Value: 34.117.179.95
TTL: 3600
```

### 3. Save and Wait
- Save changes in Squarespace
- Wait 1-3 hours for DNS propagation
- SSL certificate will auto-provision

---

## ✅ How to Check Progress

### Check DNS (after 30 min)
```bash
nslookup opssightai.com 8.8.8.8
```
Should show: `34.117.179.95`

### Check SSL (after DNS propagates)
```bash
kubectl get managedcertificate opssightai-ssl-cert -n opssightai
```
Wait for: `STATUS: Active`

### Test Site
- http://opssightai.com (should load)
- https://opssightai.com (should load with green padlock)

---

## 📞 Quick Help

**Squarespace DNS Help**: https://support.squarespace.com/hc/en-us/articles/205812378  
**DNS Checker**: https://dnschecker.org  
**Current Working URL**: http://34.57.180.112

---

## ⏱️ Timeline

| Time | Status |
|------|--------|
| Now | Update DNS records |
| +30 min | DNS starts propagating |
| +1-2 hours | DNS fully propagated |
| +2-3 hours | SSL certificate active |
| +2-3 hours | https://opssightai.com live! |

---

**That's it!** Update the DNS records and wait. Everything else happens automatically. 🚀
