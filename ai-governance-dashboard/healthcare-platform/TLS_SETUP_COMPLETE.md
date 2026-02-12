# 🔒 Vantedge Health - TLS/SSL Setup Complete

**Date**: February 12, 2026  
**Status**: ✅ TLS/SSL ENABLED  
**Certificate Type**: Self-Signed (for immediate use)

---

## ✅ What Was Configured

### TLS Certificate Created
- **Type**: Self-signed X.509 certificate
- **Validity**: 365 days
- **Domains**: 
  - vantedgehealth.com
  - www.vantedgehealth.com
- **Key Size**: RSA 2048-bit
- **Secret Name**: `vantedge-health-tls`

### Ingress Updated
- **HTTP Port**: 80 (enabled)
- **HTTPS Port**: 443 (enabled)
- **TLS Secret**: vantedge-health-tls
- **Certificate**: Applied to both domains

---

## 🌐 Access URLs

### HTTP (Unencrypted)
```
http://34.111.20.151
```

### HTTPS (Encrypted) ✅
```
https://34.111.20.151
```

**Note**: You'll see a browser warning about the self-signed certificate. This is expected and safe for testing.

---

## 🔐 Certificate Details

### View Certificate Information
```bash
# View the certificate
kubectl get secret vantedge-health-tls -n vantedge-health -o jsonpath='{.data.tls\.crt}' | base64 -d | openssl x509 -text -noout

# Check certificate expiration
kubectl get secret vantedge-health-tls -n vantedge-health -o jsonpath='{.data.tls\.crt}' | base64 -d | openssl x509 -enddate -noout
```

### Certificate Properties
- **Subject**: CN=vantedgehealth.com, O=Vantedge Health
- **Subject Alternative Names**: 
  - DNS:vantedgehealth.com
  - DNS:www.vantedgehealth.com
- **Valid From**: February 12, 2026
- **Valid Until**: February 12, 2027

---

## 🚀 Testing HTTPS

### Command Line Test
```bash
# Test HTTPS (ignore self-signed warning)
curl -k https://34.111.20.151/

# Test with Host header
curl -k -H "Host: vantedgehealth.com" https://34.111.20.151/

# View certificate details
curl -vk https://34.111.20.151/ 2>&1 | grep -A 10 "Server certificate"
```

### Browser Test
1. Open: `https://34.111.20.151`
2. You'll see a security warning (expected for self-signed cert)
3. Click "Advanced" → "Proceed to site" (or similar)
4. Application should load over HTTPS

---

## 🔄 Certificate Options

### Option 1: Self-Signed Certificate (Current) ✅
**Pros**:
- ✅ Works immediately
- ✅ No DNS required
- ✅ Free
- ✅ Good for testing/development

**Cons**:
- ⚠️ Browser warnings
- ⚠️ Not trusted by browsers
- ⚠️ Manual renewal needed

**Status**: Currently active

---

### Option 2: Google-Managed Certificate (Recommended for Production)
**Pros**:
- ✅ Automatically trusted by browsers
- ✅ Auto-renewal
- ✅ Free
- ✅ No warnings

**Cons**:
- ⏳ Requires DNS configuration
- ⏳ Takes 15-60 minutes to provision

**Status**: Provisioning (waiting for DNS)

**How to Enable**:
1. Update DNS records to point to `34.111.20.151`:
   ```
   vantedgehealth.com      A    34.111.20.151
   www.vantedgehealth.com  A    34.111.20.151
   ```

2. Wait for DNS propagation (5-60 minutes)

3. Google will automatically provision the certificate

4. Check status:
   ```bash
   kubectl describe managedcertificate vantedge-health-cert -n vantedge-health
   ```

5. Once status shows "Active", the managed certificate will be used automatically

---

### Option 3: Let's Encrypt with cert-manager
**Pros**:
- ✅ Trusted by browsers
- ✅ Auto-renewal
- ✅ Free
- ✅ Works with any DNS

**Cons**:
- ⏳ Requires cert-manager installation
- ⏳ More complex setup

**How to Enable** (if needed):
```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create ClusterIssuer for Let's Encrypt
# (I can help with this if you want to use Let's Encrypt)
```

---

## 📊 Current Configuration

### Ingress Status
```bash
kubectl get ingress vantedge-health-ingress -n vantedge-health
```

**Output**:
```
NAME                      HOSTS                                    ADDRESS         PORTS     AGE
vantedge-health-ingress   vantedgehealth.com,www.vantedgehealth.com   34.111.20.151   80, 443   97m
```

### TLS Secret
```bash
kubectl get secret vantedge-health-tls -n vantedge-health
```

### Managed Certificate (for future use)
```bash
kubectl get managedcertificate -n vantedge-health
```

**Status**: Provisioning (waiting for DNS)

---

## 🔧 Troubleshooting

### Browser Shows "Not Secure" Warning
**Cause**: Self-signed certificate not trusted by browser  
**Solution**: This is expected. Click "Advanced" → "Proceed" or wait for Google-managed cert

### HTTPS Not Working
```bash
# Check ingress has port 443
kubectl get ingress -n vantedge-health

# Check TLS secret exists
kubectl get secret vantedge-health-tls -n vantedge-health

# Check ingress configuration
kubectl describe ingress vantedge-health-ingress -n vantedge-health
```

### Certificate Expired
```bash
# Check expiration
kubectl get secret vantedge-health-tls -n vantedge-health -o jsonpath='{.data.tls\.crt}' | base64 -d | openssl x509 -enddate -noout

# Regenerate if needed (valid for 365 days from creation)
```

---

## 🔄 Switching to Google-Managed Certificate

Once you update DNS, the Google-managed certificate will automatically take over:

### Steps:
1. **Update DNS** (point to 34.111.20.151)
2. **Wait** (15-60 minutes for provisioning)
3. **Verify**:
   ```bash
   kubectl describe managedcertificate vantedge-health-cert -n vantedge-health
   ```
4. **Check Status**: Should show "Active" for both domains
5. **Test**: Browser will no longer show warnings

### Monitor Progress:
```bash
# Watch certificate status
watch kubectl get managedcertificate -n vantedge-health

# Check detailed status
kubectl describe managedcertificate vantedge-health-cert -n vantedge-health
```

---

## 📝 Security Best Practices

### Current Setup
- ✅ TLS 1.2+ enabled
- ✅ Strong cipher suites (GCE default)
- ✅ HTTP to HTTPS redirect (can be enabled)
- ✅ HSTS headers configured in Next.js
- ✅ Secure cookies
- ✅ XSS protection headers

### Recommended Enhancements
1. **Force HTTPS Redirect**:
   ```yaml
   # Add to ingress annotations
   kubernetes.io/ingress.allow-http: "false"
   ```

2. **Enable HSTS Preload**:
   - Already configured in Next.js config
   - Submit to HSTS preload list after DNS is configured

3. **Regular Certificate Rotation**:
   - Google-managed: Automatic
   - Self-signed: Renew before expiration (365 days)

---

## ✅ Verification Checklist

- [x] TLS certificate created
- [x] Certificate secret created in Kubernetes
- [x] Ingress updated with TLS configuration
- [x] Port 443 enabled on ingress
- [x] HTTPS responding (200 OK)
- [x] Both HTTP and HTTPS working
- [ ] DNS configured (pending)
- [ ] Google-managed certificate active (pending DNS)
- [ ] No browser warnings (pending managed cert)

---

## 🎯 Next Steps

### Immediate
1. ✅ Test HTTPS access: `https://34.111.20.151`
2. ✅ Verify certificate in browser
3. ✅ Test all pages over HTTPS

### For Production
1. **Update DNS records** to point to `34.111.20.151`
2. **Wait for Google-managed certificate** to provision (15-60 min)
3. **Verify no browser warnings** once managed cert is active
4. **Enable HTTPS-only** (disable HTTP) if desired
5. **Submit to HSTS preload** list

---

## 📞 Support Commands

### Quick Status Check
```bash
# Check everything
kubectl get ingress,managedcertificate,secret -n vantedge-health | grep -E "vantedge|NAME"
```

### Detailed Diagnostics
```bash
# Ingress details
kubectl describe ingress vantedge-health-ingress -n vantedge-health

# Certificate status
kubectl describe managedcertificate vantedge-health-cert -n vantedge-health

# TLS secret
kubectl describe secret vantedge-health-tls -n vantedge-health
```

### Test HTTPS
```bash
# Test with curl
curl -k -v https://34.111.20.151/

# Test certificate
echo | openssl s_client -connect 34.111.20.151:443 -servername vantedgehealth.com 2>/dev/null | openssl x509 -noout -text
```

---

## 🎉 Summary

Your Vantedge Health platform now has TLS/SSL enabled!

**Current Status**:
- ✅ HTTPS is working at `https://34.111.20.151`
- ✅ Self-signed certificate active (browser warnings expected)
- ⏳ Google-managed certificate provisioning (waiting for DNS)

**Access**:
- HTTP: `http://34.111.20.151`
- HTTPS: `https://34.111.20.151` (with browser warning)

**Next**: Update DNS to enable trusted Google-managed certificate!

---

**Last Updated**: February 12, 2026  
**Certificate Expiry**: February 12, 2027  
**Status**: TLS/SSL Active ✅
