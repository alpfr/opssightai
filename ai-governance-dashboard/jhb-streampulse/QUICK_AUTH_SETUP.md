# Quick Authentication Setup Guide

## TL;DR - 5 Minute Setup

Add user authentication to JHB StreamPulse with email/password login.

### Prerequisites
- Domain name (e.g., `jhb-streampulse.yourdomain.com`)
- Access to add DNS records

### Setup Commands

```bash
# 1. Set your configuration
export DOMAIN_NAME="jhb-streampulse.yourdomain.com"
export ADMIN_EMAIL="admin@yourdomain.com"

# 2. Run setup script
cd jhb-streampulse
./setup-cognito-auth.sh

# 3. Follow prompts to validate SSL certificate

# 4. Add DNS CNAME record (from script output)

# 5. Access your application
# URL: https://jhb-streampulse.yourdomain.com
# Login with email and temporary password from script
```

### What This Does

✅ Creates AWS Cognito User Pool  
✅ Sets up admin user with temporary password  
✅ Requests SSL certificate  
✅ Configures Application Load Balancer with authentication  
✅ Requires login before accessing application  

### After Setup

**Create Additional Users:**
```bash
aws cognito-idp admin-create-user \
  --user-pool-id <USER_POOL_ID> \
  --username user@example.com \
  --user-attributes Name=email,Value=user@example.com Name=email_verified,Value=true \
  --region us-east-1
```

**Add User to Admin Group:**
```bash
aws cognito-idp admin-add-user-to-group \
  --user-pool-id <USER_POOL_ID> \
  --username user@example.com \
  --group-name Admins \
  --region us-east-1
```

### Cost
- ~$16-22/month for Application Load Balancer
- Cognito is FREE for first 50,000 monthly active users

### Full Documentation
See [COGNITO_AUTH_SETUP.md](COGNITO_AUTH_SETUP.md) for complete guide.

---

## Current Setup (No Auth)

**Current Access:** http://k8s-jhbstrea-jhbstrea-e1e5ea8a68-c77c5936cff58e7c.elb.us-east-1.amazonaws.com  
**Status:** Public - No authentication required

## With Authentication

**New Access:** https://jhb-streampulse.yourdomain.com  
**Status:** Private - Email/password required  
**Users:** Managed in AWS Cognito  
**Groups:** Admins (full access) and Viewers (read-only)
