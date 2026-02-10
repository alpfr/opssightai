"""
AI Compliance Platform - Main FastAPI Application
Sample backend API for the MVP prototype
"""

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, validator
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import jwt
import hashlib
import sqlite3
import json
import os
from contextlib import contextmanager

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "ai-compliance-platform-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
DATABASE_URL = os.getenv("DATABASE_URL", "ai_compliance.db")

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_database()
    
    # Create sample data
    with get_db() as conn:
        # Check if sample data already exists
        existing_org = conn.execute("SELECT id FROM organizations LIMIT 1").fetchone()
        if not existing_org:
            # Create sample organization
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO organizations (name, industry, jurisdiction) VALUES (?, ?, ?)",
                ("Sample Financial Corp", "financial_services", "US")
            )
            org_id = cursor.lastrowid
            
            # Create sample admin user
            cursor.execute(
                "INSERT INTO users (username, password_hash, role, organization_id) VALUES (?, ?, ?, ?)",
                ("admin", hash_password("admin123"), "organization_admin", org_id)
            )
            
            # Create sample regulatory inspector
            cursor.execute(
                "INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)",
                ("inspector", hash_password("inspector123"), "regulatory_inspector")
            )
            
            # Create sample guardrail rules
            sample_rules = [
                ("PII Protection - SSN", "pii_protection", r"\b\d{3}-\d{2}-\d{4}\b", "block"),
                ("PII Protection - Credit Card", "pii_protection", r"\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b", "block"),
                ("Regulatory Language - Investment Advice", "regulatory_language", r"\b(guaranteed returns|risk-free investment)\b", "flag"),
            ]
            
            for name, rule_type, pattern, action in sample_rules:
                cursor.execute(
                    "INSERT INTO guardrail_rules (name, rule_type, pattern, action, industry_profile) VALUES (?, ?, ?, ?, ?)",
                    (name, rule_type, pattern, action, "financial_services")
                )
            
            # Create sample AI models for LLM assessment
            sample_models = [
                {
                    "id": "gpt-4",
                    "name": "GPT-4",
                    "provider": "OpenAI",
                    "version": "gpt-4-0125-preview",
                    "description": "Large multimodal model with advanced reasoning capabilities",
                    "capabilities": json.dumps(["text_generation", "code_generation", "analysis", "reasoning"]),
                    "supported_industries": json.dumps(["financial_services", "healthcare", "automotive", "government"]),
                    "is_active": True,
                    "is_recommended": True
                },
                {
                    "id": "gpt-3.5-turbo",
                    "name": "GPT-3.5 Turbo",
                    "provider": "OpenAI", 
                    "version": "gpt-3.5-turbo-0125",
                    "description": "Fast and efficient model for most conversational tasks",
                    "capabilities": json.dumps(["text_generation", "conversation", "summarization"]),
                    "supported_industries": json.dumps(["financial_services", "healthcare", "government"]),
                    "is_active": True,
                    "is_recommended": False
                },
                {
                    "id": "claude-3-opus",
                    "name": "Claude 3 Opus",
                    "provider": "Anthropic",
                    "version": "claude-3-opus-20240229",
                    "description": "Most capable model for complex tasks requiring deep reasoning",
                    "capabilities": json.dumps(["text_generation", "analysis", "reasoning", "code_generation"]),
                    "supported_industries": json.dumps(["financial_services", "healthcare", "automotive", "government"]),
                    "is_active": True,
                    "is_recommended": True
                },
                {
                    "id": "claude-3-sonnet",
                    "name": "Claude 3 Sonnet",
                    "provider": "Anthropic",
                    "version": "claude-3-sonnet-20240229", 
                    "description": "Balanced model offering strong performance with good speed",
                    "capabilities": json.dumps(["text_generation", "analysis", "conversation"]),
                    "supported_industries": json.dumps(["financial_services", "healthcare", "government"]),
                    "is_active": True,
                    "is_recommended": False
                },
                {
                    "id": "gemini-pro",
                    "name": "Gemini Pro",
                    "provider": "Google",
                    "version": "gemini-1.0-pro",
                    "description": "Google's advanced AI model for text and reasoning tasks",
                    "capabilities": json.dumps(["text_generation", "reasoning", "analysis"]),
                    "supported_industries": json.dumps(["financial_services", "automotive", "government"]),
                    "is_active": True,
                    "is_recommended": False
                },
                {
                    "id": "llama-2-70b",
                    "name": "Llama 2 70B",
                    "provider": "Meta",
                    "version": "llama-2-70b-chat",
                    "description": "Open-source large language model for various applications",
                    "capabilities": json.dumps(["text_generation", "conversation", "code_generation"]),
                    "supported_industries": json.dumps(["financial_services", "automotive"]),
                    "is_active": True,
                    "is_recommended": False
                },
                {
                    "id": "mistral-large",
                    "name": "Mistral Large",
                    "provider": "Mistral AI",
                    "version": "mistral-large-latest",
                    "description": "High-performance model with strong multilingual capabilities",
                    "capabilities": json.dumps(["text_generation", "multilingual", "reasoning"]),
                    "supported_industries": json.dumps(["financial_services", "government"]),
                    "is_active": True,
                    "is_recommended": False
                }
            ]
            
            for model in sample_models:
                cursor.execute("""
                    INSERT INTO ai_models (id, name, provider, version, description, capabilities, supported_industries, is_active, is_recommended)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    model["id"], model["name"], model["provider"], model["version"],
                    model["description"], model["capabilities"], model["supported_industries"],
                    model["is_active"], model["is_recommended"]
                ))
            
            # Create default model configurations for the sample organization
            default_configs = [
                {
                    "model_id": "gpt-4",
                    "settings": json.dumps({
                        "temperature": 0.1,
                        "max_tokens": 1000,
                        "compliance_mode": "strict",
                        "bias_detection": True
                    })
                },
                {
                    "model_id": "claude-3-opus", 
                    "settings": json.dumps({
                        "temperature": 0.0,
                        "max_tokens": 1000,
                        "compliance_mode": "strict",
                        "safety_settings": "high"
                    })
                }
            ]
            
            for config in default_configs:
                cursor.execute("""
                    INSERT INTO model_configurations (model_id, organization_id, settings)
                    VALUES (?, ?, ?)
                """, (config["model_id"], org_id, config["settings"]))
            
            conn.commit()
    
    yield
    # Shutdown (if needed)

# FastAPI app initialization
app = FastAPI(
    title="AI Compliance Platform API",
    description="Sample backend API for AI compliance assessment and guardrail management",
    version="1.0.0",
    lifespan=lifespan,
    root_path="/api"
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:8080"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Pydantic Models
class UserLogin(BaseModel):
    username: str
    password: str

class UserCreate(BaseModel):
    username: str
    password: str
    role: str = "organization_admin"  # organization_admin, regulatory_inspector
    organization_name: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str
    user_role: str
    organization_id: Optional[int] = None

class Organization(BaseModel):
    id: Optional[int] = None
    name: str
    industry: str = "financial_services"
    jurisdiction: str = "US"
    created_at: Optional[datetime] = None

class Assessment(BaseModel):
    id: Optional[int] = None
    organization_id: int
    assessment_type: str  # "self" or "regulatory"
    industry_profile: str = "financial_services"
    jurisdiction: str = "US"
    status: str = "in_progress"  # in_progress, completed, under_review
    compliance_score: Optional[float] = None
    findings: List[str] = []
    created_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

class GuardrailRule(BaseModel):
    id: Optional[int] = None
    name: str
    rule_type: str  # pii_protection, regulatory_language, bias_check
    pattern: str
    action: str = "block"  # block, flag, escalate
    is_active: bool = True
    industry_profile: str = "financial_services"
    created_at: Optional[datetime] = None

class LLMFilterRequest(BaseModel):
    content: str
    context: Dict[str, Any] = {}
    industry_profile: str = "financial_services"
    jurisdiction: str = "US"
    model_id: Optional[str] = None  # New field for LLM assessment

class LLMFilterResponse(BaseModel):
    filtered_content: str
    is_compliant: bool
    violations: List[str] = []
    applied_rules: List[str] = []
    model_used: Optional[str] = None  # New field
    model_info: Optional[Dict[str, Any]] = None  # New field

class AIModel(BaseModel):
    id: str
    name: str
    provider: str
    version: str
    description: str
    capabilities: List[str]
    supported_industries: List[str]
    is_active: bool = True
    is_recommended: bool = False
    created_at: Optional[datetime] = None

class ModelConfiguration(BaseModel):
    id: Optional[int] = None
    model_id: str
    organization_id: int
    settings: Dict[str, Any] = {}
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    @validator('settings')
    def validate_settings(cls, v):
        """Validate model configuration settings"""
        if not isinstance(v, dict):
            raise ValueError('Settings must be a dictionary')
        
        # Validate common settings
        if 'temperature' in v:
            temp = v['temperature']
            if not isinstance(temp, (int, float)) or temp < 0 or temp > 2:
                raise ValueError('Temperature must be a number between 0 and 2')
        
        if 'max_tokens' in v:
            max_tokens = v['max_tokens']
            if not isinstance(max_tokens, int) or max_tokens < 1 or max_tokens > 100000:
                raise ValueError('Max tokens must be an integer between 1 and 100000')
        
        if 'compliance_mode' in v:
            if v['compliance_mode'] not in ['strict', 'moderate', 'lenient']:
                raise ValueError('Compliance mode must be one of: strict, moderate, lenient')
        
        return v

# Enhanced models for LLM Management
class AIModelCreate(BaseModel):
    id: str
    name: str
    provider: str
    version: str = "latest"
    description: str = ""
    capabilities: List[str] = []
    supported_industries: List[str] = []
    is_active: bool = True
    is_recommended: bool = False
    status: str = "active"
    
    @validator('id')
    def validate_id(cls, v):
        """Validate model ID format"""
        if not v or not isinstance(v, str):
            raise ValueError('Model ID is required and must be a string')
        if len(v) < 2 or len(v) > 50:
            raise ValueError('Model ID must be between 2 and 50 characters')
        # Allow alphanumeric, hyphens, and underscores
        import re
        if not re.match(r'^[a-zA-Z0-9_-]+$', v):
            raise ValueError('Model ID can only contain letters, numbers, hyphens, and underscores')
        return v.lower()
    
    @validator('name')
    def validate_name(cls, v):
        """Validate model name"""
        if not v or not isinstance(v, str):
            raise ValueError('Model name is required')
        if len(v) < 2 or len(v) > 100:
            raise ValueError('Model name must be between 2 and 100 characters')
        return v.strip()
    
    @validator('provider')
    def validate_provider(cls, v):
        """Validate provider name"""
        if not v or not isinstance(v, str):
            raise ValueError('Provider is required')
        if len(v) < 2 or len(v) > 50:
            raise ValueError('Provider name must be between 2 and 50 characters')
        return v.strip()
    
    @validator('capabilities')
    def validate_capabilities(cls, v):
        """Validate capabilities list"""
        if not isinstance(v, list):
            raise ValueError('Capabilities must be a list')
        if len(v) == 0:
            raise ValueError('At least one capability is required')
        valid_capabilities = [
            'text_generation', 'code_generation', 'analysis', 'reasoning',
            'conversation', 'summarization', 'translation', 'multilingual',
            'image_analysis', 'document_processing'
        ]
        for cap in v:
            if cap not in valid_capabilities:
                raise ValueError(f'Invalid capability: {cap}. Valid options: {", ".join(valid_capabilities)}')
        return v
    
    @validator('supported_industries')
    def validate_supported_industries(cls, v):
        """Validate supported industries"""
        if not isinstance(v, list):
            raise ValueError('Supported industries must be a list')
        if len(v) == 0:
            raise ValueError('At least one supported industry is required')
        valid_industries = ['financial_services', 'healthcare', 'automotive', 'government', 'education', 'retail']
        for industry in v:
            if industry not in valid_industries:
                raise ValueError(f'Invalid industry: {industry}. Valid options: {", ".join(valid_industries)}')
        return v
    
    @validator('status')
    def validate_status(cls, v):
        """Validate model status"""
        valid_statuses = ['active', 'inactive', 'deprecated']
        if v not in valid_statuses:
            raise ValueError(f'Status must be one of: {", ".join(valid_statuses)}')
        return v

class AIModelUpdate(BaseModel):
    name: Optional[str] = None
    provider: Optional[str] = None
    version: Optional[str] = None
    description: Optional[str] = None
    capabilities: Optional[List[str]] = None
    supported_industries: Optional[List[str]] = None
    is_active: Optional[bool] = None
    is_recommended: Optional[bool] = None
    status: Optional[str] = None
    
    @validator('name')
    def validate_name(cls, v):
        """Validate model name"""
        if v is not None:
            if not isinstance(v, str) or len(v) < 2 or len(v) > 100:
                raise ValueError('Model name must be between 2 and 100 characters')
            return v.strip()
        return v
    
    @validator('provider')
    def validate_provider(cls, v):
        """Validate provider name"""
        if v is not None:
            if not isinstance(v, str) or len(v) < 2 or len(v) > 50:
                raise ValueError('Provider name must be between 2 and 50 characters')
            return v.strip()
        return v
    
    @validator('capabilities')
    def validate_capabilities(cls, v):
        """Validate capabilities list"""
        if v is not None:
            if not isinstance(v, list) or len(v) == 0:
                raise ValueError('Capabilities must be a non-empty list')
            valid_capabilities = [
                'text_generation', 'code_generation', 'analysis', 'reasoning',
                'conversation', 'summarization', 'translation', 'multilingual',
                'image_analysis', 'document_processing'
            ]
            for cap in v:
                if cap not in valid_capabilities:
                    raise ValueError(f'Invalid capability: {cap}')
        return v
    
    @validator('supported_industries')
    def validate_supported_industries(cls, v):
        """Validate supported industries"""
        if v is not None:
            if not isinstance(v, list) or len(v) == 0:
                raise ValueError('Supported industries must be a non-empty list')
            valid_industries = ['financial_services', 'healthcare', 'automotive', 'government', 'education', 'retail']
            for industry in v:
                if industry not in valid_industries:
                    raise ValueError(f'Invalid industry: {industry}')
        return v
    
    @validator('status')
    def validate_status(cls, v):
        """Validate model status"""
        if v is not None:
            valid_statuses = ['active', 'inactive', 'deprecated']
            if v not in valid_statuses:
                raise ValueError(f'Status must be one of: {", ".join(valid_statuses)}')
        return v

class ModelAuditLog(BaseModel):
    id: str
    operation_type: str  # create, update, delete, bulk_delete
    model_id: Optional[str] = None
    model_name: str
    user_id: int
    user_name: str
    timestamp: datetime
    changes: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

class ModelDependency(BaseModel):
    model_id: str
    model_name: str
    dependency_type: str
    usage_count: int
    last_used: Optional[datetime] = None

class BulkOperationRequest(BaseModel):
    operation: str  # delete, update_status, export
    model_ids: List[str]
    parameters: Optional[Dict[str, Any]] = {}
    
    @validator('operation')
    def validate_operation(cls, v):
        """Validate bulk operation type"""
        valid_operations = ['delete', 'update_status', 'export']
        if v not in valid_operations:
            raise ValueError(f'Operation must be one of: {", ".join(valid_operations)}')
        return v
    
    @validator('model_ids')
    def validate_model_ids(cls, v):
        """Validate model IDs list"""
        if not isinstance(v, list) or len(v) == 0:
            raise ValueError('At least one model ID is required')
        if len(v) > 50:
            raise ValueError('Maximum 50 models can be processed in a single bulk operation')
        return v

class BulkOperationResult(BaseModel):
    operation: str
    total_models: int
    successful: int
    failed: int
    results: List[Dict[str, Any]]
    summary: str

# Database helper functions
@contextmanager
def get_db():
    conn = sqlite3.connect(DATABASE_URL)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

# Service classes for LLM Management
class ModelService:
    """Service class for AI model CRUD operations"""
    
    @staticmethod
    def create_model(model_data: AIModelCreate, user_id: int) -> AIModel:
        """Create a new AI model"""
        import uuid
        
        with get_db() as conn:
            # Check if model ID already exists
            existing = conn.execute("SELECT id FROM ai_models WHERE id = ?", (model_data.id,)).fetchone()
            if existing:
                raise HTTPException(status_code=400, detail=f"Model with ID '{model_data.id}' already exists")
            
            # Check if model name already exists
            existing_name = conn.execute("SELECT id FROM ai_models WHERE name = ?", (model_data.name,)).fetchone()
            if existing_name:
                raise HTTPException(status_code=400, detail=f"Model with name '{model_data.name}' already exists")
            
            try:
                # Insert new model
                conn.execute("""
                    INSERT INTO ai_models (
                        id, name, provider, version, description, capabilities, 
                        supported_industries, is_active, is_recommended, status, created_by
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    model_data.id, model_data.name, model_data.provider, model_data.version,
                    model_data.description, json.dumps(model_data.capabilities),
                    json.dumps(model_data.supported_industries), model_data.is_active,
                    model_data.is_recommended, model_data.status, user_id
                ))
                
                # Log audit trail
                audit_id = str(uuid.uuid4())
                conn.execute("""
                    INSERT INTO model_audit_log (
                        id, operation_type, model_id, model_name, user_id, user_name, changes
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    audit_id, "create", model_data.id, model_data.name, user_id,
                    "admin", json.dumps(model_data.dict())
                ))
                
                conn.commit()
                
                # Return created model
                return ModelService.get_model_by_id(model_data.id)
                
            except Exception as e:
                conn.rollback()
                raise HTTPException(status_code=500, detail=f"Failed to create model: {str(e)}")
    
    @staticmethod
    def get_model_by_id(model_id: str) -> AIModel:
        """Get model by ID"""
        with get_db() as conn:
            model = conn.execute("SELECT * FROM ai_models WHERE id = ?", (model_id,)).fetchone()
            if not model:
                raise HTTPException(status_code=404, detail="Model not found")
            
            model_dict = dict(model)
            model_dict["capabilities"] = json.loads(model_dict["capabilities"] or "[]")
            model_dict["supported_industries"] = json.loads(model_dict["supported_industries"] or "[]")
            
            return AIModel(**model_dict)
    
    @staticmethod
    def get_all_models(
        skip: int = 0, 
        limit: int = 100, 
        search: Optional[str] = None,
        provider: Optional[str] = None,
        industry: Optional[str] = None,
        status: Optional[str] = None
    ) -> List[AIModel]:
        """Get all models with filtering and pagination"""
        with get_db() as conn:
            conditions = []
            params = []
            
            if search:
                conditions.append("(name LIKE ? OR provider LIKE ? OR description LIKE ?)")
                search_term = f"%{search}%"
                params.extend([search_term, search_term, search_term])
            
            if provider:
                conditions.append("provider = ?")
                params.append(provider)
            
            if industry:
                conditions.append("supported_industries LIKE ?")
                params.append(f'%"{industry}"%')
            
            if status:
                conditions.append("status = ?")
                params.append(status)
            
            where_clause = " AND ".join(conditions) if conditions else "1=1"
            
            models = conn.execute(f"""
                SELECT * FROM ai_models 
                WHERE {where_clause}
                ORDER BY is_recommended DESC, name
                LIMIT ? OFFSET ?
            """, params + [limit, skip]).fetchall()
            
            result = []
            for model in models:
                model_dict = dict(model)
                model_dict["capabilities"] = json.loads(model_dict["capabilities"] or "[]")
                model_dict["supported_industries"] = json.loads(model_dict["supported_industries"] or "[]")
                result.append(AIModel(**model_dict))
            
            return result
    
    @staticmethod
    def update_model(model_id: str, model_data: AIModelUpdate, user_id: int) -> AIModel:
        """Update an existing model"""
        import uuid
        
        with get_db() as conn:
            # Get existing model
            existing = conn.execute("SELECT * FROM ai_models WHERE id = ?", (model_id,)).fetchone()
            if not existing:
                raise HTTPException(status_code=404, detail="Model not found")
            
            existing_dict = dict(existing)
            
            # Check name uniqueness if name is being updated
            if model_data.name and model_data.name != existing_dict["name"]:
                name_check = conn.execute(
                    "SELECT id FROM ai_models WHERE name = ? AND id != ?", 
                    (model_data.name, model_id)
                ).fetchone()
                if name_check:
                    raise HTTPException(status_code=400, detail=f"Model with name '{model_data.name}' already exists")
            
            try:
                # Prepare update data
                update_fields = []
                update_params = []
                changes = {}
                
                for field, value in model_data.dict(exclude_unset=True).items():
                    if value is not None:
                        if field in ['capabilities', 'supported_industries']:
                            value = json.dumps(value)
                        update_fields.append(f"{field} = ?")
                        update_params.append(value)
                        changes[field] = value
                
                if update_fields:
                    update_fields.append("updated_by = ?")
                    update_fields.append("updated_at = CURRENT_TIMESTAMP")
                    update_params.extend([user_id, model_id])
                    
                    conn.execute(f"""
                        UPDATE ai_models 
                        SET {', '.join(update_fields)}
                        WHERE id = ?
                    """, update_params)
                    
                    # Log audit trail
                    audit_id = str(uuid.uuid4())
                    conn.execute("""
                        INSERT INTO model_audit_log (
                            id, operation_type, model_id, model_name, user_id, user_name, changes
                        ) VALUES (?, ?, ?, ?, ?, ?, ?)
                    """, (
                        audit_id, "update", model_id, model_data.name or existing_dict["name"],
                        user_id, "admin", json.dumps(changes)
                    ))
                    
                    conn.commit()
                
                return ModelService.get_model_by_id(model_id)
                
            except Exception as e:
                conn.rollback()
                raise HTTPException(status_code=500, detail=f"Failed to update model: {str(e)}")
    
    @staticmethod
    def delete_model(model_id: str, user_id: int) -> dict:
        """Delete a model after checking dependencies"""
        import uuid
        
        with get_db() as conn:
            # Get existing model
            existing = conn.execute("SELECT * FROM ai_models WHERE id = ?", (model_id,)).fetchone()
            if not existing:
                raise HTTPException(status_code=404, detail="Model not found")
            
            # Check dependencies
            dependencies = DependencyService.get_model_dependencies(model_id)
            active_dependencies = [dep for dep in dependencies if dep.usage_count > 0]
            
            if active_dependencies:
                dep_details = [f"{dep.dependency_type}: {dep.usage_count} usages" for dep in active_dependencies]
                raise HTTPException(
                    status_code=400, 
                    detail=f"Cannot delete model. Active dependencies: {', '.join(dep_details)}"
                )
            
            try:
                # Delete model
                conn.execute("DELETE FROM ai_models WHERE id = ?", (model_id,))
                
                # Log audit trail
                audit_id = str(uuid.uuid4())
                conn.execute("""
                    INSERT INTO model_audit_log (
                        id, operation_type, model_id, model_name, user_id, user_name, changes
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    audit_id, "delete", model_id, existing["name"], user_id, "admin",
                    json.dumps({"deleted_model": dict(existing)})
                ))
                
                conn.commit()
                
                return {"message": f"Model '{existing['name']}' deleted successfully"}
                
            except Exception as e:
                conn.rollback()
                raise HTTPException(status_code=500, detail=f"Failed to delete model: {str(e)}")

class DependencyService:
    """Service class for model dependency checking"""
    
    @staticmethod
    def get_model_dependencies(model_id: str) -> List[ModelDependency]:
        """Get all dependencies for a model"""
        with get_db() as conn:
            dependencies = conn.execute("""
                SELECT * FROM model_dependencies WHERE model_id = ?
            """, (model_id,)).fetchall()
            
            return [ModelDependency(**dict(dep)) for dep in dependencies]
    
    @staticmethod
    def check_bulk_dependencies(model_ids: List[str]) -> Dict[str, List[ModelDependency]]:
        """Check dependencies for multiple models"""
        result = {}
        for model_id in model_ids:
            result[model_id] = DependencyService.get_model_dependencies(model_id)
        return result

class AuditService:
    """Service class for audit logging"""
    
    @staticmethod
    def get_audit_logs(
        model_id: Optional[str] = None,
        user_id: Optional[int] = None,
        operation_type: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        limit: int = 100
    ) -> List[ModelAuditLog]:
        """Get audit logs with filtering"""
        with get_db() as conn:
            conditions = []
            params = []
            
            if model_id:
                conditions.append("model_id = ?")
                params.append(model_id)
            
            if user_id:
                conditions.append("user_id = ?")
                params.append(user_id)
            
            if operation_type:
                conditions.append("operation_type = ?")
                params.append(operation_type)
            
            if start_date:
                conditions.append("timestamp >= ?")
                params.append(start_date.isoformat())
            
            if end_date:
                conditions.append("timestamp <= ?")
                params.append(end_date.isoformat())
            
            where_clause = " AND ".join(conditions) if conditions else "1=1"
            
            logs = conn.execute(f"""
                SELECT * FROM model_audit_log 
                WHERE {where_clause}
                ORDER BY timestamp DESC
                LIMIT ?
            """, params + [limit]).fetchall()
            
            result = []
            for log in logs:
                log_dict = dict(log)
                if log_dict["changes"]:
                    log_dict["changes"] = json.loads(log_dict["changes"])
                result.append(ModelAuditLog(**log_dict))
            
            return result

def init_database():
    """Initialize the database with sample tables"""
    with get_db() as conn:
        # Users table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL,
                organization_id INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Organizations table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS organizations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                industry TEXT DEFAULT 'financial_services',
                jurisdiction TEXT DEFAULT 'US',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Assessments table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS assessments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                organization_id INTEGER NOT NULL,
                assessment_type TEXT NOT NULL,
                industry_profile TEXT DEFAULT 'financial_services',
                jurisdiction TEXT DEFAULT 'US',
                status TEXT DEFAULT 'in_progress',
                compliance_score REAL,
                findings TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                completed_at TIMESTAMP,
                FOREIGN KEY (organization_id) REFERENCES organizations (id)
            )
        """)
        
        # Guardrail rules table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS guardrail_rules (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                rule_type TEXT NOT NULL,
                pattern TEXT NOT NULL,
                action TEXT DEFAULT 'block',
                is_active BOOLEAN DEFAULT 1,
                industry_profile TEXT DEFAULT 'financial_services',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Audit trail table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS audit_trail (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                action TEXT NOT NULL,
                resource_type TEXT NOT NULL,
                resource_id INTEGER,
                details TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        """)
        
        # AI Models table - for LLM assessment capabilities
        conn.execute("""
            CREATE TABLE IF NOT EXISTS ai_models (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                provider TEXT NOT NULL,
                version TEXT NOT NULL,
                description TEXT,
                capabilities TEXT, -- JSON array
                supported_industries TEXT, -- JSON array
                is_active BOOLEAN DEFAULT 1,
                is_recommended BOOLEAN DEFAULT 0,
                status TEXT DEFAULT 'active', -- active, inactive, deprecated
                created_by TEXT,
                updated_by TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Add new columns to existing ai_models table if they don't exist
        try:
            conn.execute("ALTER TABLE ai_models ADD COLUMN status TEXT DEFAULT 'active'")
        except sqlite3.OperationalError:
            pass  # Column already exists
        
        try:
            conn.execute("ALTER TABLE ai_models ADD COLUMN created_by TEXT")
        except sqlite3.OperationalError:
            pass  # Column already exists
            
        try:
            conn.execute("ALTER TABLE ai_models ADD COLUMN updated_by TEXT")
        except sqlite3.OperationalError:
            pass  # Column already exists
        
        # Model configurations table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS model_configurations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                model_id TEXT NOT NULL,
                organization_id INTEGER NOT NULL,
                settings TEXT, -- JSON object
                is_active BOOLEAN DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (model_id) REFERENCES ai_models (id),
                FOREIGN KEY (organization_id) REFERENCES organizations (id),
                UNIQUE(model_id, organization_id)
            )
        """)
        
        # Enhanced test results table for LLM assessment tracking
        conn.execute("""
            CREATE TABLE IF NOT EXISTS test_results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                organization_id INTEGER,
                content_hash TEXT NOT NULL,
                model_id TEXT,
                industry_profile TEXT DEFAULT 'financial_services',
                is_compliant BOOLEAN NOT NULL,
                violations_count INTEGER DEFAULT 0,
                applied_rules TEXT, -- JSON array
                test_duration_ms INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id),
                FOREIGN KEY (organization_id) REFERENCES organizations (id),
                FOREIGN KEY (model_id) REFERENCES ai_models (id)
            )
        """)
        
        # Model audit log table for LLM management operations
        conn.execute("""
            CREATE TABLE IF NOT EXISTS model_audit_log (
                id TEXT PRIMARY KEY,
                operation_type TEXT NOT NULL, -- create, update, delete, bulk_delete
                model_id TEXT,
                model_name TEXT NOT NULL,
                user_id INTEGER NOT NULL,
                user_name TEXT NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                changes TEXT, -- JSON serialized changes
                ip_address TEXT,
                user_agent TEXT,
                FOREIGN KEY (user_id) REFERENCES users (id),
                FOREIGN KEY (model_id) REFERENCES ai_models (id)
            )
        """)
        
        # Model dependencies view for dependency tracking
        conn.execute("""
            CREATE VIEW IF NOT EXISTS model_dependencies AS
            SELECT 
                m.id as model_id,
                m.name as model_name,
                'compliance_check' as dependency_type,
                COUNT(tr.id) as usage_count,
                MAX(tr.created_at) as last_used
            FROM ai_models m
            LEFT JOIN test_results tr ON tr.model_id = m.id
            GROUP BY m.id, m.name
            UNION ALL
            SELECT 
                m.id as model_id,
                m.name as model_name,
                'model_configuration' as dependency_type,
                COUNT(mc.id) as usage_count,
                MAX(mc.updated_at) as last_used
            FROM ai_models m
            LEFT JOIN model_configurations mc ON mc.model_id = m.id
            GROUP BY m.id, m.name
        """)
        
        # Create indexes for performance optimization
        conn.execute("CREATE INDEX IF NOT EXISTS idx_ai_models_active ON ai_models(is_active, provider)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_ai_models_status ON ai_models(status, is_active)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_model_configs_org ON model_configurations(organization_id, model_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_test_results_model ON test_results(model_id, created_at)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_test_results_org ON test_results(organization_id, created_at)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_model_audit_log_model ON model_audit_log(model_id, timestamp)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_model_audit_log_user ON model_audit_log(user_id, timestamp)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_model_audit_log_operation ON model_audit_log(operation_type, timestamp)")
        
        conn.commit()

# Authentication functions
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    return hash_password(password) == hashed

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        
        with get_db() as conn:
            user = conn.execute(
                "SELECT * FROM users WHERE username = ?", (username,)
            ).fetchone()
            if user is None:
                raise HTTPException(status_code=401, detail="User not found")
            return dict(user)
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

# API Endpoints

# API Endpoints

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "AI Compliance Platform API is running", "version": "1.0.0"}

@app.post("/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    """Authenticate user and return JWT token"""
    with get_db() as conn:
        user = conn.execute(
            "SELECT * FROM users WHERE username = ?", (user_data.username,)
        ).fetchone()
        
        if not user or not verify_password(user_data.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        access_token = create_access_token(data={"sub": user["username"]})
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_role": user["role"],
            "organization_id": user["organization_id"]
        }

@app.post("/auth/register", response_model=dict)
async def register(user_data: UserCreate):
    """Register new user"""
    with get_db() as conn:
        # Check if username already exists
        existing_user = conn.execute(
            "SELECT id FROM users WHERE username = ?", (user_data.username,)
        ).fetchone()
        
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already registered")
        
        # Create organization if provided
        org_id = None
        if user_data.organization_name:
            conn.execute(
                "INSERT INTO organizations (name) VALUES (?)",
                (user_data.organization_name,)
            )
            org_id = conn.lastrowid
        
        # Create user
        conn.execute(
            "INSERT INTO users (username, password_hash, role, organization_id) VALUES (?, ?, ?, ?)",
            (user_data.username, hash_password(user_data.password), user_data.role, org_id)
        )
        conn.commit()
        
        return {"message": "User registered successfully"}

@app.get("/organizations", response_model=List[Organization])
async def get_organizations(current_user: dict = Depends(get_current_user)):
    """Get all organizations (for regulatory inspectors) or current organization"""
    with get_db() as conn:
        if current_user["role"] == "regulatory_inspector":
            # Regulatory inspectors can see all organizations
            orgs = conn.execute("SELECT * FROM organizations ORDER BY name").fetchall()
        else:
            # Organization admins can only see their own organization
            orgs = conn.execute(
                "SELECT * FROM organizations WHERE id = ?", 
                (current_user["organization_id"],)
            ).fetchall()
        
        return [dict(org) for org in orgs]

@app.post("/organizations", response_model=Organization)
async def create_organization(org_data: Organization, current_user: dict = Depends(get_current_user)):
    """Create new organization (regulatory inspectors only)"""
    if current_user["role"] != "regulatory_inspector":
        raise HTTPException(status_code=403, detail="Only regulatory inspectors can create organizations")
    
    with get_db() as conn:
        conn.execute(
            "INSERT INTO organizations (name, industry, jurisdiction) VALUES (?, ?, ?)",
            (org_data.name, org_data.industry, org_data.jurisdiction)
        )
        org_id = conn.lastrowid
        conn.commit()
        
        # Log audit trail
        conn.execute(
            "INSERT INTO audit_trail (user_id, action, resource_type, resource_id, details) VALUES (?, ?, ?, ?, ?)",
            (current_user["id"], "CREATE", "organization", org_id, json.dumps({"name": org_data.name}))
        )
        conn.commit()
        
        org_data.id = org_id
        org_data.created_at = datetime.utcnow()
        return org_data

@app.get("/assessments", response_model=List[Assessment])
async def get_assessments(current_user: dict = Depends(get_current_user)):
    """Get assessments based on user role"""
    with get_db() as conn:
        if current_user["role"] == "regulatory_inspector":
            # Regulatory inspectors can see all assessments
            assessments = conn.execute("""
                SELECT a.*, o.name as organization_name 
                FROM assessments a 
                JOIN organizations o ON a.organization_id = o.id 
                ORDER BY a.created_at DESC
            """).fetchall()
        else:
            # Organization admins can only see their own assessments
            assessments = conn.execute(
                "SELECT * FROM assessments WHERE organization_id = ? ORDER BY created_at DESC",
                (current_user["organization_id"],)
            ).fetchall()
        
        result = []
        for assessment in assessments:
            assessment_dict = dict(assessment)
            if assessment_dict["findings"]:
                assessment_dict["findings"] = json.loads(assessment_dict["findings"])
            else:
                assessment_dict["findings"] = []
            result.append(assessment_dict)
        
        return result

@app.post("/assessments", response_model=Assessment)
async def create_assessment(assessment_data: Assessment, current_user: dict = Depends(get_current_user)):
    """Create new assessment"""
    # Ensure organization access
    if current_user["role"] == "organization_admin" and assessment_data.organization_id != current_user["organization_id"]:
        raise HTTPException(status_code=403, detail="Cannot create assessment for other organizations")
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO assessments (organization_id, assessment_type, industry_profile, jurisdiction, status, findings) 
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            assessment_data.organization_id,
            assessment_data.assessment_type,
            assessment_data.industry_profile,
            assessment_data.jurisdiction,
            assessment_data.status,
            json.dumps(assessment_data.findings)
        ))
        assessment_id = cursor.lastrowid
        conn.commit()
        
        # Log audit trail
        cursor.execute(
            "INSERT INTO audit_trail (user_id, action, resource_type, resource_id, details) VALUES (?, ?, ?, ?, ?)",
            (current_user["id"], "CREATE", "assessment", assessment_id, 
             json.dumps({"type": assessment_data.assessment_type, "organization_id": assessment_data.organization_id}))
        )
        conn.commit()
        
        assessment_data.id = assessment_id
        assessment_data.created_at = datetime.utcnow()
        return assessment_data

@app.put("/assessments/{assessment_id}", response_model=Assessment)
async def update_assessment(assessment_id: int, assessment_data: Assessment, current_user: dict = Depends(get_current_user)):
    """Update assessment"""
    with get_db() as conn:
        # Check if assessment exists and user has access
        existing = conn.execute("SELECT * FROM assessments WHERE id = ?", (assessment_id,)).fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Assessment not found")
        
        if current_user["role"] == "organization_admin" and existing["organization_id"] != current_user["organization_id"]:
            raise HTTPException(status_code=403, detail="Cannot update assessment for other organizations")
        
        # Update assessment
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE assessments 
            SET status = ?, compliance_score = ?, findings = ?, completed_at = ?
            WHERE id = ?
        """, (
            assessment_data.status,
            assessment_data.compliance_score,
            json.dumps(assessment_data.findings),
            assessment_data.completed_at,
            assessment_id
        ))
        conn.commit()
        
        # Log audit trail
        cursor.execute(
            "INSERT INTO audit_trail (user_id, action, resource_type, resource_id, details) VALUES (?, ?, ?, ?, ?)",
            (current_user["id"], "UPDATE", "assessment", assessment_id, 
             json.dumps({"status": assessment_data.status, "score": assessment_data.compliance_score}))
        )
        conn.commit()
        
        assessment_data.id = assessment_id
        return assessment_data

@app.get("/guardrails", response_model=List[GuardrailRule])
async def get_guardrail_rules(current_user: dict = Depends(get_current_user)):
    """Get guardrail rules"""
    with get_db() as conn:
        rules = conn.execute("SELECT * FROM guardrail_rules ORDER BY name").fetchall()
        return [dict(rule) for rule in rules]

@app.post("/guardrails", response_model=GuardrailRule)
async def create_guardrail_rule(rule_data: GuardrailRule, current_user: dict = Depends(get_current_user)):
    """Create new guardrail rule"""
    with get_db() as conn:
        conn.execute("""
            INSERT INTO guardrail_rules (name, rule_type, pattern, action, is_active, industry_profile) 
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            rule_data.name,
            rule_data.rule_type,
            rule_data.pattern,
            rule_data.action,
            rule_data.is_active,
            rule_data.industry_profile
        ))
        rule_id = conn.lastrowid
        conn.commit()
        
        # Log audit trail
        conn.execute(
            "INSERT INTO audit_trail (user_id, action, resource_type, resource_id, details) VALUES (?, ?, ?, ?, ?)",
            (current_user["id"], "CREATE", "guardrail_rule", rule_id, json.dumps({"name": rule_data.name}))
        )
        conn.commit()
        
        rule_data.id = rule_id
        rule_data.created_at = datetime.utcnow()
        return rule_data

@app.put("/guardrails/{rule_id}", response_model=GuardrailRule)
async def update_guardrail_rule(rule_id: int, rule_data: GuardrailRule, current_user: dict = Depends(get_current_user)):
    """Update existing guardrail rule"""
    with get_db() as conn:
        # Check if rule exists
        existing_rule = conn.execute("SELECT * FROM guardrail_rules WHERE id = ?", (rule_id,)).fetchone()
        if not existing_rule:
            raise HTTPException(status_code=404, detail="Guardrail rule not found")
        
        # Update the rule
        conn.execute("""
            UPDATE guardrail_rules 
            SET name = ?, rule_type = ?, pattern = ?, action = ?, is_active = ?, industry_profile = ?
            WHERE id = ?
        """, (
            rule_data.name,
            rule_data.rule_type,
            rule_data.pattern,
            rule_data.action,
            rule_data.is_active,
            rule_data.industry_profile,
            rule_id
        ))
        conn.commit()
        
        # Log audit trail
        conn.execute(
            "INSERT INTO audit_trail (user_id, action, resource_type, resource_id, details) VALUES (?, ?, ?, ?, ?)",
            (current_user["id"], "UPDATE", "guardrail_rule", rule_id, json.dumps({"name": rule_data.name}))
        )
        conn.commit()
        
        rule_data.id = rule_id
        return rule_data

@app.get("/models", response_model=List[AIModel])
async def get_available_models(
    industry_profile: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get available AI models for LLM assessment"""
    with get_db() as conn:
        if industry_profile:
            # Filter models by industry profile support
            models = conn.execute("""
                SELECT * FROM ai_models 
                WHERE is_active = 1 
                AND (supported_industries LIKE ? OR supported_industries LIKE ?)
                ORDER BY is_recommended DESC, name
            """, (f'%"{industry_profile}"%', '%"all"%')).fetchall()
        else:
            models = conn.execute("""
                SELECT * FROM ai_models 
                WHERE is_active = 1 
                ORDER BY is_recommended DESC, name
            """).fetchall()
        
        result = []
        for model in models:
            model_dict = dict(model)
            model_dict["capabilities"] = json.loads(model_dict["capabilities"] or "[]")
            model_dict["supported_industries"] = json.loads(model_dict["supported_industries"] or "[]")
            result.append(model_dict)
        
        return result

@app.get("/models/{model_id}", response_model=AIModel)
async def get_model_details(model_id: str, current_user: dict = Depends(get_current_user)):
    """Get specific AI model details"""
    with get_db() as conn:
        model = conn.execute("SELECT * FROM ai_models WHERE id = ?", (model_id,)).fetchone()
        
        if not model:
            raise HTTPException(status_code=404, detail="Model not found")
        
        model_dict = dict(model)
        model_dict["capabilities"] = json.loads(model_dict["capabilities"] or "[]")
        model_dict["supported_industries"] = json.loads(model_dict["supported_industries"] or "[]")
        
        return model_dict

@app.get("/models/{model_id}/configuration", response_model=ModelConfiguration)
async def get_model_configuration(model_id: str, current_user: dict = Depends(get_current_user)):
    """Get model configuration for current organization"""
    with get_db() as conn:
        config = conn.execute("""
            SELECT * FROM model_configurations 
            WHERE model_id = ? AND organization_id = ?
        """, (model_id, current_user["organization_id"])).fetchone()
        
        if not config:
            # Return default configuration
            return ModelConfiguration(
                model_id=model_id,
                organization_id=current_user["organization_id"],
                settings={}
            )
        
        config_dict = dict(config)
        config_dict["settings"] = json.loads(config_dict["settings"] or "{}")
        
        return config_dict

@app.put("/models/{model_id}/configuration", response_model=ModelConfiguration)
async def update_model_configuration(
    model_id: str, 
    config_data: ModelConfiguration, 
    current_user: dict = Depends(get_current_user)
):
    """Update model configuration (admin only)"""
    if current_user["role"] not in ["organization_admin", "regulatory_inspector"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    with get_db() as conn:
        # Check if model exists
        model = conn.execute("SELECT id FROM ai_models WHERE id = ?", (model_id,)).fetchone()
        if not model:
            raise HTTPException(status_code=404, detail="Model not found")
        
        # Validate that model supports the organization's industry
        org = conn.execute("SELECT industry FROM organizations WHERE id = ?", (current_user["organization_id"],)).fetchone()
        if org:
            model_details = conn.execute("SELECT supported_industries FROM ai_models WHERE id = ?", (model_id,)).fetchone()
            if model_details:
                supported_industries = json.loads(model_details["supported_industries"] or "[]")
                if org["industry"] not in supported_industries:
                    raise HTTPException(
                        status_code=400, 
                        detail=f"Model {model_id} does not support industry profile: {org['industry']}"
                    )
        
        try:
            # Upsert configuration
            conn.execute("""
                INSERT OR REPLACE INTO model_configurations 
                (model_id, organization_id, settings, is_active, updated_at)
                VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
            """, (
                model_id,
                current_user["organization_id"],
                json.dumps(config_data.settings),
                config_data.is_active
            ))
            conn.commit()
            
            # Log audit trail
            conn.execute("""
                INSERT INTO audit_trail (user_id, action, resource_type, resource_id, details)
                VALUES (?, ?, ?, ?, ?)
            """, (
                current_user["id"], "UPDATE", "model_configuration", None,
                json.dumps({"model_id": model_id, "settings": config_data.settings})
            ))
            conn.commit()
            
        except Exception as e:
            conn.rollback()
            raise HTTPException(status_code=500, detail=f"Failed to update configuration: {str(e)}")
        
        config_data.organization_id = current_user["organization_id"]
        config_data.updated_at = datetime.utcnow()
        
        return config_data

@app.post("/guardrails/filter", response_model=LLMFilterResponse)
async def filter_llm_content(request: LLMFilterRequest, current_user: dict = Depends(get_current_user)):
    """Filter LLM content through guardrails with model-specific assessment"""
    import re
    import hashlib
    
    with get_db() as conn:
        # Get model information if specified
        model_info = None
        if request.model_id:
            model = conn.execute("SELECT * FROM ai_models WHERE id = ?", (request.model_id,)).fetchone()
            if model:
                model_info = {
                    "id": model["id"],
                    "name": model["name"],
                    "provider": model["provider"],
                    "version": model["version"]
                }
            
            # Get model configuration
            config = conn.execute("""
                SELECT settings FROM model_configurations 
                WHERE model_id = ? AND organization_id = ?
            """, (request.model_id, current_user["organization_id"])).fetchone()
            
            if config:
                model_settings = json.loads(config["settings"] or "{}")
                if model_info:
                    model_info["settings"] = model_settings
        
        # Get active guardrail rules for the industry profile
        rules = conn.execute("""
            SELECT * FROM guardrail_rules 
            WHERE is_active = 1 AND industry_profile = ?
        """, (request.industry_profile,)).fetchall()
        
        filtered_content = request.content
        violations = []
        applied_rules = []
        is_compliant = True
        
        for rule in rules:
            rule_dict = dict(rule)
            pattern = rule_dict["pattern"]
            
            try:
                matches = re.findall(pattern, request.content, re.IGNORECASE)
                if matches:
                    applied_rules.append(rule_dict["name"])
                    
                    if rule_dict["action"] == "block":
                        # Replace matches with [REDACTED]
                        filtered_content = re.sub(pattern, "[REDACTED]", filtered_content, flags=re.IGNORECASE)
                        violations.append(f"Blocked content matching rule: {rule_dict['name']}")
                        is_compliant = False
                    elif rule_dict["action"] == "flag":
                        violations.append(f"Flagged content matching rule: {rule_dict['name']}")
                        # Don't mark as non-compliant for flags, just log
            except re.error:
                # Invalid regex pattern, skip this rule
                continue
        
        # Create content hash for tracking
        content_hash = hashlib.sha256(request.content.encode()).hexdigest()[:16]
        
        # Store test result for LLM assessment tracking
        conn.execute("""
            INSERT INTO test_results (
                user_id, organization_id, content_hash, model_id, industry_profile,
                is_compliant, violations_count, applied_rules
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            current_user["id"],
            current_user["organization_id"],
            content_hash,
            request.model_id,
            request.industry_profile,
            is_compliant,
            len(violations),
            json.dumps(applied_rules)
        ))
        
        # Log guardrail application with model information
        audit_details = {
            "violations": len(violations),
            "applied_rules": applied_rules,
            "is_compliant": is_compliant,
            "model_id": request.model_id,
            "industry_profile": request.industry_profile
        }
        
        conn.execute("""
            INSERT INTO audit_trail (user_id, action, resource_type, resource_id, details) 
            VALUES (?, ?, ?, ?, ?)
        """, (
            current_user["id"], "FILTER", "llm_content", None,
            json.dumps(audit_details)
        ))
        conn.commit()
        
        return LLMFilterResponse(
            filtered_content=filtered_content,
            is_compliant=is_compliant,
            violations=violations,
            applied_rules=applied_rules,
            model_used=request.model_id,
            model_info=model_info
        )

@app.get("/audit-trail")
async def get_audit_trail(current_user: dict = Depends(get_current_user), limit: int = 100):
    """Get audit trail (regulatory inspectors can see all, others see their organization's)"""
    with get_db() as conn:
        if current_user["role"] == "regulatory_inspector":
            # Regulatory inspectors can see all audit trail
            trail = conn.execute("""
                SELECT at.*, u.username 
                FROM audit_trail at 
                LEFT JOIN users u ON at.user_id = u.id 
                ORDER BY at.timestamp DESC 
                LIMIT ?
            """, (limit,)).fetchall()
        else:
            # Organization users see their organization's audit trail
            trail = conn.execute("""
                SELECT at.*, u.username 
                FROM audit_trail at 
                LEFT JOIN users u ON at.user_id = u.id 
                WHERE u.organization_id = ? 
                ORDER BY at.timestamp DESC 
                LIMIT ?
            """, (current_user["organization_id"], limit)).fetchall()
        
        return [dict(entry) for entry in trail]

@app.get("/compliance/dashboard")
async def get_compliance_dashboard(current_user: dict = Depends(get_current_user)):
    """Get compliance dashboard data"""
    with get_db() as conn:
        if current_user["role"] == "regulatory_inspector":
            # Regulatory inspector dashboard - all organizations
            total_orgs = conn.execute("SELECT COUNT(*) as count FROM organizations").fetchone()["count"]
            total_assessments = conn.execute("SELECT COUNT(*) as count FROM assessments").fetchone()["count"]
            completed_assessments = conn.execute(
                "SELECT COUNT(*) as count FROM assessments WHERE status = 'completed'"
            ).fetchone()["count"]
            
            # Recent activity
            recent_assessments = conn.execute("""
                SELECT a.*, o.name as organization_name 
                FROM assessments a 
                JOIN organizations o ON a.organization_id = o.id 
                ORDER BY a.created_at DESC 
                LIMIT 5
            """).fetchall()
            
            return {
                "user_role": "regulatory_inspector",
                "total_organizations": total_orgs,
                "total_assessments": total_assessments,
                "completed_assessments": completed_assessments,
                "compliance_rate": (completed_assessments / total_assessments * 100) if total_assessments > 0 else 0,
                "recent_assessments": [dict(a) for a in recent_assessments]
            }
        else:
            # Organization dashboard
            org_assessments = conn.execute(
                "SELECT COUNT(*) as count FROM assessments WHERE organization_id = ?",
                (current_user["organization_id"],)
            ).fetchone()["count"]
            
            completed_assessments = conn.execute(
                "SELECT COUNT(*) as count FROM assessments WHERE organization_id = ? AND status = 'completed'",
                (current_user["organization_id"],)
            ).fetchone()["count"]
            
            avg_score = conn.execute(
                "SELECT AVG(compliance_score) as avg_score FROM assessments WHERE organization_id = ? AND compliance_score IS NOT NULL",
                (current_user["organization_id"],)
            ).fetchone()["avg_score"] or 0
            
            # Recent guardrail violations
            recent_violations = conn.execute("""
                SELECT COUNT(*) as count FROM audit_trail at
                JOIN users u ON at.user_id = u.id
                WHERE u.organization_id = ? AND at.action = 'FILTER' AND at.details LIKE '%"is_compliant": false%'
                AND at.timestamp > datetime('now', '-7 days')
            """, (current_user["organization_id"],)).fetchone()["count"]
            
            return {
                "user_role": "organization_admin",
                "total_assessments": org_assessments,
                "completed_assessments": completed_assessments,
                "average_compliance_score": round(avg_score, 2),
                "recent_violations": recent_violations,
                "compliance_status": "compliant" if avg_score >= 80 else "needs_attention"
            }

@app.get("/reports/model-usage")
async def get_model_usage_report(
    model_id: Optional[str] = None,
    industry_profile: Optional[str] = None,
    days: int = 30,
    current_user: dict = Depends(get_current_user)
):
    """Get model usage statistics and compliance reports"""
    with get_db() as conn:
        # Base query conditions
        conditions = ["tr.created_at > datetime('now', '-{} days')".format(days)]
        params = []
        
        # Add organization filter for non-inspector users
        if current_user["role"] != "regulatory_inspector":
            conditions.append("tr.organization_id = ?")
            params.append(current_user["organization_id"])
        
        # Add model filter if specified
        if model_id:
            conditions.append("tr.model_id = ?")
            params.append(model_id)
        
        # Add industry filter if specified
        if industry_profile:
            conditions.append("tr.industry_profile = ?")
            params.append(industry_profile)
        
        where_clause = " AND ".join(conditions)
        
        # Get model usage statistics
        usage_stats = conn.execute(f"""
            SELECT 
                tr.model_id,
                am.name as model_name,
                am.provider,
                COUNT(*) as total_tests,
                SUM(CASE WHEN tr.is_compliant = 1 THEN 1 ELSE 0 END) as compliant_tests,
                SUM(CASE WHEN tr.is_compliant = 0 THEN 1 ELSE 0 END) as non_compliant_tests,
                AVG(CASE WHEN tr.is_compliant = 1 THEN 1.0 ELSE 0.0 END) * 100 as compliance_rate,
                SUM(tr.violations_count) as total_violations
            FROM test_results tr
            LEFT JOIN ai_models am ON tr.model_id = am.id
            WHERE {where_clause}
            GROUP BY tr.model_id, am.name, am.provider
            ORDER BY total_tests DESC
        """, params).fetchall()
        
        # Get industry breakdown
        industry_stats = conn.execute(f"""
            SELECT 
                tr.industry_profile,
                COUNT(*) as total_tests,
                SUM(CASE WHEN tr.is_compliant = 1 THEN 1 ELSE 0 END) as compliant_tests,
                AVG(CASE WHEN tr.is_compliant = 1 THEN 1.0 ELSE 0.0 END) * 100 as compliance_rate
            FROM test_results tr
            WHERE {where_clause}
            GROUP BY tr.industry_profile
            ORDER BY total_tests DESC
        """, params).fetchall()
        
        # Get daily trend data
        daily_trends = conn.execute(f"""
            SELECT 
                DATE(tr.created_at) as test_date,
                COUNT(*) as total_tests,
                SUM(CASE WHEN tr.is_compliant = 1 THEN 1 ELSE 0 END) as compliant_tests,
                AVG(CASE WHEN tr.is_compliant = 1 THEN 1.0 ELSE 0.0 END) * 100 as compliance_rate
            FROM test_results tr
            WHERE {where_clause}
            GROUP BY DATE(tr.created_at)
            ORDER BY test_date DESC
            LIMIT 30
        """, params).fetchall()
        
        # Get top violations by model
        violation_patterns = conn.execute(f"""
            SELECT 
                tr.model_id,
                am.name as model_name,
                JSON_EXTRACT(at.details, '$.applied_rules') as applied_rules,
                COUNT(*) as frequency
            FROM test_results tr
            LEFT JOIN ai_models am ON tr.model_id = am.id
            JOIN audit_trail at ON at.details LIKE '%' || tr.content_hash || '%'
            WHERE {where_clause} AND tr.is_compliant = 0
            GROUP BY tr.model_id, am.name, applied_rules
            ORDER BY frequency DESC
            LIMIT 20
        """, params).fetchall()
        
        return {
            "period_days": days,
            "filters": {
                "model_id": model_id,
                "industry_profile": industry_profile
            },
            "model_usage": [dict(row) for row in usage_stats],
            "industry_breakdown": [dict(row) for row in industry_stats],
            "daily_trends": [dict(row) for row in daily_trends],
            "violation_patterns": [dict(row) for row in violation_patterns]
        }

@app.get("/reports/model-comparison")
async def get_model_comparison_report(
    model_ids: str,  # Comma-separated list of model IDs
    industry_profile: Optional[str] = None,
    days: int = 30,
    current_user: dict = Depends(get_current_user)
):
    """Compare performance metrics between different models"""
    model_id_list = [mid.strip() for mid in model_ids.split(',') if mid.strip()]
    
    if len(model_id_list) < 2:
        raise HTTPException(status_code=400, detail="At least 2 models required for comparison")
    
    with get_db() as conn:
        # Base conditions
        conditions = [
            "tr.created_at > datetime('now', '-{} days')".format(days),
            f"tr.model_id IN ({','.join(['?' for _ in model_id_list])})"
        ]
        params = model_id_list.copy()
        
        # Add organization filter for non-inspector users
        if current_user["role"] != "regulatory_inspector":
            conditions.append("tr.organization_id = ?")
            params.append(current_user["organization_id"])
        
        # Add industry filter if specified
        if industry_profile:
            conditions.append("tr.industry_profile = ?")
            params.append(industry_profile)
        
        where_clause = " AND ".join(conditions)
        
        # Get comparison metrics
        comparison_data = conn.execute(f"""
            SELECT 
                tr.model_id,
                am.name as model_name,
                am.provider,
                COUNT(*) as total_tests,
                SUM(CASE WHEN tr.is_compliant = 1 THEN 1 ELSE 0 END) as compliant_tests,
                AVG(CASE WHEN tr.is_compliant = 1 THEN 1.0 ELSE 0.0 END) * 100 as compliance_rate,
                SUM(tr.violations_count) as total_violations,
                AVG(tr.violations_count) as avg_violations_per_test,
                MIN(tr.created_at) as first_test,
                MAX(tr.created_at) as last_test
            FROM test_results tr
            LEFT JOIN ai_models am ON tr.model_id = am.id
            WHERE {where_clause}
            GROUP BY tr.model_id, am.name, am.provider
            ORDER BY compliance_rate DESC
        """, params).fetchall()
        
        return {
            "comparison_period_days": days,
            "models_compared": model_id_list,
            "industry_profile": industry_profile,
            "comparison_metrics": [dict(row) for row in comparison_data]
        }

@app.get("/reports/export")
async def export_compliance_report(
    format: str = "json",  # json, csv
    model_id: Optional[str] = None,
    industry_profile: Optional[str] = None,
    days: int = 30,
    current_user: dict = Depends(get_current_user)
):
    """Export compliance report in specified format"""
    # Get the model usage report data
    report_data = await get_model_usage_report(model_id, industry_profile, days, current_user)
    
    if format.lower() == "csv":
        import csv
        import io
        
        output = io.StringIO()
        
        # Write model usage data
        if report_data["model_usage"]:
            writer = csv.DictWriter(output, fieldnames=report_data["model_usage"][0].keys())
            writer.writeheader()
            writer.writerows(report_data["model_usage"])
        
        csv_content = output.getvalue()
        output.close()
        
        from fastapi.responses import Response
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=compliance_report_{datetime.now().strftime('%Y%m%d')}.csv"}
        )
    
    # Default to JSON format
    return report_data

# LLM Management API Endpoints
@app.post("/api/v1/models", response_model=AIModel)
async def create_ai_model(model_data: AIModelCreate, current_user: dict = Depends(get_current_user)):
    """Create a new AI model (admin only)"""
    if current_user["role"] not in ["organization_admin", "regulatory_inspector"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    return ModelService.create_model(model_data, current_user["id"])

@app.get("/api/v1/models", response_model=List[AIModel])
async def list_ai_models(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    provider: Optional[str] = None,
    industry: Optional[str] = None,
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """List AI models with filtering and pagination (admin only)"""
    if current_user["role"] not in ["organization_admin", "regulatory_inspector"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    return ModelService.get_all_models(skip, limit, search, provider, industry, status)

@app.get("/api/v1/models/{model_id}", response_model=AIModel)
async def get_ai_model(model_id: str, current_user: dict = Depends(get_current_user)):
    """Get specific AI model details (admin only)"""
    if current_user["role"] not in ["organization_admin", "regulatory_inspector"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    return ModelService.get_model_by_id(model_id)

@app.put("/api/v1/models/{model_id}", response_model=AIModel)
async def update_ai_model(
    model_id: str, 
    model_data: AIModelUpdate, 
    current_user: dict = Depends(get_current_user)
):
    """Update AI model (admin only)"""
    if current_user["role"] not in ["organization_admin", "regulatory_inspector"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    return ModelService.update_model(model_id, model_data, current_user["id"])

@app.delete("/api/v1/models/{model_id}")
async def delete_ai_model(model_id: str, current_user: dict = Depends(get_current_user)):
    """Delete AI model (admin only)"""
    if current_user["role"] not in ["organization_admin", "regulatory_inspector"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    return ModelService.delete_model(model_id, current_user["id"])

@app.get("/api/v1/models/{model_id}/dependencies", response_model=List[ModelDependency])
async def get_model_dependencies(model_id: str, current_user: dict = Depends(get_current_user)):
    """Get model dependencies (admin only)"""
    if current_user["role"] not in ["organization_admin", "regulatory_inspector"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    return DependencyService.get_model_dependencies(model_id)

@app.post("/api/v1/models/bulk", response_model=BulkOperationResult)
async def bulk_model_operations(
    operation_request: BulkOperationRequest, 
    current_user: dict = Depends(get_current_user)
):
    """Perform bulk operations on models (admin only)"""
    if current_user["role"] not in ["organization_admin", "regulatory_inspector"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    results = []
    successful = 0
    failed = 0
    
    if operation_request.operation == "delete":
        # Check dependencies for all models first
        dependencies = DependencyService.check_bulk_dependencies(operation_request.model_ids)
        
        for model_id in operation_request.model_ids:
            try:
                model_deps = dependencies.get(model_id, [])
                active_deps = [dep for dep in model_deps if dep.usage_count > 0]
                
                if active_deps:
                    results.append({
                        "model_id": model_id,
                        "success": False,
                        "error": f"Has active dependencies: {len(active_deps)} usages"
                    })
                    failed += 1
                else:
                    ModelService.delete_model(model_id, current_user["id"])
                    results.append({
                        "model_id": model_id,
                        "success": True,
                        "message": "Deleted successfully"
                    })
                    successful += 1
            except Exception as e:
                results.append({
                    "model_id": model_id,
                    "success": False,
                    "error": str(e)
                })
                failed += 1
    
    elif operation_request.operation == "update_status":
        new_status = operation_request.parameters.get("status", "inactive")
        
        for model_id in operation_request.model_ids:
            try:
                update_data = AIModelUpdate(status=new_status)
                ModelService.update_model(model_id, update_data, current_user["id"])
                results.append({
                    "model_id": model_id,
                    "success": True,
                    "message": f"Status updated to {new_status}"
                })
                successful += 1
            except Exception as e:
                results.append({
                    "model_id": model_id,
                    "success": False,
                    "error": str(e)
                })
                failed += 1
    
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported bulk operation: {operation_request.operation}")
    
    summary = f"Processed {len(operation_request.model_ids)} models: {successful} successful, {failed} failed"
    
    return BulkOperationResult(
        operation=operation_request.operation,
        total_models=len(operation_request.model_ids),
        successful=successful,
        failed=failed,
        results=results,
        summary=summary
    )

@app.get("/api/v1/models/audit", response_model=List[ModelAuditLog])
async def get_model_audit_logs(
    model_id: Optional[str] = None,
    operation_type: Optional[str] = None,
    days: int = 30,
    limit: int = 100,
    current_user: dict = Depends(get_current_user)
):
    """Get model audit logs (admin only)"""
    if current_user["role"] not in ["organization_admin", "regulatory_inspector"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    start_date = datetime.utcnow() - timedelta(days=days) if days > 0 else None
    
    return AuditService.get_audit_logs(
        model_id=model_id,
        operation_type=operation_type,
        start_date=start_date,
        limit=limit
    )

@app.post("/api/v1/models/validate")
async def validate_model_data(model_data: AIModelCreate, current_user: dict = Depends(get_current_user)):
    """Validate model data without creating (admin only)"""
    if current_user["role"] not in ["organization_admin", "regulatory_inspector"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Check if model ID already exists
    with get_db() as conn:
        existing_id = conn.execute("SELECT id FROM ai_models WHERE id = ?", (model_data.id,)).fetchone()
        existing_name = conn.execute("SELECT id FROM ai_models WHERE name = ?", (model_data.name,)).fetchone()
    
    validation_result = {
        "valid": True,
        "errors": [],
        "warnings": []
    }
    
    if existing_id:
        validation_result["valid"] = False
        validation_result["errors"].append(f"Model ID '{model_data.id}' already exists")
    
    if existing_name:
        validation_result["valid"] = False
        validation_result["errors"].append(f"Model name '{model_data.name}' already exists")
    
    # Add warnings for recommendations
    if len(model_data.capabilities) > 8:
        validation_result["warnings"].append("Consider limiting capabilities to most relevant ones")
    
    if len(model_data.supported_industries) == 1:
        validation_result["warnings"].append("Consider supporting multiple industries for broader applicability")
    
    return validation_result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)