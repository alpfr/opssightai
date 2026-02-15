#!/bin/bash
set -e

# JHB StreamPulse - Setup Cognito Authentication
# This script sets up AWS Cognito authentication for JHB StreamPulse

echo "=========================================="
echo "JHB StreamPulse - Cognito Auth Setup"
echo "=========================================="
echo ""

# Configuration
CLUSTER_NAME="${EKS_CLUSTER_NAME:-jhb-streampulse-cluster}"
AWS_REGION="${AWS_REGION:-us-east-1}"
STACK_NAME="jhb-streampulse-cognito"
DOMAIN_NAME="${DOMAIN_NAME}"
ADMIN_EMAIL="${ADMIN_EMAIL}"

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install: https://aws.amazon.com/cli/"
    exit 1
fi

if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl not found. Please install: https://kubernetes.io/docs/tasks/tools/"
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Validate required parameters
if [ -z "$DOMAIN_NAME" ]; then
    echo "❌ DOMAIN_NAME not set. Please set it:"
    echo "   export DOMAIN_NAME=jhb-streampulse.yourdomain.com"
    exit 1
fi

if [ -z "$ADMIN_EMAIL" ]; then
    echo "❌ ADMIN_EMAIL not set. Please set it:"
    echo "   export ADMIN_EMAIL=admin@yourdomain.com"
    exit 1
fi

echo "Configuration:"
echo "  Cluster: $CLUSTER_NAME"
echo "  Region: $AWS_REGION"
echo "  Domain: $DOMAIN_NAME"
echo "  Admin Email: $ADMIN_EMAIL"
echo ""

# Step 1: Create Cognito User Pool
echo "Step 1: Creating Cognito User Pool..."
aws cloudformation deploy \
    --template-file eks/cognito-setup.yaml \
    --stack-name "$STACK_NAME" \
    --parameter-overrides ApplicationName=jhb-streampulse \
    --region "$AWS_REGION" \
    --capabilities CAPABILITY_IAM

echo "✅ Cognito User Pool created"
echo ""

# Step 2: Get Cognito details
echo "Step 2: Retrieving Cognito details..."
USER_POOL_ID=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$AWS_REGION" \
    --query 'Stacks[0].Outputs[?OutputKey==`UserPoolId`].OutputValue' \
    --output text)

USER_POOL_ARN=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$AWS_REGION" \
    --query 'Stacks[0].Outputs[?OutputKey==`UserPoolArn`].OutputValue' \
    --output text)

USER_POOL_CLIENT_ID=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$AWS_REGION" \
    --query 'Stacks[0].Outputs[?OutputKey==`UserPoolClientId`].OutputValue' \
    --output text)

USER_POOL_DOMAIN=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$AWS_REGION" \
    --query 'Stacks[0].Outputs[?OutputKey==`UserPoolDomain`].OutputValue' \
    --output text)

echo "User Pool ID: $USER_POOL_ID"
echo "User Pool ARN: $USER_POOL_ARN"
echo "Client ID: $USER_POOL_CLIENT_ID"
echo "Domain: $USER_POOL_DOMAIN"
echo ""

# Step 3: Create admin user
echo "Step 3: Creating admin user..."
TEMP_PASSWORD=$(openssl rand -base64 12)

aws cognito-idp admin-create-user \
    --user-pool-id "$USER_POOL_ID" \
    --username "$ADMIN_EMAIL" \
    --user-attributes Name=email,Value="$ADMIN_EMAIL" Name=email_verified,Value=true Name=name,Value="Admin User" \
    --temporary-password "$TEMP_PASSWORD" \
    --message-action SUPPRESS \
    --region "$AWS_REGION"

# Add user to Admins group
aws cognito-idp admin-add-user-to-group \
    --user-pool-id "$USER_POOL_ID" \
    --username "$ADMIN_EMAIL" \
    --group-name Admins \
    --region "$AWS_REGION"

echo "✅ Admin user created"
echo "   Email: $ADMIN_EMAIL"
echo "   Temporary Password: $TEMP_PASSWORD"
echo "   (User will be prompted to change password on first login)"
echo ""

# Step 4: Request SSL certificate
echo "Step 4: Requesting SSL certificate from ACM..."
CERTIFICATE_ARN=$(aws acm request-certificate \
    --domain-name "$DOMAIN_NAME" \
    --validation-method DNS \
    --region "$AWS_REGION" \
    --query 'CertificateArn' \
    --output text)

echo "✅ Certificate requested: $CERTIFICATE_ARN"
echo ""
echo "⚠️  IMPORTANT: You must validate the certificate by adding DNS records."
echo "   Run this command to get validation details:"
echo "   aws acm describe-certificate --certificate-arn $CERTIFICATE_ARN --region $AWS_REGION"
echo ""
read -p "Press Enter after you've added the DNS validation records and the certificate is issued..."

# Wait for certificate to be issued
echo "Waiting for certificate validation..."
aws acm wait certificate-validated \
    --certificate-arn "$CERTIFICATE_ARN" \
    --region "$AWS_REGION"

echo "✅ Certificate validated"
echo ""

# Step 5: Update callback URLs
echo "Step 5: Updating Cognito callback URLs..."
CALLBACK_URL="https://$DOMAIN_NAME/oauth2/idpresponse"
LOGOUT_URL="https://$DOMAIN_NAME"

aws cognito-idp update-user-pool-client \
    --user-pool-id "$USER_POOL_ID" \
    --client-id "$USER_POOL_CLIENT_ID" \
    --callback-urls "$CALLBACK_URL" \
    --logout-urls "$LOGOUT_URL" \
    --region "$AWS_REGION"

echo "✅ Callback URLs updated"
echo ""

# Step 6: Update ALB Ingress manifest
echo "Step 6: Creating ALB Ingress with authentication..."

# Create temporary file with substituted values
cat eks/alb-with-auth.yaml | \
    sed "s|USER_POOL_ARN|$USER_POOL_ARN|g" | \
    sed "s|USER_POOL_CLIENT_ID|$USER_POOL_CLIENT_ID|g" | \
    sed "s|USER_POOL_DOMAIN|$USER_POOL_DOMAIN|g" | \
    sed "s|CERTIFICATE_ARN|$CERTIFICATE_ARN|g" | \
    sed "s|jhb-streampulse.yourdomain.com|$DOMAIN_NAME|g" \
    > /tmp/alb-with-auth-configured.yaml

# Apply the ingress
kubectl apply -f /tmp/alb-with-auth-configured.yaml

echo "✅ ALB Ingress created with Cognito authentication"
echo ""

# Step 7: Wait for ALB to be provisioned
echo "Step 7: Waiting for ALB to be provisioned..."
echo "This may take 2-3 minutes..."
sleep 30

ALB_DNS=""
for i in {1..20}; do
    ALB_DNS=$(kubectl get ingress jhb-streampulse-alb -n jhb-streampulse -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "")
    if [ -n "$ALB_DNS" ]; then
        break
    fi
    echo "Waiting for ALB... ($i/20)"
    sleep 15
done

if [ -z "$ALB_DNS" ]; then
    echo "⚠️  ALB not ready yet. Check status with:"
    echo "   kubectl get ingress jhb-streampulse-alb -n jhb-streampulse"
    exit 1
fi

echo "✅ ALB provisioned: $ALB_DNS"
echo ""

# Step 8: Display DNS configuration
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Add DNS Record:"
echo "   Type: CNAME"
echo "   Name: $DOMAIN_NAME"
echo "   Value: $ALB_DNS"
echo ""
echo "2. Login Credentials:"
echo "   URL: https://$DOMAIN_NAME"
echo "   Email: $ADMIN_EMAIL"
echo "   Temporary Password: $TEMP_PASSWORD"
echo "   (You'll be prompted to change password on first login)"
echo ""
echo "3. Create Additional Users:"
echo "   aws cognito-idp admin-create-user \\"
echo "     --user-pool-id $USER_POOL_ID \\"
echo "     --username user@example.com \\"
echo "     --user-attributes Name=email,Value=user@example.com Name=email_verified,Value=true \\"
echo "     --region $AWS_REGION"
echo ""
echo "4. Add User to Group:"
echo "   # For admin access:"
echo "   aws cognito-idp admin-add-user-to-group \\"
echo "     --user-pool-id $USER_POOL_ID \\"
echo "     --username user@example.com \\"
echo "     --group-name Admins \\"
echo "     --region $AWS_REGION"
echo ""
echo "   # For read-only access:"
echo "   aws cognito-idp admin-add-user-to-group \\"
echo "     --user-pool-id $USER_POOL_ID \\"
echo "     --username user@example.com \\"
echo "     --group-name Viewers \\"
echo "     --region $AWS_REGION"
echo ""
echo "📊 Cognito Console:"
echo "   https://console.aws.amazon.com/cognito/v2/idp/user-pools/$USER_POOL_ID/users?region=$AWS_REGION"
echo ""
echo "🔐 Authentication is now enabled!"
echo "   All users must log in with email/password to access the application."
echo ""

# Save configuration
cat > cognito-config.txt <<EOF
JHB StreamPulse - Cognito Configuration
========================================

User Pool ID: $USER_POOL_ID
User Pool ARN: $USER_POOL_ARN
Client ID: $USER_POOL_CLIENT_ID
Domain: $USER_POOL_DOMAIN
Certificate ARN: $CERTIFICATE_ARN
ALB DNS: $ALB_DNS

Application URL: https://$DOMAIN_NAME
Admin Email: $ADMIN_EMAIL
Temporary Password: $TEMP_PASSWORD

Cognito Console: https://console.aws.amazon.com/cognito/v2/idp/user-pools/$USER_POOL_ID/users?region=$AWS_REGION
EOF

echo "Configuration saved to: cognito-config.txt"
echo ""
