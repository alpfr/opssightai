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
DATABASE_URL = "ai_compliance.db"

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
    lifespan=lifespan
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

# Database helper functions
@contextmanager
def get_db():
    conn = sqlite3.connect(DATABASE_URL)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

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
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
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
        
        # Create indexes for performance optimization
        conn.execute("CREATE INDEX IF NOT EXISTS idx_ai_models_active ON ai_models(is_active, provider)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_model_configs_org ON model_configurations(organization_id, model_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_test_results_model ON test_results(model_id, created_at)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_test_results_org ON test_results(organization_id, created_at)")
        
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)