# JHB StreamPulse - AWS Cognito Authentication Setup

This guide explains how to add user authentication to JHB StreamPulse using AWS Cognito and Application Load Balancer (ALB).

## Overview

This setup will:
- Create an AWS Cognito User Pool for user management
- Configure an Application Load Balancer with Cognito authentication
- Require users to log in with email/password before accessing the application
- Support SSL/TLS with AWS Certificate Manager
- Create admin and viewer user groups

## Prerequisites

1. **Domain Name**: You need a domain name (e.g., `jhb-streampulse.yourdomain.com`)
2. **DNS Access**: Ability to add DNS records for your domain
3. **AWS Permissions**: IAM permissions for:
   - Cognito User Pool management
   - ACM certificate management
   - ALB/Ingress creation
   - Route 53 (if using AWS DNS)

## Quick Setup

### 1. Set Environment Variables

```bash
export DOMAIN_NAME="jhb-streampulse.yourdomain.com"
export ADMIN_EMAIL="admin@yourdomain.com"
export EKS_CLUSTER_NAME="jhb-streampulse-cluster"
export AWS_REGION="us-east-1"
```

### 2. Run Setup Script

```bash
cd jhb-streampulse
./setup-cognito-auth.sh
```

The script will:
1. Create Cognito User Pool
2. Create admin user with temporary password
3. Request SSL certificate from ACM
4. Wait for you to validate the certificate
5. Configure ALB with Cognito authentication
6. Display login credentials and next steps

### 3. Add DNS Record

After the script completes, add a CNAME record:

```
Type: CNAME
Name: jhb-streampulse.yourdomain.com
Value: <ALB_DNS_NAME>
```

### 4. Access Application

Visit `https://jhb-streampulse.yourdomain.com` and log in with:
- Email: (the admin email you provided)
- Password: (temporary password from script output)

You'll be prompted to change your password on first login.

## Manual Setup

If you prefer manual setup or need more control:

### Step 1: Create Cognito User Pool

```bash
aws cloudformation deploy \
  --template-file eks/cognito-setup.yaml \
  --stack-name jhb-streampulse-cognito \
  --parameter-overrides ApplicationName=jhb-streampulse \
  --region us-east-1 \
  --capabilities CAPABILITY_IAM
```

### Step 2: Get Cognito Details

```bash
USER_POOL_ID=$(aws cloudformation describe-stacks \
  --stack-name jhb-streampulse-cognito \
  --query 'Stacks[0].Outputs[?OutputKey==`UserPoolId`].OutputValue' \
  --output text)

USER_POOL_ARN=$(aws cloudformation describe-stacks \
  --stack-name jhb-streampulse-cognito \
  --query 'Stacks[0].Outputs[?OutputKey==`UserPoolArn`].OutputValue' \
  --output text)

USER_POOL_CLIENT_ID=$(aws cloudformation describe-stacks \
  --stack-name jhb-streampulse-cognito \
  --query 'Stacks[0].Outputs[?OutputKey==`UserPoolClientId`].OutputValue' \
  --output text)

USER_POOL_DOMAIN=$(aws cloudformation describe-stacks \
  --stack-name jhb-streampulse-cognito \
  --query 'Stacks[0].Outputs[?OutputKey==`UserPoolDomain`].OutputValue' \
  --output text)
```

### Step 3: Create Admin User

```bash
aws cognito-idp admin-create-user \
  --user-pool-id $USER_POOL_ID \
  --username admin@yourdomain.com \
  --user-attributes \
    Name=email,Value=admin@yourdomain.com \
    Name=email_verified,Value=true \
    Name=name,Value="Admin User" \
  --temporary-password "TempPass123!" \
  --region us-east-1

# Add to Admins group
aws cognito-idp admin-add-user-to-group \
  --user-pool-id $USER_POOL_ID \
  --username admin@yourdomain.com \
  --group-name Admins \
  --region us-east-1
```

### Step 4: Request SSL Certificate

```bash
CERTIFICATE_ARN=$(aws acm request-certificate \
  --domain-name jhb-streampulse.yourdomain.com \
  --validation-method DNS \
  --region us-east-1 \
  --query 'CertificateArn' \
  --output text)

# Get validation records
aws acm describe-certificate \
  --certificate-arn $CERTIFICATE_ARN \
  --region us-east-1
```

Add the DNS validation records, then wait for validation:

```bash
aws acm wait certificate-validated \
  --certificate-arn $CERTIFICATE_ARN \
  --region us-east-1
```

### Step 5: Update Callback URLs

```bash
aws cognito-idp update-user-pool-client \
  --user-pool-id $USER_POOL_ID \
  --client-id $USER_POOL_CLIENT_ID \
  --callback-urls "https://jhb-streampulse.yourdomain.com/oauth2/idpresponse" \
  --logout-urls "https://jhb-streampulse.yourdomain.com" \
  --region us-east-1
```

### Step 6: Deploy ALB with Authentication

Edit `eks/alb-with-auth.yaml` and replace:
- `USER_POOL_ARN` with your User Pool ARN
- `USER_POOL_CLIENT_ID` with your Client ID
- `USER_POOL_DOMAIN` with your User Pool Domain
- `CERTIFICATE_ARN` with your ACM Certificate ARN
- `jhb-streampulse.yourdomain.com` with your domain

Then apply:

```bash
kubectl apply -f eks/alb-with-auth.yaml
```

### Step 7: Get ALB DNS

```bash
kubectl get ingress jhb-streampulse-alb -n jhb-streampulse
```

Add a CNAME record pointing your domain to the ALB DNS name.

## User Management

### Create New User

```bash
aws cognito-idp admin-create-user \
  --user-pool-id $USER_POOL_ID \
  --username user@example.com \
  --user-attributes \
    Name=email,Value=user@example.com \
    Name=email_verified,Value=true \
    Name=name,Value="User Name" \
  --region us-east-1
```

### Add User to Admin Group

```bash
aws cognito-idp admin-add-user-to-group \
  --user-pool-id $USER_POOL_ID \
  --username user@example.com \
  --group-name Admins \
  --region us-east-1
```

### Add User to Viewer Group

```bash
aws cognito-idp admin-add-user-to-group \
  --user-pool-id $USER_POOL_ID \
  --username user@example.com \
  --group-name Viewers \
  --region us-east-1
```

### List Users

```bash
aws cognito-idp list-users \
  --user-pool-id $USER_POOL_ID \
  --region us-east-1
```

### Reset User Password

```bash
aws cognito-idp admin-set-user-password \
  --user-pool-id $USER_POOL_ID \
  --username user@example.com \
  --password "NewPassword123!" \
  --permanent \
  --region us-east-1
```

### Delete User

```bash
aws cognito-idp admin-delete-user \
  --user-pool-id $USER_POOL_ID \
  --username user@example.com \
  --region us-east-1
```

## User Groups

### Admins Group
- Full access to all features
- Can upload CSV files
- Can generate AI insights
- Can export data

### Viewers Group
- Read-only access
- Can view dashboards and data
- Cannot upload or modify data

## Password Policy

The default password policy requires:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

## Session Management

- Session timeout: 1 hour (3600 seconds)
- Users are automatically logged out after inactivity
- Session cookie: `AWSELBAuthSessionCookie`

## Architecture

```
User Browser
    ↓
Application Load Balancer (ALB)
    ↓
Cognito Authentication
    ↓ (if authenticated)
Kubernetes Service (NodePort)
    ↓
JHB StreamPulse Pods
```

## Security Features

1. **SSL/TLS Encryption**: All traffic encrypted with HTTPS
2. **Password Complexity**: Strong password requirements
3. **Email Verification**: Users must verify email addresses
4. **Temporary Passwords**: First-time users must change password
5. **Session Timeout**: Automatic logout after inactivity
6. **Group-Based Access**: Role-based access control

## Monitoring

### View Authentication Logs

```bash
# CloudWatch Logs for ALB
aws logs tail /aws/elasticloadbalancing/app/jhb-streampulse --follow

# Cognito User Pool events
aws cognito-idp admin-list-user-auth-events \
  --user-pool-id $USER_POOL_ID \
  --username user@example.com \
  --region us-east-1
```

### Check User Status

```bash
aws cognito-idp admin-get-user \
  --user-pool-id $USER_POOL_ID \
  --username user@example.com \
  --region us-east-1
```

## Troubleshooting

### Users Can't Log In

1. Check user status:
```bash
aws cognito-idp admin-get-user \
  --user-pool-id $USER_POOL_ID \
  --username user@example.com \
  --region us-east-1
```

2. Verify user is in correct group:
```bash
aws cognito-idp admin-list-groups-for-user \
  --user-pool-id $USER_POOL_ID \
  --username user@example.com \
  --region us-east-1
```

3. Check callback URLs are correct:
```bash
aws cognito-idp describe-user-pool-client \
  --user-pool-id $USER_POOL_ID \
  --client-id $USER_POOL_CLIENT_ID \
  --region us-east-1
```

### Certificate Not Validating

1. Check certificate status:
```bash
aws acm describe-certificate \
  --certificate-arn $CERTIFICATE_ARN \
  --region us-east-1
```

2. Verify DNS records are added correctly
3. Wait up to 30 minutes for DNS propagation

### ALB Not Provisioning

1. Check ingress status:
```bash
kubectl describe ingress jhb-streampulse-alb -n jhb-streampulse
```

2. Check AWS Load Balancer Controller logs:
```bash
kubectl logs -n kube-system -l app.kubernetes.io/name=aws-load-balancer-controller
```

3. Verify IAM permissions for Load Balancer Controller

## Cost Estimate

### Additional Monthly Costs
- **Cognito**: $0.0055 per MAU (Monthly Active User)
  - First 50,000 MAUs free
  - Example: 10 users = FREE
- **Application Load Balancer**: ~$16-22/month
  - $0.0225 per hour (~$16/month)
  - $0.008 per LCU-hour (varies by usage)
- **ACM Certificate**: FREE
- **Total Additional Cost**: ~$16-22/month for small teams

## Switching from NLB to ALB

If you're currently using the Network Load Balancer (NLB), you can switch to ALB with authentication:

1. Delete the existing NLB service:
```bash
kubectl delete svc jhb-streampulse -n jhb-streampulse
```

2. Apply the new NodePort service and ALB Ingress:
```bash
kubectl apply -f eks/alb-with-auth.yaml
```

3. Update DNS to point to the new ALB

## Reverting to Public Access (No Auth)

If you need to remove authentication:

1. Delete the ALB Ingress:
```bash
kubectl delete ingress jhb-streampulse-alb -n jhb-streampulse
```

2. Recreate the NLB service:
```bash
kubectl apply -f eks/service.yaml
```

3. Optionally delete Cognito resources:
```bash
aws cloudformation delete-stack \
  --stack-name jhb-streampulse-cognito \
  --region us-east-1
```

## Best Practices

1. **Use Strong Passwords**: Enforce password complexity
2. **Enable MFA**: Consider enabling multi-factor authentication
3. **Regular Audits**: Review user access regularly
4. **Least Privilege**: Use Viewer group for read-only users
5. **Monitor Logs**: Set up CloudWatch alarms for failed logins
6. **Backup User Data**: Export user list periodically
7. **SSL Only**: Never allow HTTP access
8. **Session Timeout**: Keep sessions short for sensitive data

## Support

For issues or questions:
1. Check CloudWatch Logs for ALB and Cognito
2. Review AWS Cognito Console for user status
3. Verify DNS and SSL certificate configuration
4. Check Kubernetes ingress events

## References

- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [ALB Ingress Controller](https://kubernetes-sigs.github.io/aws-load-balancer-controller/)
- [AWS Certificate Manager](https://docs.aws.amazon.com/acm/)
- [Cognito Authentication with ALB](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/listener-authenticate-users.html)
