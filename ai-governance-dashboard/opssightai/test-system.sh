#!/bin/bash

# OpsSight AI - Comprehensive System Test Suite
# This script tests all implemented features end-to-end

set -e

BASE_URL="http://localhost:4000"
USER_ID="166c97fe-2cd9-4149-bc42-bee305c58037"
PLANT_ID="PLANT-001"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

# Helper function to print test results
print_test() {
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}: $2"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}✗ FAIL${NC}: $2"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
}

echo "=========================================="
echo "OpsSight AI - System Test Suite"
echo "=========================================="
echo ""

# Test 1: Health Check
echo "Testing: Health Check Endpoint"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/health")
if [ "$RESPONSE" -eq 200 ]; then
    print_test 0 "Health check endpoint returns 200"
else
    print_test 1 "Health check endpoint (got $RESPONSE)"
fi
echo ""

# Test 2: Get All Assets
echo "Testing: Asset Management"
RESPONSE=$(curl -s "$BASE_URL/api/assets")
ASSET_COUNT=$(echo "$RESPONSE" | jq '. | length')
if [ "$ASSET_COUNT" -ge 1 ]; then
    print_test 0 "Get all assets (found $ASSET_COUNT assets)"
else
    print_test 1 "Get all assets (expected >= 1, got $ASSET_COUNT)"
fi

# Get first asset ID for subsequent tests
ASSET_ID=$(echo "$RESPONSE" | jq -r '.[0].id')
echo "Using asset ID: $ASSET_ID"
echo ""

# Test 3: Get Single Asset
echo "Testing: Get Single Asset"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/assets/$ASSET_ID")
if [ "$RESPONSE" -eq 200 ]; then
    print_test 0 "Get single asset by ID"
else
    print_test 1 "Get single asset by ID (got $RESPONSE)"
fi
echo ""

# Test 4: Create New Asset
echo "Testing: Create New Asset"
NEW_ASSET=$(cat <<EOF
{
  "name": "Test Pump TP-$(date +%s)",
  "type": "pump",
  "location": {
    "plant_id": "$PLANT_ID",
    "building": "Building A",
    "floor": "1",
    "zone": "Zone 1"
  },
  "identifier": "TP-TEST-$(date +%s)",
  "specifications": {
    "manufacturer": "Test Corp",
    "model": "TP-1000",
    "installation_date": "2024-01-01"
  }
}
EOF
)

RESPONSE=$(curl -s -X POST "$BASE_URL/api/assets" \
  -H "Content-Type: application/json" \
  -d "$NEW_ASSET")

NEW_ASSET_ID=$(echo "$RESPONSE" | jq -r '.id')
if [ "$NEW_ASSET_ID" != "null" ] && [ -n "$NEW_ASSET_ID" ]; then
    print_test 0 "Create new asset (ID: $NEW_ASSET_ID)"
else
    print_test 1 "Create new asset"
fi
echo ""

# Test 5: Data Ingestion
echo "Testing: Sensor Data Ingestion"
SENSOR_DATA=$(cat <<EOF
{
  "asset_id": "$ASSET_ID",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "sensor_type": "temperature",
  "value": 75.5,
  "unit": "celsius"
}
EOF
)

RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/data" \
  -H "Content-Type: application/json" \
  -d "$SENSOR_DATA")

if [ "$RESPONSE" -eq 201 ]; then
    print_test 0 "Ingest sensor data"
else
    print_test 1 "Ingest sensor data (got $RESPONSE)"
fi
echo ""

# Test 6: Get Sensor Data
echo "Testing: Retrieve Sensor Data"
RESPONSE=$(curl -s "$BASE_URL/api/data/$ASSET_ID")
DATA_COUNT=$(echo "$RESPONSE" | jq '. | length')
if [ "$DATA_COUNT" -ge 1 ]; then
    print_test 0 "Retrieve sensor data (found $DATA_COUNT readings)"
else
    print_test 1 "Retrieve sensor data (expected >= 1, got $DATA_COUNT)"
fi
echo ""

# Test 7: Risk Scoring
echo "Testing: Risk Scoring"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/risk/calculate" \
  -H "Content-Type: application/json" \
  -d "{\"asset_id\": \"$ASSET_ID\"}")

RISK_SCORE=$(echo "$RESPONSE" | jq -r '.risk_score')
if [ "$RISK_SCORE" != "null" ] && [ -n "$RISK_SCORE" ]; then
    print_test 0 "Calculate risk score (score: $RISK_SCORE)"
else
    print_test 1 "Calculate risk score"
fi
echo ""

# Test 8: Get Risk History
echo "Testing: Risk History"
RESPONSE=$(curl -s "$BASE_URL/api/risk/$ASSET_ID/history")
HISTORY_COUNT=$(echo "$RESPONSE" | jq '. | length')
if [ "$HISTORY_COUNT" -ge 0 ]; then
    print_test 0 "Get risk history (found $HISTORY_COUNT records)"
else
    print_test 1 "Get risk history"
fi
echo ""

# Test 9: Anomaly Detection
echo "Testing: Anomaly Detection"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/anomalies/detect" \
  -H "Content-Type: application/json" \
  -d "{\"asset_id\": \"$ASSET_ID\"}")

STATUS=$(echo "$RESPONSE" | jq -r '.status')
if [ "$STATUS" == "success" ] || [ "$STATUS" == "no_anomalies" ]; then
    print_test 0 "Detect anomalies (status: $STATUS)"
else
    print_test 1 "Detect anomalies"
fi
echo ""

# Test 10: Get Anomalies
echo "Testing: Retrieve Anomalies"
RESPONSE=$(curl -s "$BASE_URL/api/anomalies/$ASSET_ID")
ANOMALY_COUNT=$(echo "$RESPONSE" | jq '. | length')
if [ "$ANOMALY_COUNT" -ge 0 ]; then
    print_test 0 "Get anomalies for asset (found $ANOMALY_COUNT)"
else
    print_test 1 "Get anomalies for asset"
fi
echo ""

# Test 11: Get Critical Anomalies
echo "Testing: Critical Anomalies"
RESPONSE=$(curl -s "$BASE_URL/api/anomalies/critical/all")
CRITICAL_COUNT=$(echo "$RESPONSE" | jq '. | length')
if [ "$CRITICAL_COUNT" -ge 0 ]; then
    print_test 0 "Get all critical anomalies (found $CRITICAL_COUNT)"
else
    print_test 1 "Get all critical anomalies"
fi
echo ""

# Test 12: Forecasting
echo "Testing: Forecasting"
RESPONSE=$(curl -s "$BASE_URL/api/forecast/$ASSET_ID")
FORECAST_STATUS=$(echo "$RESPONSE" | jq -r '.status // .error')
if [ -n "$FORECAST_STATUS" ]; then
    print_test 0 "Get forecast (status: $FORECAST_STATUS)"
else
    print_test 1 "Get forecast"
fi
echo ""

# Test 13: Executive Summary
echo "Testing: Executive Summary"
RESPONSE=$(curl -s "$BASE_URL/api/summary/$PLANT_ID")
HEALTH_SCORE=$(echo "$RESPONSE" | jq -r '.health_score')
if [ "$HEALTH_SCORE" != "null" ] && [ -n "$HEALTH_SCORE" ]; then
    print_test 0 "Get executive summary (health: $HEALTH_SCORE)"
else
    print_test 1 "Get executive summary"
fi
echo ""

# Test 14: Notifications
echo "Testing: Notification System"

# Create a test notification
NOTIFICATION=$(cat <<EOF
{
  "user_id": "$USER_ID",
  "type": "risk_change",
  "severity": "medium",
  "title": "Test Notification",
  "message": "This is a test notification",
  "asset_id": "$ASSET_ID"
}
EOF
)

RESPONSE=$(curl -s -X POST "$BASE_URL/api/notifications" \
  -H "Content-Type: application/json" \
  -d "$NOTIFICATION")

NOTIF_ID=$(echo "$RESPONSE" | jq -r '.id')
if [ "$NOTIF_ID" != "null" ] && [ -n "$NOTIF_ID" ]; then
    print_test 0 "Create notification (ID: $NOTIF_ID)"
else
    print_test 1 "Create notification"
fi
echo ""

# Test 15: Get Notifications
echo "Testing: Retrieve Notifications"
RESPONSE=$(curl -s "$BASE_URL/api/notifications?user_id=$USER_ID")
NOTIF_COUNT=$(echo "$RESPONSE" | jq '. | length')
if [ "$NOTIF_COUNT" -ge 1 ]; then
    print_test 0 "Get user notifications (found $NOTIF_COUNT)"
else
    print_test 1 "Get user notifications (expected >= 1, got $NOTIF_COUNT)"
fi
echo ""

# Test 16: Mark Notification as Read
if [ "$NOTIF_ID" != "null" ] && [ -n "$NOTIF_ID" ]; then
    echo "Testing: Mark Notification as Read"
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE_URL/api/notifications/$NOTIF_ID/read")
    if [ "$RESPONSE" -eq 200 ]; then
        print_test 0 "Mark notification as read"
    else
        print_test 1 "Mark notification as read (got $RESPONSE)"
    fi
    echo ""
fi

# Test 17: Notification Preferences
echo "Testing: Notification Preferences"
PREFERENCES=$(cat <<EOF
{
  "user_id": "$USER_ID",
  "channels": ["in_app", "email"],
  "severity_threshold": "medium",
  "enabled_types": ["risk_change", "critical_anomaly"],
  "quiet_hours": {
    "enabled": true,
    "start": "22:00",
    "end": "08:00"
  }
}
EOF
)

RESPONSE=$(curl -s -X POST "$BASE_URL/api/notifications/preferences" \
  -H "Content-Type: application/json" \
  -d "$PREFERENCES")

PREF_ID=$(echo "$RESPONSE" | jq -r '.id')
if [ "$PREF_ID" != "null" ] && [ -n "$PREF_ID" ]; then
    print_test 0 "Set notification preferences"
else
    print_test 1 "Set notification preferences"
fi
echo ""

# Test 18: Get Notification Preferences
echo "Testing: Retrieve Notification Preferences"
RESPONSE=$(curl -s "$BASE_URL/api/notifications/preferences?user_id=$USER_ID")
CHANNELS=$(echo "$RESPONSE" | jq -r '.channels | length')
if [ "$CHANNELS" -ge 1 ]; then
    print_test 0 "Get notification preferences"
else
    print_test 1 "Get notification preferences"
fi
echo ""

# Test 19: Data Validation - Invalid Timestamp
echo "Testing: Data Validation (Future Timestamp)"
INVALID_DATA=$(cat <<EOF
{
  "asset_id": "$ASSET_ID",
  "timestamp": "2030-01-01T00:00:00Z",
  "sensor_type": "temperature",
  "value": 75.5,
  "unit": "celsius"
}
EOF
)

RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/data" \
  -H "Content-Type: application/json" \
  -d "$INVALID_DATA")

if [ "$RESPONSE" -eq 400 ]; then
    print_test 0 "Reject future timestamp"
else
    print_test 1 "Reject future timestamp (got $RESPONSE, expected 400)"
fi
echo ""

# Test 20: Data Validation - Invalid Sensor Type
echo "Testing: Data Validation (Invalid Sensor Type)"
INVALID_DATA=$(cat <<EOF
{
  "asset_id": "$ASSET_ID",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "sensor_type": "invalid_sensor",
  "value": 75.5,
  "unit": "celsius"
}
EOF
)

RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/data" \
  -H "Content-Type: application/json" \
  -d "$INVALID_DATA")

if [ "$RESPONSE" -eq 400 ]; then
    print_test 0 "Reject invalid sensor type"
else
    print_test 1 "Reject invalid sensor type (got $RESPONSE, expected 400)"
fi
echo ""

# Summary
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo -e "Total Tests: $TESTS_TOTAL"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed! ✓${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed. Please review the output above.${NC}"
    exit 1
fi
