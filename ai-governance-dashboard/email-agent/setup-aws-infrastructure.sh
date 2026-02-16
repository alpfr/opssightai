#!/bin/bash

# Email Agent Platform - AWS Infrastructure Setup Script
# This script sets up the required AWS infrastructure for the Email Agent Platform

set -e

# Configuration
AWS_REGION="us-east-1"
AWS_ACCOUNT_ID="713220200108"
PROJECT_NAME="email-agent"

echo "========================================="
echo "Email Agent Platform - AWS Setup"
echo "========================================="
echo ""
echo "This script will set up:"
echo "  - Cognito User Pool"
echo "  - S3 Bucket for attachments"
echo "  - Secrets Manager secrets"
echo "  - IAM Role for EKS"
echo ""
read -p "Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 0
fi

# Function to check if AWS CLI is configured
check_aws_cli() {
    if ! aws sts get-caller-identity &> /dev/null; then
        echo "Error: AWS CLI is not configured"
        exit 1
    fi
    echo "✓ AWS CLI is configured"
}

# Function to create Cognito User Pool
create_cognito_pool() {
    echo ""
    echo "Creating Cognito User Pool..."
    
    POOL_ID=$(aws cognito-idp create-user-pool \
        --pool-name ${PROJECT_NAME}-users \
        --policies "PasswordPolicy={MinimumLength=8,RequireUppercase=true,RequireLowercase=true,RequireNumbers=true,RequireSymbols=false}" \
        --auto-verified-attributes email \
        --username-attributes email \
        --region $AWS_REGION \
        --query 'UserPool.Id' \
        --output text 2>/dev/null || echo "")
    
    if [ -z "$POOL_ID" ]; then
        echo "⚠️  User pool may already exist or creation failed"
        read -p "Enter existing User Pool ID (or press Enter to skip): " POOL_ID
    else
        echo "✓ User Pool created: $POOL_ID"
    fi
    
    if [ ! -z "$POOL_ID" ]; then
        echo ""
        echo "Creating App Client..."
        CLIENT_ID=$(aws cognito-idp create-user-pool-client \
            --user-pool-id $POOL_ID \
            --client-name ${PROJECT_NAME}-api \
            --no-generate-secret \
            --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH \
            --region $AWS_REGION \
            --query 'UserPoolClient.ClientId' \
            --output text 2>/dev/null || echo "")
        
        if [ -z "$CLIENT_ID" ]; then
            echo "⚠️  App client may already exist or creation failed"
            read -p "Enter existing Client ID (or press Enter to skip): " CLIENT_ID
        else
            echo "✓ App Client created: $CLIENT_ID"
        fi
        
        # Create Admin group
        echo ""
        echo "Creating Admin group..."
        aws cognito-idp create-group \
            --user-pool-id $POOL_ID \
            --group-name Admin \
            --description "Administrator users" \
            --region $AWS_REGION 2>/dev/null || echo "⚠️  Admin group may already exist"
        
        echo ""
        echo "Cognito Configuration:"
        echo "  User Pool ID: $POOL_ID"
        echo "  Client ID: $CLIENT_ID"
        echo ""
    fi
}

# Function to create S3 bucket
create_s3_bucket() {
    echo ""
    echo "Creating S3 bucket for attachments..."
    
    BUCKET_NAME="${PROJECT_NAME}-attachments-${AWS_ACCOUNT_ID}"
    
    aws s3 mb s3://$BUCKET_NAME --region $AWS_REGION 2>/dev/null || echo "⚠️  Bucket may already exist"
    
    # Enable encryption
    aws s3api put-bucket-encryption \
        --bucket $BUCKET_NAME \
        --server-side-encryption-configuration '{
            "Rules": [{
                "ApplyServerSideEncryptionByDefault": {
                    "SSEAlgorithm": "AES256"
                }
            }]
        }' 2>/dev/null || echo "⚠️  Encryption may already be enabled"
    
    # Add lifecycle policy
    aws s3api put-bucket-lifecycle-configuration \
        --bucket $BUCKET_NAME \
        --lifecycle-configuration '{
            "Rules": [{
                "Id": "DeleteAfter24Hours",
                "Status": "Enabled",
                "Expiration": {
                    "Days": 1
                }
            }]
        }' 2>/dev/null || echo "⚠️  Lifecycle policy may already exist"
    
    echo "✓ S3 bucket configured: $BUCKET_NAME"
}

# Function to create Secrets Manager secrets
create_secrets() {
    echo ""
    echo "Creating Secrets Manager secrets..."
    
    # Database secret
    echo ""
    read -p "Enter database password (or press Enter for auto-generated): " DB_PASSWORD
    if [ -z "$DB_PASSWORD" ]; then
        DB_PASSWORD=$(openssl rand -base64 32)
    fi
    
    aws secretsmanager create-secret \
        --name ${PROJECT_NAME}/database \
        --description "Email Agent Database Credentials" \
        --secret-string "{\"username\":\"emailagent\",\"password\":\"$DB_PASSWORD\"}" \
        --region $AWS_REGION 2>/dev/null || echo "⚠️  Database secret may already exist"
    
    # JWT secret
    JWT_SECRET=$(openssl rand -base64 64)
    aws secretsmanager create-secret \
        --name ${PROJECT_NAME}/jwt \
        --description "Email Agent JWT Secret" \
        --secret-string "{\"secret\":\"$JWT_SECRET\"}" \
        --region $AWS_REGION 2>/dev/null || echo "⚠️  JWT secret may already exist"
    
    # Google OAuth secret
    echo ""
    echo "Google OAuth Configuration:"
    read -p "Enter Google Client ID: " GOOGLE_CLIENT_ID
    read -p "Enter Google Client Secret: " GOOGLE_CLIENT_SECRET
    
    if [ ! -z "$GOOGLE_CLIENT_ID" ] && [ ! -z "$GOOGLE_CLIENT_SECRET" ]; then
        aws secretsmanager create-secret \
            --name ${PROJECT_NAME}/google-oauth \
            --description "Email Agent Google OAuth Credentials" \
            --secret-string "{\"client_id\":\"$GOOGLE_CLIENT_ID\",\"client_secret\":\"$GOOGLE_CLIENT_SECRET\"}" \
            --region $AWS_REGION 2>/dev/null || echo "⚠️  Google OAuth secret may already exist"
    fi
    
    echo "✓ Secrets created"
}

# Function to create IAM role
create_iam_role() {
    echo ""
    echo "Creating IAM role for EKS..."
    
    # Get OIDC provider ID
    echo "Getting EKS cluster OIDC provider..."
    OIDC_ID=$(aws eks describe-cluster \
        --name jhb-streampulse-cluster \
        --region $AWS_REGION \
        --query 'cluster.identity.oidc.issuer' \
        --output text | sed 's|https://oidc.eks.us-east-1.amazonaws.com/id/||')
    
    if [ -z "$OIDC_ID" ]; then
        echo "⚠️  Could not get OIDC provider ID. You'll need to create the IAM role manually."
        return
    fi
    
    echo "OIDC Provider ID: $OIDC_ID"
    
    # Create trust policy
    cat > /tmp/trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::${AWS_ACCOUNT_ID}:oidc-provider/oidc.eks.us-east-1.amazonaws.com/id/${OIDC_ID}"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "oidc.eks.us-east-1.amazonaws.com/id/${OIDC_ID}:sub": "system:serviceaccount:${PROJECT_NAME}:${PROJECT_NAME}-sa"
        }
      }
    }
  ]
}
EOF
    
    # Create role
    aws iam create-role \
        --role-name ${PROJECT_NAME}-eks-role \
        --assume-role-policy-document file:///tmp/trust-policy.json 2>/dev/null || echo "⚠️  Role may already exist"
    
    # Attach policies
    aws iam attach-role-policy \
        --role-name ${PROJECT_NAME}-eks-role \
        --policy-arn arn:aws:iam::aws:policy/SecretsManagerReadWrite 2>/dev/null || true
    
    aws iam attach-role-policy \
        --role-name ${PROJECT_NAME}-eks-role \
        --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess 2>/dev/null || true
    
    rm /tmp/trust-policy.json
    
    echo "✓ IAM role configured: ${PROJECT_NAME}-eks-role"
}

# Function to generate secret.yaml
generate_secret_yaml() {
    echo ""
    echo "Generating k8s/secret.yaml..."
    
    # Get values
    read -p "Enter DATABASE_URL (e.g., postgresql+asyncpg://user:pass@host:5432/db): " DATABASE_URL
    read -p "Enter REDIS_URL (e.g., redis://host:6379/0): " REDIS_URL
    
    cat > k8s/secret.yaml <<EOF
apiVersion: v1
kind: Secret
metadata:
  name: email-agent-secrets
  namespace: email-agent
type: Opaque
stringData:
  # Database
  DATABASE_URL: "${DATABASE_URL:-postgresql+asyncpg://emailagent:password@postgres-service:5432/emailagent}"
  
  # Redis
  REDIS_URL: "${REDIS_URL:-redis://redis-service:6379/0}"
  
  # Celery
  CELERY_BROKER_URL: "${REDIS_URL:-redis://redis-service:6379/1}"
  CELERY_RESULT_BACKEND: "${REDIS_URL:-redis://redis-service:6379/2}"
  
  # AWS Cognito
  COGNITO_USER_POOL_ID: "${POOL_ID:-us-east-1_XXXXXXXXX}"
  COGNITO_CLIENT_ID: "${CLIENT_ID:-your-cognito-client-id}"
  
  # Google OAuth
  GOOGLE_CLIENT_ID: "${GOOGLE_CLIENT_ID:-your-google-client-id.apps.googleusercontent.com}"
  GOOGLE_CLIENT_SECRET: "${GOOGLE_CLIENT_SECRET:-your-google-client-secret}"
  GOOGLE_REDIRECT_URI: "https://your-domain.com/api/v1/gmail/oauth/callback"
  
  # LLM API Keys
  ANTHROPIC_API_KEY: "sk-ant-api03-YOUR-KEY-HERE"
  OPENAI_API_KEY: "sk-..."
  
  # Security
  JWT_SECRET_KEY: "${JWT_SECRET:-your-super-secret-jwt-key-change-this}"
  
  # S3
  S3_BUCKET_NAME: "${BUCKET_NAME:-email-agent-attachments}"
EOF
    
    echo "✓ k8s/secret.yaml generated"
    echo ""
    echo "⚠️  IMPORTANT: Review and update k8s/secret.yaml with correct values before deploying!"
}

# Main execution
main() {
    check_aws_cli
    create_cognito_pool
    create_s3_bucket
    create_secrets
    create_iam_role
    generate_secret_yaml
    
    echo ""
    echo "========================================="
    echo "AWS Infrastructure Setup Complete!"
    echo "========================================="
    echo ""
    echo "Next steps:"
    echo "  1. Review and update k8s/secret.yaml with correct values"
    echo "  2. Set up Google OAuth credentials at https://console.cloud.google.com/"
    echo "  3. Update GOOGLE_REDIRECT_URI in k8s/secret.yaml"
    echo "  4. Run database migrations: cd backend && alembic upgrade head"
    echo "  5. Deploy to EKS: bash deploy-to-eks.sh"
    echo ""
    echo "Configuration Summary:"
    echo "  Cognito User Pool: ${POOL_ID:-Not created}"
    echo "  Cognito Client ID: ${CLIENT_ID:-Not created}"
    echo "  S3 Bucket: ${BUCKET_NAME:-Not created}"
    echo "  IAM Role: ${PROJECT_NAME}-eks-role"
    echo ""
}

main

