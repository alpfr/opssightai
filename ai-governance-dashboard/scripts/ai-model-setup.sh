#!/bin/bash

# AI Model Setup and Validation Script
# Usage: ./scripts/ai-model-setup.sh [model-type] [environment]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
MODEL_TYPE=${1:-"all"}
ENVIRONMENT=${2:-"development"}

echo -e "${BLUE}🤖 AI Model Setup and Validation Script${NC}"
echo -e "${BLUE}Model Type: $MODEL_TYPE${NC}"
echo -e "${BLUE}Environment: $ENVIRONMENT${NC}"

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

# Supported AI models configuration
declare -A MODEL_CONFIGS
MODEL_CONFIGS[llama3]="Meta Llama3 - Large Language Model"
MODEL_CONFIGS[mistral]="Mistral AI - Efficient Language Model"
MODEL_CONFIGS[qwen2]="Alibaba Qwen2 - Multilingual Model"
MODEL_CONFIGS[deepseek-coder]="DeepSeek Coder - Code Generation Model"
MODEL_CONFIGS[phi3]="Microsoft Phi3 - Small Language Model"

# Model-specific use case mappings
get_model_use_cases() {
    local model=$1
    case $model in
        "llama3")
            echo "Credit Scoring,Medical Diagnosis,Legal Decision,Chatbot,Text Generation,Question Answering"
            ;;
        "mistral")
            echo "Chatbot,Content Moderation,Sentiment Analysis,Text Summarization,Conversational AI"
            ;;
        "qwen2")
            echo "Fraud Detection,Translation,Content Moderation,Multilingual Processing"
            ;;
        "deepseek-coder")
            echo "Code Generation,Code Review,Document Processing,Code Assistant"
            ;;
        "phi3")
            echo "Recommendation,Search Enhancement,Data Analytics,Embedding Generation"
            ;;
        *)
            echo "Custom,Large Language Model (LLM)"
            ;;
    esac
}

# Model-specific risk assessment
get_model_risk_profile() {
    local model=$1
    case $model in
        "llama3")
            echo "High-Risk: Suitable for critical applications but requires careful governance"
            ;;
        "mistral")
            echo "Limited Risk: Good balance of capability and safety for most applications"
            ;;
        "qwen2")
            echo "Limited Risk: Strong multilingual capabilities with moderate risk profile"
            ;;
        "deepseek-coder")
            echo "Limited Risk: Specialized for code tasks with built-in safety measures"
            ;;
        "phi3")
            echo "Minimal Risk: Efficient and safe for lightweight applications"
            ;;
        *)
            echo "Variable Risk: Depends on specific use case and implementation"
            ;;
    esac
}

# Validate model configuration
validate_model_config() {
    local model=$1
    echo -e "${BLUE}🔍 Validating configuration for $model...${NC}"
    
    # Check if model is supported
    if [[ -v MODEL_CONFIGS[$model] ]]; then
        echo "Model: ${MODEL_CONFIGS[$model]}"
        echo "Use Cases: $(get_model_use_cases $model)"
        echo "Risk Profile: $(get_model_risk_profile $model)"
        print_status "Model configuration validated"
    else
        print_warning "Model $model not in predefined configurations - using generic settings"
    fi
}

# Generate model-specific environment variables
generate_model_env() {
    local model=$1
    echo -e "${BLUE}📝 Generating environment configuration for $model...${NC}"
    
    cat > ".env.${model}" << EOF
# AI Governance Dashboard - ${model} Configuration
REACT_APP_ENV=${ENVIRONMENT}
REACT_APP_MODEL_TYPE=${model}
REACT_APP_MODEL_NAME=${MODEL_CONFIGS[$model]:-"Custom AI Model"}

# Model-specific settings
REACT_APP_DEFAULT_USE_CASES=$(get_model_use_cases $model)
REACT_APP_MODEL_RISK_PROFILE=$(get_model_risk_profile $model | cut -d: -f1)

# Compliance settings
REACT_APP_ENABLE_COMPLIANCE_TRACKING=true
REACT_APP_ENABLE_DPO_WORKFLOW=true
REACT_APP_ENABLE_RISK_ASSESSMENT=true

# Demo settings
REACT_APP_DEMO_MODE=true
REACT_APP_DEMO_MODEL_TYPE=${model}
EOF
    
    print_status "Environment configuration generated: .env.${model}"
}

# Create model-specific test data
generate_test_data() {
    local model=$1
    echo -e "${BLUE}🧪 Generating test data for $model...${NC}"
    
    mkdir -p "test-data/${model}"
    
    cat > "test-data/${model}/sample-models.json" << EOF
{
    "models": [
        {
            "name": "${MODEL_CONFIGS[$model]:-$model} Demo Model",
            "type": "$model",
            "useCase": "$(get_model_use_cases $model | cut -d, -f1)",
            "riskTier": "$(get_model_risk_profile $model | cut -d: -f1)",
            "description": "Demo model for testing ${model} integration",
            "complianceStatus": "Pending",
            "dpoSignOff": false
        }
    ]
}
EOF
    
    print_status "Test data generated: test-data/${model}/"
}

# Validate AI model integration
validate_integration() {
    local model=$1
    echo -e "${BLUE}🔧 Validating integration for $model...${NC}"
    
    # Check if required files exist
    local required_files=("src/components/OnboardForm.js" "src/contexts/ModelContext.js")
    
    for file in "${required_files[@]}"; do
        if [ -f "$file" ]; then
            # Check if model-specific use cases are included
            if grep -q "$(get_model_use_cases $model | cut -d, -f1)" "$file"; then
                echo "✓ $file includes $model use cases"
            else
                print_warning "$file may need updates for $model use cases"
            fi
        else
            print_error "Required file not found: $file"
        fi
    done
    
    print_status "Integration validation completed"
}

# Performance optimization for AI models
optimize_for_model() {
    local model=$1
    echo -e "${BLUE}⚡ Optimizing performance for $model...${NC}"
    
    # Create model-specific webpack config
    cat > "webpack.${model}.config.js" << EOF
const path = require('path');

module.exports = {
    // Model-specific optimizations for ${model}
    resolve: {
        alias: {
            '@models': path.resolve(__dirname, 'src/models/${model}'),
            '@config': path.resolve(__dirname, 'src/config/${model}')
        }
    },
    
    optimization: {
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                ${model}: {
                    test: /[\\/]node_modules[\\/].*${model}.*[\\/]/,
                    name: '${model}-vendor',
                    chunks: 'all',
                }
            }
        }
    }
};
EOF
    
    print_status "Performance optimization configured for $model"
}

# Generate compliance documentation
generate_compliance_docs() {
    local model=$1
    echo -e "${BLUE}📋 Generating compliance documentation for $model...${NC}"
    
    mkdir -p "docs/compliance/${model}"
    
    cat > "docs/compliance/${model}/README.md" << EOF
# ${MODEL_CONFIGS[$model]:-$model} Compliance Guide

## Model Overview
- **Model Type**: $model
- **Risk Profile**: $(get_model_risk_profile $model)
- **Supported Use Cases**: $(get_model_use_cases $model | tr ',' '\n' | sed 's/^/- /')

## Compliance Requirements

### High-Risk Applications
- Requires DPO approval
- Mandatory compliance review
- Regular audit trail
- Documentation of decision logic

### Limited Risk Applications  
- Standard compliance review
- DPO sign-off recommended
- Regular monitoring
- Basic documentation

### Minimal Risk Applications
- Basic compliance check
- Self-certification allowed
- Periodic review
- Minimal documentation

## Implementation Guidelines

### 1. Model Onboarding
\`\`\`bash
# Use the AI model setup script
./scripts/ai-model-setup.sh $model production

# Configure environment
cp .env.$model .env.local

# Start application
npm start
\`\`\`

### 2. Compliance Workflow
1. Developer onboards model using the dashboard
2. System automatically classifies risk tier
3. DPO reviews and approves (if required)
4. Model enters production with monitoring

### 3. Monitoring and Maintenance
- Regular compliance status reviews
- Performance monitoring
- Security assessments
- Documentation updates

## Risk Mitigation

### Technical Measures
- Input validation and sanitization
- Output filtering and monitoring
- Rate limiting and access controls
- Audit logging and traceability

### Organizational Measures
- Clear governance policies
- Regular training and awareness
- Incident response procedures
- Continuous improvement processes

## Contact Information
- **DPO**: dpo@demo.com
- **Technical Lead**: developer@demo.com  
- **Executive Sponsor**: executive@demo.com
EOF
    
    print_status "Compliance documentation generated: docs/compliance/${model}/"
}

# Setup monitoring for AI models
setup_monitoring() {
    local model=$1
    echo -e "${BLUE}📊 Setting up monitoring for $model...${NC}"
    
    mkdir -p "monitoring/${model}"
    
    cat > "monitoring/${model}/metrics.json" << EOF
{
    "model": "$model",
    "metrics": {
        "performance": {
            "response_time": "< 2s",
            "throughput": "> 100 req/min",
            "availability": "> 99.9%"
        },
        "compliance": {
            "risk_assessment": "automated",
            "dpo_approval": "required_for_high_risk",
            "audit_trail": "enabled"
        },
        "security": {
            "input_validation": "enabled",
            "output_filtering": "enabled",
            "access_control": "rbac"
        }
    },
    "alerts": {
        "high_risk_deployment": "immediate",
        "compliance_failure": "within_1h",
        "performance_degradation": "within_5m"
    }
}
EOF
    
    print_status "Monitoring configuration created: monitoring/${model}/"
}

# Main setup process
setup_model() {
    local model=$1
    echo -e "${BLUE}🎯 Setting up $model...${NC}"
    
    validate_model_config $model
    generate_model_env $model
    generate_test_data $model
    validate_integration $model
    optimize_for_model $model
    generate_compliance_docs $model
    setup_monitoring $model
    
    print_status "$model setup completed"
}

# Setup all supported models
setup_all_models() {
    echo -e "${BLUE}🚀 Setting up all supported AI models...${NC}"
    
    for model in "${!MODEL_CONFIGS[@]}"; do
        setup_model $model
    done
    
    print_status "All models setup completed"
}

# Main execution
main() {
    echo -e "${BLUE}🎯 Starting AI model setup process...${NC}"
    
    if [ "$MODEL_TYPE" = "all" ]; then
        setup_all_models
    elif [[ -v MODEL_CONFIGS[$MODEL_TYPE] ]]; then
        setup_model $MODEL_TYPE
    else
        print_error "Unsupported model type: $MODEL_TYPE"
        echo "Supported models: ${!MODEL_CONFIGS[*]}"
        exit 1
    fi
    
    echo -e "${GREEN}🎉 AI model setup completed successfully!${NC}"
    echo -e "${BLUE}📋 Next Steps:${NC}"
    echo -e "  1. Review generated configurations in .env.* files"
    echo -e "  2. Check compliance documentation in docs/compliance/"
    echo -e "  3. Test model integration: npm start"
    echo -e "  4. Deploy with: ./scripts/deploy.sh $ENVIRONMENT"
}

# Handle script arguments
case $1 in
    "help"|"-h"|"--help")
        echo "AI Model Setup and Validation Script"
        echo ""
        echo "Usage: $0 [model-type] [environment]"
        echo ""
        echo "Supported Models:"
        for model in "${!MODEL_CONFIGS[@]}"; do
            echo "  $model - ${MODEL_CONFIGS[$model]}"
        done
        echo "  all - Setup all supported models"
        echo ""
        echo "Environments: development, staging, production"
        echo ""
        echo "Examples:"
        echo "  $0 llama3 production"
        echo "  $0 mistral staging"
        echo "  $0 all development"
        exit 0
        ;;
    *)
        main
        ;;
esac