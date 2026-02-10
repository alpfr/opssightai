#!/bin/bash

# AI Compliance Platform - Deploy with DNS and SSL
# This script deploys the updated configuration with the new domain

set -e

echo "🚀 AI Compliance Platform - DNS and SSL Deployment"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="ai-compliance"
RELEASE_NAME="ai-compliance"
CHART_DIR="k8s/helm/ai-compliance"
VALUES_FILE="values-sqlite.yaml"
DOMAIN="aicompliance.opssightai.com"
EXPECTED_IP="136.110.221.17"

echo "📋 Configuration:"
echo "  Domain: $DOMAIN"
echo "  Expected IP: $EXPECTED_IP"
echo "  Namespace: $NAMESPACE"
echo ""

# Step 1: Check DNS propagation
echo "🔍 Step 1: Checking DNS propagation..."
CURRENT_IP=$(nslookup $DOMAIN | grep -A1 "Name:" | grep "Address:" | awk '{print $2}' | head -1)

if [ -z "$CURRENT_IP" ]; then
    echo -e "${RED}❌ DNS not resolving yet${NC}"
    echo "Please wait a few more minutes for DNS propagation"
    exit 1
fi

echo "  Current IP: $CURRENT_IP"

if [ "$CURRENT_IP" != "$EXPECTED_IP" ]; then
    echo -e "${YELLOW}⚠️  Warning: DNS points to $CURRENT_IP instead of $EXPECTED_IP${NC}"
    echo "  This might be okay if you're using the old IP temporarily"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}✅ DNS correctly points to $EXPECTED_IP${NC}"
fi
echo ""

# Step 2: Check GKE connection
echo "🔍 Step 2: Checking GKE connection..."
if ! kubectl cluster-info &> /dev/null; then
    echo -e "${RED}❌ Not connected to GKE cluster${NC}"
    echo "Please run: gcloud container clusters get-credentials sermon-slicer-cluster --region us-central1"
    exit 1
fi
echo -e "${GREEN}✅ Connected to GKE cluster${NC}"
echo ""

# Step 3: Check namespace
echo "🔍 Step 3: Checking namespace..."
if ! kubectl get namespace $NAMESPACE &> /dev/null; then
    echo -e "${YELLOW}⚠️  Namespace $NAMESPACE doesn't exist, creating...${NC}"
    kubectl create namespace $NAMESPACE
fi
echo -e "${GREEN}✅ Namespace $NAMESPACE exists${NC}"
echo ""

# Step 4: Generate JWT secret if not provided
echo "🔐 Step 4: Generating JWT secret..."
JWT_SECRET=${JWT_SECRET:-$(openssl rand -base64 32)}
echo -e "${GREEN}✅ JWT secret ready${NC}"
echo ""

# Step 5: Deploy with Helm
echo "🚀 Step 5: Deploying with Helm..."
cd $CHART_DIR

helm upgrade $RELEASE_NAME . \
  --install \
  --namespace $NAMESPACE \
  --values $VALUES_FILE \
  --set backend.secrets.jwtSecret="$JWT_SECRET" \
  --wait \
  --timeout 10m

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Deployment successful${NC}"
else
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi
echo ""

# Step 6: Check deployment status
echo "🔍 Step 6: Checking deployment status..."
echo ""
echo "Pods:"
kubectl get pods -n $NAMESPACE
echo ""
echo "Services:"
kubectl get svc -n $NAMESPACE
echo ""
echo "Ingress:"
kubectl get ingress -n $NAMESPACE
echo ""

# Step 7: Check SSL certificate
echo "🔍 Step 7: Checking SSL certificate status..."
if kubectl get managedcertificate -n $NAMESPACE &> /dev/null; then
    kubectl get managedcertificate -n $NAMESPACE
    echo ""
    CERT_STATUS=$(kubectl get managedcertificate ai-compliance-ssl-cert -n $NAMESPACE -o jsonpath='{.status.certificateStatus}' 2>/dev/null || echo "Unknown")
    echo "Certificate Status: $CERT_STATUS"
    echo ""
    
    if [ "$CERT_STATUS" == "Active" ]; then
        echo -e "${GREEN}✅ SSL certificate is active!${NC}"
    elif [ "$CERT_STATUS" == "Provisioning" ]; then
        echo -e "${YELLOW}⏳ SSL certificate is provisioning (this can take 15-60 minutes)${NC}"
    elif [ "$CERT_STATUS" == "FailedNotVisible" ]; then
        echo -e "${YELLOW}⏳ Waiting for DNS propagation (certificate will provision once DNS is visible)${NC}"
    else
        echo -e "${YELLOW}⏳ SSL certificate status: $CERT_STATUS${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  No managed certificate found${NC}"
fi
echo ""

# Step 8: Test endpoints
echo "🧪 Step 8: Testing endpoints..."
echo ""

# Get the ingress IP
INGRESS_IP=$(kubectl get ingress -n $NAMESPACE -o jsonpath='{.items[0].status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")

if [ -z "$INGRESS_IP" ]; then
    echo -e "${YELLOW}⚠️  Ingress IP not yet assigned, waiting...${NC}"
    sleep 10
    INGRESS_IP=$(kubectl get ingress -n $NAMESPACE -o jsonpath='{.items[0].status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")
fi

if [ -n "$INGRESS_IP" ]; then
    echo "Ingress IP: $INGRESS_IP"
    echo ""
    
    # Test HTTP
    echo "Testing HTTP..."
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN/ --connect-timeout 5 || echo "000")
    if [ "$HTTP_STATUS" == "200" ] || [ "$HTTP_STATUS" == "301" ] || [ "$HTTP_STATUS" == "302" ]; then
        echo -e "${GREEN}✅ HTTP working (Status: $HTTP_STATUS)${NC}"
    else
        echo -e "${YELLOW}⚠️  HTTP status: $HTTP_STATUS${NC}"
    fi
    
    # Test HTTPS (might not work until certificate is active)
    echo "Testing HTTPS..."
    HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/ --connect-timeout 5 --insecure || echo "000")
    if [ "$HTTPS_STATUS" == "200" ]; then
        echo -e "${GREEN}✅ HTTPS working (Status: $HTTPS_STATUS)${NC}"
    else
        echo -e "${YELLOW}⚠️  HTTPS status: $HTTPS_STATUS (certificate might still be provisioning)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Ingress IP not available yet${NC}"
fi
echo ""

# Summary
echo "=================================================="
echo "📊 Deployment Summary"
echo "=================================================="
echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "🌐 Access URLs:"
echo "  HTTP:  http://$DOMAIN"
echo "  HTTPS: https://$DOMAIN (once certificate is active)"
echo ""
echo "🔐 Login Credentials:"
echo "  Admin:     admin / admin123"
echo "  Inspector: inspector / inspector123"
echo ""
echo "📊 Monitor SSL Certificate:"
echo "  kubectl get managedcertificate -n $NAMESPACE -w"
echo ""
echo "📝 View Logs:"
echo "  Backend:  kubectl logs -f deployment/ai-compliance-backend -n $NAMESPACE"
echo "  Frontend: kubectl logs -f deployment/ai-compliance-frontend -n $NAMESPACE"
echo ""
echo "🔍 Check Status:"
echo "  kubectl get all,ingress,managedcertificate -n $NAMESPACE"
echo ""

if [ "$CERT_STATUS" != "Active" ]; then
    echo -e "${YELLOW}⏳ Note: SSL certificate is still provisioning${NC}"
    echo "   This can take 15-60 minutes. Monitor with:"
    echo "   kubectl get managedcertificate ai-compliance-ssl-cert -n $NAMESPACE -w"
    echo ""
fi

echo "🎉 Deployment complete!"
