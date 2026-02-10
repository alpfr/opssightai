# DNS and SSL Setup Guide

## Current Status
- **Domain**: aicompliance.opssightai.com
- **Current IP**: 136.110.182.171 (ephemeral)
- **Target**: Configure with static IP and SSL certificate

## Step 1: Reserve Static IP Address

Since the current IP (136.110.182.171) is ephemeral, we need to reserve a new static IP:

```bash
# Reserve a new global static IP
gcloud compute addresses create ai-compliance-ip \
  --global \
  --ip-version IPV4 \
  --project alpfr-splunk-integration

# Get the reserved IP address
gcloud compute addresses describe ai-compliance-ip --global --format="get(address)"
```

## Step 2: Update DNS Records

Update your DNS provider (Squarespace or wherever opssightai.com is hosted) with the new static IP:

1. Go to your DNS management console
2. Create/Update an A record:
   - **Name**: `aicompliance` (or `aicompliance.opssightai.com`)
   - **Type**: A
   - **Value**: [The IP from Step 1]
   - **TTL**: 3600 (1 hour)

## Step 3: Deploy Updated Configuration

Apply the updated Helm configuration with the new domain:

```bash
# Navigate to the helm chart directory
cd ai-compliance-platform/k8s/helm/ai-compliance

# Upgrade the deployment with new values
helm upgrade ai-compliance . \
  --namespace ai-compliance \
  --values values-sqlite.yaml \
  --set backend.secrets.jwtSecret="your-secret-key-here" \
  --wait

# Verify the ingress
kubectl get ingress -n ai-compliance
kubectl describe ingress ai-compliance-ingress -n ai-compliance
```

## Step 4: Verify SSL Certificate Provisioning

Google-managed certificates can take 15-60 minutes to provision:

```bash
# Check certificate status
kubectl get managedcertificate -n ai-compliance
kubectl describe managedcertificate ai-compliance-ssl-cert -n ai-compliance

# Watch for status to change to "Active"
kubectl get managedcertificate ai-compliance-ssl-cert -n ai-compliance -w
```

Certificate status progression:
1. **Provisioning** - Certificate is being created
2. **FailedNotVisible** - DNS not propagated yet (wait for DNS)
3. **Active** - Certificate is ready and HTTPS is working

## Step 5: Test Access

Once the certificate is active:

```bash
# Test HTTP (should work immediately)
curl -I http://aicompliance.opssightai.com

# Test HTTPS (after certificate is active)
curl -I https://aicompliance.opssightai.com

# Test API endpoint
curl https://aicompliance.opssightai.com/api/
```

## Step 6: Update Documentation

Update the following files with the new domain:
- `README.md` - Update access URLs
- `MVP_OVERVIEW.md` - Update deployment section
- `DEPLOYMENT_COMPLETE.md` - Update access information

## Troubleshooting

### Certificate Stuck in "FailedNotVisible"
- **Cause**: DNS not propagated or pointing to wrong IP
- **Solution**: 
  ```bash
  # Check DNS propagation
  nslookup aicompliance.opssightai.com
  dig aicompliance.opssightai.com
  
  # Verify it points to your static IP
  ```

### Ingress Not Getting IP
- **Cause**: Static IP name mismatch
- **Solution**: Verify the annotation matches the reserved IP name:
  ```bash
  kubectl get ingress ai-compliance-ingress -n ai-compliance -o yaml | grep static-ip
  ```

### 502 Bad Gateway
- **Cause**: Backend pods not ready
- **Solution**:
  ```bash
  kubectl get pods -n ai-compliance
  kubectl logs -n ai-compliance deployment/ai-compliance-backend
  kubectl logs -n ai-compliance deployment/ai-compliance-frontend
  ```

### CORS Errors After Domain Change
- **Cause**: Backend CORS configuration needs update
- **Solution**: Already updated in values-sqlite.yaml with new domain

## Configuration Files Updated

1. ✅ `values-sqlite.yaml` - Updated domain and CORS
2. ✅ `managed-certificate.yaml` - Created SSL certificate resource
3. ✅ Ingress annotations - Updated to use new static IP name

## Next Steps After SSL is Active

1. **Force HTTPS**: Update ingress to redirect HTTP to HTTPS
2. **Update Frontend**: Update any hardcoded URLs in frontend code
3. **Update README**: Document the new production URL
4. **Test All Features**: Verify login, dashboard, LLM assessment, etc.
5. **Monitor**: Check logs and metrics for any issues

## Quick Reference

```bash
# Check everything
kubectl get all -n ai-compliance
kubectl get ingress,managedcertificate -n ai-compliance

# View logs
kubectl logs -f deployment/ai-compliance-backend -n ai-compliance
kubectl logs -f deployment/ai-compliance-frontend -n ai-compliance

# Restart if needed
kubectl rollout restart deployment/ai-compliance-backend -n ai-compliance
kubectl rollout restart deployment/ai-compliance-frontend -n ai-compliance
```

---

**Status**: Configuration files updated, ready for deployment
**Next**: Reserve static IP and update DNS records
