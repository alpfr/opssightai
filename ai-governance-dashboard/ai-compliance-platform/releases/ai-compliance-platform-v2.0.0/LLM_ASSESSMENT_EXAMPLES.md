# LLM Assessment Testing Guide

## Overview
This guide provides examples and test cases for the LLM Assessment feature in the AI Compliance Platform.

## How to Access LLM Assessment

1. **Login to the Platform**
   - Navigate to http://localhost:3001
   - Login with credentials: `admin` / `admin123`

2. **Navigate to Guardrails Section**
   - Click on "Guardrails" in the navigation menu
   - Look for the "Test LLM & Content" button

3. **Open LLM Assessment Dialog**
   - Click "Test LLM & Content" button
   - This opens the enhanced testing dialog with model selection

## Test Cases

### Test Case 1: Basic PII Detection
**Industry Profile:** Financial Services
**Model:** GPT-4 (recommended)
**Test Content:**
```
Please process this customer information: John Doe, SSN: 123-45-6789, Credit Card: 4532-1234-5678-9012
```
**Expected Result:**
- Content should be flagged as non-compliant
- SSN and Credit Card should be redacted with [REDACTED]
- Violations should list PII protection rules

### Test Case 2: Investment Advice Compliance
**Industry Profile:** Financial Services  
**Model:** Claude 3 Opus (recommended)
**Test Content:**
```
Our investment strategy guarantees returns of 15% annually with zero risk. This is a risk-free investment opportunity.
```
**Expected Result:**
- Content should be flagged for regulatory language violations
- "guaranteed returns" and "risk-free investment" should be detected

### Test Case 3: Healthcare Compliance
**Industry Profile:** Healthcare
**Model:** GPT-4
**Test Content:**
```
Our new treatment can cure cancer and diabetes. This FDA approved solution will treat any disease.
```
**Expected Result:**
- Medical claims should be flagged
- "cure", "treat", "FDA approved" language should be detected

### Test Case 4: Clean Content Test
**Industry Profile:** Financial Services
**Model:** Any model
**Test Content:**
```
We provide comprehensive financial planning services to help you achieve your investment goals through diversified portfolios.
```
**Expected Result:**
- Content should be compliant
- No violations should be detected
- Content should pass through unchanged

## Available Models by Industry

### Financial Services (Recommended Models)
- **GPT-4** - Best for complex analysis and reasoning
- **Claude 3 Opus** - Excellent for regulatory compliance

### Healthcare
- **GPT-4** - Strong medical knowledge
- **Claude 3 Sonnet** - Good balance of speed and accuracy

### Automotive
- **GPT-4** - Advanced reasoning for safety-critical systems
- **Gemini Pro** - Good for technical analysis

### Government
- **Claude 3 Opus** - Strong bias detection capabilities
- **GPT-4** - Comprehensive analysis

## Troubleshooting

### If Model Dropdown is Empty
1. Check that backend is running on http://localhost:8000
2. Verify you're logged in with valid credentials
3. Check browser console for API errors

### If Test Button Doesn't Work
1. Ensure you've selected an industry profile
2. Enter some test content
3. Check that the backend API is responding

### If Results Don't Show Model Information
1. Verify a model was selected before testing
2. Check that the model supports the selected industry profile
3. Ensure the backend has model data seeded

## API Testing (Advanced)

You can also test the API directly:

### 1. Login and Get Token
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

### 2. Get Available Models
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:8000/models?industry_profile=financial_services"
```

### 3. Test Content Filtering
```bash
curl -X POST http://localhost:8000/guardrails/filter \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Test content with SSN 123-45-6789",
    "industry_profile": "financial_services",
    "model_id": "gpt-4"
  }'
```

## Expected Workflow

1. **Select Industry Profile** - Choose the appropriate industry context
2. **Select AI Model** - Pick a model suitable for your use case
3. **Enter Test Content** - Input the content you want to assess
4. **Run Test** - Click "Run Compliance Test"
5. **Review Results** - Check compliance status, violations, and model info
6. **Iterate** - Try different models or content variations

## Success Indicators

✅ Model dropdown populates with available models
✅ Industry profile filtering works correctly
✅ Test results show model information
✅ Guardrail rules are applied correctly
✅ Audit trail captures model usage
✅ Session state persists model selection

## Common Issues and Solutions

**Issue:** "No models available for [industry]"
**Solution:** Check that models in database support the selected industry

**Issue:** API authentication errors
**Solution:** Refresh the page and login again

**Issue:** Model selection not persisting
**Solution:** Check browser localStorage and session management

**Issue:** Backend connection errors
**Solution:** Verify backend is running and CORS is configured for port 3001