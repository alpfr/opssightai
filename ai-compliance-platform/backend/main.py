"""
AI Compliance Platform - Main FastAPI Application
Sample backend API for the MVP prototype
"""

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
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
    allow_origins=["http://localhost:3000", "http://localhost:8080"],  # Frontend URLs
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

class LLMFilterResponse(BaseModel):
    filtered_content: str
    is_compliant: bool
    violations: List[str] = []
    applied_rules: List[str] = []

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
        conn.execute("""
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
        assessment_id = conn.lastrowid
        conn.commit()
        
        # Log audit trail
        conn.execute(
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
        conn.execute("""
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
        conn.execute(
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

@app.post("/guardrails/filter", response_model=LLMFilterResponse)
async def filter_llm_content(request: LLMFilterRequest, current_user: dict = Depends(get_current_user)):
    """Filter LLM content through guardrails"""
    import re
    
    with get_db() as conn:
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
        
        # Log guardrail application
        conn.execute("""
            INSERT INTO audit_trail (user_id, action, resource_type, resource_id, details) 
            VALUES (?, ?, ?, ?, ?)
        """, (
            current_user["id"], "FILTER", "llm_content", None,
            json.dumps({
                "violations": len(violations),
                "applied_rules": applied_rules,
                "is_compliant": is_compliant
            })
        ))
        conn.commit()
        
        return LLMFilterResponse(
            filtered_content=filtered_content,
            is_compliant=is_compliant,
            violations=violations,
            applied_rules=applied_rules
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)