-- AI Compliance Platform Database Initialization
-- PostgreSQL Schema

-- Create database (if running as superuser)
-- CREATE DATABASE ai_compliance;

-- Connect to database
\c ai_compliance;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'inspector', 'user')),
    organization_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Assessments table
CREATE TABLE IF NOT EXISTS assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    assessor_id UUID REFERENCES users(id),
    assessment_type VARCHAR(50) NOT NULL,
    industry_profile VARCHAR(100),
    compliance_score DECIMAL(5,2),
    status VARCHAR(50) DEFAULT 'in_progress',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Guardrail rules table
CREATE TABLE IF NOT EXISTS guardrail_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    rule_type VARCHAR(50) NOT NULL,
    pattern TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'medium',
    industry VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Models table
CREATE TABLE IF NOT EXISTS ai_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    provider VARCHAR(100) NOT NULL,
    model_version VARCHAR(50),
    description TEXT,
    capabilities JSONB,
    industry_support JSONB,
    status VARCHAR(50) DEFAULT 'active',
    is_recommended BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Model configurations table
CREATE TABLE IF NOT EXISTS model_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    model_id UUID REFERENCES ai_models(id),
    configuration JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Test results table
CREATE TABLE IF NOT EXISTS test_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    model_id UUID REFERENCES ai_models(id),
    test_content TEXT,
    filtered_content TEXT,
    violations JSONB,
    compliance_score DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

-- Model audit log table
CREATE TABLE IF NOT EXISTS model_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id UUID REFERENCES ai_models(id),
    action VARCHAR(50) NOT NULL,
    changes JSONB,
    performed_by UUID REFERENCES users(id),
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT
);

-- Audit trail table
CREATE TABLE IF NOT EXISTS audit_trail (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_organization ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_assessments_organization ON assessments(organization_id);
CREATE INDEX IF NOT EXISTS idx_assessments_status ON assessments(status);
CREATE INDEX IF NOT EXISTS idx_guardrail_rules_organization ON guardrail_rules(organization_id);
CREATE INDEX IF NOT EXISTS idx_guardrail_rules_industry ON guardrail_rules(industry);
CREATE INDEX IF NOT EXISTS idx_ai_models_status ON ai_models(status);
CREATE INDEX IF NOT EXISTS idx_ai_models_provider ON ai_models(provider);
CREATE INDEX IF NOT EXISTS idx_test_results_organization ON test_results(organization_id);
CREATE INDEX IF NOT EXISTS idx_test_results_model ON test_results(model_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_user ON audit_trail(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_organization ON audit_trail(organization_id);
CREATE INDEX IF NOT EXISTS idx_model_audit_log_model ON model_audit_log(model_id);

-- Insert default admin user (password: admin123)
-- Note: This is a bcrypt hash of 'admin123' - change in production!
INSERT INTO users (id, username, email, password_hash, role, is_active)
VALUES (
    uuid_generate_v4(),
    'admin',
    'admin@aicomplianceplatform.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5aeJEYoDgCRWu',
    'admin',
    TRUE
) ON CONFLICT (username) DO NOTHING;

-- Insert default inspector user (password: inspector123)
INSERT INTO users (id, username, email, password_hash, role, is_active)
VALUES (
    uuid_generate_v4(),
    'inspector',
    'inspector@regulatory.gov',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5aeJEYoDgCRWu',
    'inspector',
    TRUE
) ON CONFLICT (username) DO NOTHING;

-- Insert sample AI models
INSERT INTO ai_models (id, name, provider, model_version, description, capabilities, industry_support, status, is_recommended)
VALUES
    (uuid_generate_v4(), 'GPT-4', 'OpenAI', '4.0', 'Most capable GPT-4 model', 
     '["text_generation", "code_generation", "analysis", "reasoning"]'::jsonb,
     '["financial_services", "healthcare", "automotive", "government"]'::jsonb,
     'active', TRUE),
    (uuid_generate_v4(), 'Claude 3 Opus', 'Anthropic', '3.0', 'Most capable Claude model',
     '["text_generation", "analysis", "reasoning", "safety"]'::jsonb,
     '["financial_services", "healthcare", "automotive", "government"]'::jsonb,
     'active', TRUE),
    (uuid_generate_v4(), 'Claude 3 Sonnet', 'Anthropic', '3.0', 'Balanced Claude model',
     '["text_generation", "analysis", "reasoning"]'::jsonb,
     '["financial_services", "healthcare", "government"]'::jsonb,
     'active', FALSE),
    (uuid_generate_v4(), 'GPT-3.5 Turbo', 'OpenAI', '3.5', 'Fast and efficient model',
     '["text_generation", "analysis"]'::jsonb,
     '["financial_services", "healthcare", "government"]'::jsonb,
     'active', FALSE),
    (uuid_generate_v4(), 'Gemini Pro', 'Google', '1.0', 'Google multimodal model',
     '["text_generation", "multimodal", "analysis"]'::jsonb,
     '["financial_services", "automotive", "government"]'::jsonb,
     'active', FALSE),
    (uuid_generate_v4(), 'Llama 2 70B', 'Meta', '2.0', 'Open source large model',
     '["text_generation", "code_generation"]'::jsonb,
     '["financial_services", "automotive"]'::jsonb,
     'active', FALSE),
    (uuid_generate_v4(), 'Mistral Large', 'Mistral AI', '1.0', 'European AI model',
     '["text_generation", "analysis", "multilingual"]'::jsonb,
     '["financial_services", "government"]'::jsonb,
     'active', FALSE)
ON CONFLICT DO NOTHING;

-- Grant permissions (adjust as needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ai_compliance_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ai_compliance_user;
