#!/bin/bash
export GCP_PROJECT_ID="alpfr-splunk-integration"
export DB_PASSWORD="OpsSightSecureDBPassword2026!"
export JWT_SECRET=$(openssl rand -base64 32)
export CLUSTER_NAME="opssightai-cluster"
chmod +x scripts/deploy-to-gke.sh
./scripts/deploy-to-gke.sh > deploy.log 2>&1
echo "Deploy script finished with exit code $?" >> deploy.log
