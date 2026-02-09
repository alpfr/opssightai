#!/bin/bash

echo "=== OpsSight AI Risk Scoring Test ==="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check API health
echo -e "${BLUE}Test 1: API Health Check${NC}"
curl -s http://localhost:4000/api/health | python3 -m json.tool
echo ""

# Test 2: Get all assets
echo -e "${BLUE}Test 2: Get All Assets${NC}"
curl -s http://localhost:4000/api/assets | python3 -m json.tool | head -30
echo ""

# Test 3: Get sensor data for transformer
echo -e "${BLUE}Test 3: Get Sensor Data for Transformer${NC}"
curl -s "http://localhost:4000/api/data/f2756364-b0df-4247-8d3d-1a49e74196cb?limit=5" | python3 -m json.tool
echo ""

# Test 4: Calculate risk score for transformer
echo -e "${BLUE}Test 4: Calculate Risk Score for Transformer${NC}"
curl -s -X POST http://localhost:4000/api/risk/calculate \
  -H "Content-Type: application/json" \
  -d '{"assetId": "f2756364-b0df-4247-8d3d-1a49e74196cb", "assetType": "transformer"}' | python3 -m json.tool
echo ""

# Test 5: Get risk score history for motor
echo -e "${BLUE}Test 5: Get Risk Score History for Motor${NC}"
curl -s "http://localhost:4000/api/risk/6e997ace-1e69-4e8b-9f9d-dcd34e6720a2/history?limit=3" | python3 -m json.tool
echo ""

# Test 6: Get current risk score for motor
echo -e "${BLUE}Test 6: Get Current Risk Score for Motor${NC}"
curl -s http://localhost:4000/api/risk/6e997ace-1e69-4e8b-9f9d-dcd34e6720a2 | python3 -m json.tool
echo ""

echo -e "${GREEN}=== All Tests Complete ===${NC}"
echo ""
echo -e "${YELLOW}Dashboard URL: http://localhost:4001${NC}"
echo -e "${YELLOW}API URL: http://localhost:4000${NC}"
