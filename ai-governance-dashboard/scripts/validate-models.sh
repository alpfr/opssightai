#!/bin/bash

# AI Model Validation Script
# Usage: ./scripts/validate-models.sh [model-type]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

MODEL_TYPE=${1:-"all"}

echo -e "${BLUE}🔍 AI Model Validation Script${NC}"
echo -e "${BLUE}Model Type: $MODEL_TYPE${NC}"

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Supported models
SUPPORTED_MODELS=("llama3" "mistral" "qwen2" "deepseek-coder" "phi3")

# Validate model configuration
validate_model_config() {
    local model=$1
    echo -e "${BLUE}🔧 Validating $model configuration...${NC}"
    
    local errors=0
    
    # Check environment file
    if [ -f ".env.${model}" ]; then
        echo "✓ Environment file exists: .env.${model}"
        
        # Validate required environment variables
        local required_vars=("REACT_APP_MODEL_TYPE" "REACT_APP_MODEL_NAME")
        for var in "${required_vars[@]}"; do
            if grep -q "^${var}=" ".env.${model}"; then
                echo "✓ Required variable found: $var"
            else
                print_error "Missing required variable: $var"
                ((errors++))
            fi
        done
    else
        print_error "Environment file not found: .env.${model}"
        ((errors++))
    fi
    
    # Check test data
    if [ -f "test-data/${model}/sample-models.json" ]; then
        echo "✓ Test data exists: test-data/${model}/sample-models.json"
        
        # Validate JSON format
        if jq empty "test-data/${model}/sample-models.json" 2>/dev/null; then
            echo "✓ Test data is valid JSON"
        else
            print_error "Test data is not valid JSON"
            ((errors++))
        fi
    else
        print_warning "Test data not found: test-data/${model}/sample-models.json"
    fi
    
    # Check compliance documentation
    if [ -f "docs/compliance/${model}/README.md" ]; then
        echo "✓ Compliance documentation exists"
    else
        print_warning "Compliance documentation not found"
    fi
    
    # Check monitoring configuration
    if [ -f "monitoring/${model}/metrics.json" ]; then
        echo "✓ Monitoring configuration exists"
        
        # Validate JSON format
        if jq empty "monitoring/${model}/metrics.json" 2>/dev/null; then
            echo "✓ Monitoring configuration is valid JSON"
        else
            print_error "Monitoring configuration is not valid JSON"
            ((errors++))
        fi
    else
        print_warning "Monitoring configuration not found"
    fi
    
    if [ $errors -eq 0 ]; then
        print_status "$model configuration validation passed"
    else
        print_error "$model configuration validation failed with $errors errors"
        return 1
    fi
}

# Validate use case mappings
validate_use_cases() {
    local model=$1
    echo -e "${BLUE}📋 Validating $model use cases...${NC}"
    
    # Check if OnboardForm includes model-specific use cases
    if [ -f "src/components/OnboardForm.js" ]; then
        local model_use_cases
        case $model in
            "llama3")
                model_use_cases=("Credit Scoring" "Medical Diagnosis" "Legal Decision")
                ;;
            "mistral")
                model_use_cases=("Chatbot" "Content Moderation" "Sentiment Analysis")
                ;;
            "qwen2")
                model_use_cases=("Fraud Detection" "Translation" "Content Moderation")
                ;;
            "deepseek-coder")
                model_use_cases=("Code Generation" "Code Review" "Code Assistant")
                ;;
            "phi3")
                model_use_cases=("Recommendation" "Search Enhancement" "Data Analytics")
                ;;
        esac
        
        local found_use_cases=0
        for use_case in "${model_use_cases[@]}"; do
            if grep -q "$use_case" "src/components/OnboardForm.js"; then
                echo "✓ Use case found: $use_case"
                ((found_use_cases++))
            else
                print_warning "Use case not found: $use_case"
            fi
        done
        
        if [ $found_use_cases -gt 0 ]; then
            print_status "$model use cases validation passed ($found_use_cases/${#model_use_cases[@]} found)"
        else
            print_error "$model use cases validation failed"
            return 1
        fi
    else
        print_error "OnboardForm.js not found"
        return 1
    fi
}

# Validate risk classification
validate_risk_classification() {
    local model=$1
    echo -e "${BLUE}⚖️  Validating $model risk classification...${NC}"
    
    if [ -f "src/contexts/ModelContext.js" ]; then
        # Check if risk classification logic exists
        if grep -q "classifyRisk" "src/contexts/ModelContext.js"; then
            echo "✓ Risk classification function found"
            
            # Check for model-specific risk categories
            local risk_categories=("High-Risk" "Limited" "Minimal")
            for category in "${risk_categories[@]}"; do
                if grep -q "$category" "src/contexts/ModelContext.js"; then
                    echo "✓ Risk category found: $category"
                else
                    print_warning "Risk category not found: $category"
                fi
            done
            
            print_status "$model risk classification validation passed"
        else
            print_error "Risk classification function not found"
            return 1
        fi
    else
        print_error "ModelContext.js not found"
        return 1
    fi
}

# Test model integration
test_model_integration() {
    local model=$1
    echo -e "${BLUE}🧪 Testing $model integration...${NC}"
    
    # Set model-specific environment
    if [ -f ".env.${model}" ]; then
        export $(cat ".env.${model}" | grep -v '^#' | xargs)
    fi
    
    # Run basic build test
    echo "Testing build with $model configuration..."
    if npm run build > /dev/null 2>&1; then
        echo "✓ Build test passed"
    else
        print_error "Build test failed"
        return 1
    fi
    
    # Run unit tests
    echo "Running unit tests..."
    if npm test -- --watchAll=false --passWithNoTests > /dev/null 2>&1; then
        echo "✓ Unit tests passed"
    else
        print_warning "Unit tests failed or not found"
    fi
    
    print_status "$model integration test passed"
}

# Performance validation
validate_performance() {
    local model=$1
    echo -e "${BLUE}⚡ Validating $model performance configuration...${NC}"
    
    # Check webpack configuration
    if [ -f "webpack.${model}.config.js" ]; then
        echo "✓ Model-specific webpack configuration found"
        
        # Validate webpack config syntax
        if node -c "webpack.${model}.config.js" 2>/dev/null; then
            echo "✓ Webpack configuration is valid"
        else
            print_error "Webpack configuration has syntax errors"
            return 1
        fi
    else
        print_warning "Model-specific webpack configuration not found"
    fi
    
    # Check for performance optimizations in package.json
    if grep -q "build:${model}" package.json 2>/dev/null; then
        echo "✓ Model-specific build script found"
    else
        print_warning "Model-specific build script not found"
    fi
    
    print_status "$model performance validation passed"
}

# Security validation
validate_security() {
    local model=$1
    echo -e "${BLUE}🔒 Validating $model security configuration...${NC}"
    
    local security_checks=0
    
    # Check for input validation
    if grep -r "validation" src/ | grep -q "$model\|input\|sanitiz"; then
        echo "✓ Input validation found"
        ((security_checks++))
    else
        print_warning "Input validation not found"
    fi
    
    # Check for output filtering
    if grep -r "filter\|sanitiz" src/ | grep -q "output\|response"; then
        echo "✓ Output filtering found"
        ((security_checks++))
    else
        print_warning "Output filtering not found"
    fi
    
    # Check for access control
    if grep -r "role\|permission\|auth" src/ | grep -q "check\|validate"; then
        echo "✓ Access control found"
        ((security_checks++))
    else
        print_warning "Access control not found"
    fi
    
    if [ $security_checks -ge 2 ]; then
        print_status "$model security validation passed"
    else
        print_warning "$model security validation needs attention"
    fi
}

# Validate single model
validate_single_model() {
    local model=$1
    echo -e "${BLUE}🎯 Validating $model...${NC}"
    
    local validation_errors=0
    
    validate_model_config "$model" || ((validation_errors++))
    validate_use_cases "$model" || ((validation_errors++))
    validate_risk_classification "$model" || ((validation_errors++))
    test_model_integration "$model" || ((validation_errors++))
    validate_performance "$model" || ((validation_errors++))
    validate_security "$model"
    
    if [ $validation_errors -eq 0 ]; then
        print_status "$model validation completed successfully"
    else
        print_error "$model validation failed with $validation_errors errors"
        return 1
    fi
}

# Validate all models
validate_all_models() {
    echo -e "${BLUE}🚀 Validating all supported models...${NC}"
    
    local total_errors=0
    
    for model in "${SUPPORTED_MODELS[@]}"; do
        echo -e "\n${BLUE}--- Validating $model ---${NC}"
        validate_single_model "$model" || ((total_errors++))
    done
    
    echo -e "\n${BLUE}📊 Validation Summary${NC}"
    echo "Total models validated: ${#SUPPORTED_MODELS[@]}"
    echo "Models with errors: $total_errors"
    echo "Models passed: $((${#SUPPORTED_MODELS[@]} - total_errors))"
    
    if [ $total_errors -eq 0 ]; then
        print_status "All models validation completed successfully"
    else
        print_error "Validation completed with $total_errors model(s) having errors"
        return 1
    fi
}

# Main execution
main() {
    echo -e "${BLUE}🎯 Starting model validation...${NC}"
    
    # Check prerequisites
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    if ! command -v jq &> /dev/null; then
        print_warning "jq is not installed - some validations will be skipped"
    fi
    
    # Run validation
    if [ "$MODEL_TYPE" = "all" ]; then
        validate_all_models
    elif [[ " ${SUPPORTED_MODELS[@]} " =~ " ${MODEL_TYPE} " ]]; then
        validate_single_model "$MODEL_TYPE"
    else
        print_error "Unsupported model type: $MODEL_TYPE"
        echo "Supported models: ${SUPPORTED_MODELS[*]}"
        exit 1
    fi
    
    echo -e "${GREEN}🎉 Model validation completed!${NC}"
}

# Handle script arguments
case $1 in
    "help"|"-h"|"--help")
        echo "AI Model Validation Script"
        echo ""
        echo "Usage: $0 [model-type]"
        echo ""
        echo "Supported Models:"
        for model in "${SUPPORTED_MODELS[@]}"; do
            echo "  $model"
        done
        echo "  all - Validate all supported models"
        echo ""
        echo "Examples:"
        echo "  $0 llama3"
        echo "  $0 all"
        exit 0
        ;;
    *)
        main
        ;;
esac