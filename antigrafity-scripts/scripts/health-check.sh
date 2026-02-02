#!/bin/bash

# Health Check Script for Sermon Slicer
# Returns exit code 0 if healthy, 1 if unhealthy

HEALTH_URL="${HEALTH_URL:-http://localhost:7001/health}"

# Perform health check
response=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL")

if [ "$response" = "200" ]; then
    echo "✅ Health check passed"
    exit 0
else
    echo "❌ Health check failed (HTTP $response)"
    exit 1
fi
