#!/bin/bash
export GCP_PROJECT_ID="alpfr-splunk-integration"
export DB_PASSWORD="OpsSightSecureDBPassword2026!"
export JWT_SECRET="AjEdsV2jzFoGPHGT6bxhcYRd+tdr0i0BkIP0vEke6j0="

helm upgrade opssightai ./k8s/helm/opssightai \
    --namespace=opssightai \
    --set frontend.image.repository=gcr.io/$GCP_PROJECT_ID/opssightai-frontend \
    --set frontend.image.tag=latest \
    --set backend.image.repository=gcr.io/$GCP_PROJECT_ID/opssightai-backend \
    --set backend.image.tag=latest \
    --set database.secrets.postgresPassword=$DB_PASSWORD \
    --set database.persistence.storageClass=standard \
    --set backend.secrets.jwtSecret=$JWT_SECRET \
    --set namespace.create=false \
    --set ingress.className=gce \
    --set ingress.annotations."kubernetes\.io/ingress\.class"=gce \
    --wait --timeout=5m
