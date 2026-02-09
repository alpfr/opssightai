#!/bin/bash

echo "=== OpsSight AI Anomaly Detection Test Suite ==="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

MOTOR_ID="6e997ace-1e69-4e8b-9f9d-dcd34e6720a2"
TRANSFORMER_ID="f2756364-b0df-4247-8d3d-1a49e74196cb"

echo -e "${BLUE}Test 1: Get Current Anomalies for Motor${NC}"
curl -s "http://localhost:4000/api/anomalies/${MOTOR_ID}?limit=5" | python3 -m json.tool
echo ""

echo -e "${BLUE}Test 2: Get All Critical Anomalies${NC}"
curl -s "http://localhost:4000/api/anomalies/critical/all?limit=10" | python3 -m json.tool
echo ""

echo -e "${BLUE}Test 3: Add Normal Sensor Readings (Baseline)${NC}"
for i in {1..5}; do
  temp=$((75 + RANDOM % 5))
  curl -s -X POST http://localhost:4000/api/data \
    -H "Content-Type: application/json" \
    -d "{\"assetId\":\"${TRANSFORMER_ID}\",\"sensorType\":\"voltage\",\"value\":$((235 + RANDOM % 10)),\"unit\":\"V\",\"timestamp\":\"2026-02-08T13:0${i}:00Z\"}" > /dev/null
  echo "  Added voltage reading: $((235 + RANDOM % 10))V"
done
echo ""

echo -e "${BLUE}Test 4: Add Anomalous High Voltage Reading${NC}"
curl -s -X POST http://localhost:4000/api/data \
  -H "Content-Type: application/json" \
  -d "{\"assetId\":\"${TRANSFORMER_ID}\",\"sensorType\":\"voltage\",\"value\":300,\"unit\":\"V\",\"timestamp\":\"2026-02-08T13:10:00Z\"}"
echo ""
echo "  Added anomalous voltage: 300V"
echo ""

echo -e "${BLUE}Test 5: Detect Anomalies for Transformer${NC}"
curl -s -X POST http://localhost:4000/api/anomalies/detect \
  -H "Content-Type: application/json" \
  -d "{\"assetId\": \"${TRANSFORMER_ID}\", \"assetType\": \"transformer\"}" | python3 -m json.tool
echo ""

echo -e "${BLUE}Test 6: Add Anomalous Low Vibration Reading for Motor${NC}"
curl -s -X POST http://localhost:4000/api/data \
  -H "Content-Type: application/json" \
  -d "{\"assetId\":\"${MOTOR_ID}\",\"sensorType\":\"vibration\",\"value\":0.1,\"unit\":\"mm/s\",\"timestamp\":\"2026-02-08T13:15:00Z\"}"
echo ""
echo "  Added anomalous vibration: 0.1 mm/s"
echo ""

echo -e "${BLUE}Test 7: Detect Anomalies for Motor${NC}"
curl -s -X POST http://localhost:4000/api/anomalies/detect \
  -H "Content-Type: application/json" \
  -d "{\"assetId\": \"${MOTOR_ID}\", \"assetType\": \"motor\"}" | python3 -m json.tool
echo ""

echo -e "${BLUE}Test 8: Get Anomalies by Severity (Critical)${NC}"
curl -s "http://localhost:4000/api/anomalies/${MOTOR_ID}?severity=critical&limit=5" | python3 -m json.tool
echo ""

echo -e "${BLUE}Test 9: Get All Anomalies for Motor (Last 24 Hours)${NC}"
START_DATE=$(date -u -v-1d +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date -u -d "1 day ago" +"%Y-%m-%dT%H:%M:%SZ")
curl -s "http://localhost:4000/api/anomalies/${MOTOR_ID}?startDate=${START_DATE}&limit=10" | python3 -m json.tool
echo ""

echo -e "${GREEN}=== Anomaly Detection Tests Complete ===${NC}"
echo ""
echo -e "${YELLOW}Summary:${NC}"
echo "  - Tested anomaly detection with high and low outliers"
echo "  - Tested severity classification"
echo "  - Tested anomaly retrieval by asset"
echo "  - Tested critical anomaly filtering"
echo "  - Tested date range filtering"
echo ""
echo -e "${YELLOW}Dashboard: http://localhost:4001${NC}"
echo -e "${YELLOW}API: http://localhost:4000${NC}"
