# JHB StreamPulse - Architecture Design Documentation

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Architecture Diagrams](#architecture-diagrams)
4. [Component Details](#component-details)
5. [Data Flow](#data-flow)
6. [Security Architecture](#security-architecture)
7. [Scalability & High Availability](#scalability--high-availability)
8. [Deployment Architecture](#deployment-architecture)
9. [Technology Stack](#technology-stack)
10. [Infrastructure as Code](#infrastructure-as-code)

---

## Executive Summary

JHB StreamPulse is a cloud-native streaming analytics dashboard deployed on AWS EKS with enterprise-grade authentication, SSL/TLS encryption, and AI-powered insights. The solution provides real-time analytics for streaming services across multiple platforms with secure user access control.

### Key Features
- **Authentication**: AWS Cognito with OAuth 2.0
- **SSL/TLS**: AWS Certificate Manager
- **Container Orchestration**: Amazon EKS (Kubernetes)
- **Load Balancing**: Application Load Balancer
- **AI Integration**: Claude AI (Anthropic)
- **Database**: SQLite with persistent storage
- **Auto-scaling**: Horizontal Pod Autoscaler (2-5 replicas)

---

## System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Internet Users                              │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ HTTPS (443)
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                      Route 53 DNS                                    │
│              jhbstreampulse.opssightai.com                          │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│              Application Load Balancer (ALB)                         │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  SSL/TLS Termination (ACM Certificate)                       │  │
│  │  Authentication (AWS Cognito Integration)                    │  │
│  │  HTTP → HTTPS Redirect                                       │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ OAuth 2.0 Flow
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                    AWS Cognito User Pool                             │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  User Authentication & Authorization                         │  │
│  │  User Groups: Admins, Viewers                               │  │
│  │  Password Policies & MFA Support                            │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ Authenticated Requests
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                    Amazon EKS Cluster                                │
│                  (jhb-streampulse-cluster)                          │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │              Kubernetes Ingress Controller                  │   │
│  │           (AWS Load Balancer Controller)                    │   │
│  └────────────────────────┬───────────────────────────────────┘   │
│                           │                                         │
│  ┌────────────────────────▼───────────────────────────────────┐   │
│  │              Kubernetes Service (NodePort)                  │   │
│  └────────────────────────┬───────────────────────────────────┘   │
│                           │                                         │
│  ┌────────────────────────▼───────────────────────────────────┐   │
│  │         JHB StreamPulse Pods (2-5 replicas)                │   │
│  │  ┌──────────────────────────────────────────────────────┐  │   │
│  │  │  Frontend: React 18 + Vite                           │  │   │
│  │  │  Backend: Node.js 20 + Express                       │  │   │
│  │  │  Database: SQLite (sql.js)                           │  │   │
│  │  │  AI: Claude Integration (Anthropic API)              │  │   │
│  │  └──────────────────────────────────────────────────────┘  │   │
│  │                           │                                  │   │
│  │                           │ Persistent Volume Mount          │   │
│  │                           ▼                                  │   │
│  │  ┌──────────────────────────────────────────────────────┐  │   │
│  │  │  Persistent Volume (EBS gp3 - 5Gi)                   │  │   │
│  │  │  /app/data/streampulse.db                            │  │   │
│  │  └──────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │         Horizontal Pod Autoscaler (HPA)                      │   │
│  │  Min: 2 replicas | Max: 5 replicas                          │   │
│  │  Metrics: CPU > 70%, Memory > 80%                            │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
                             │
                             │ External API Calls
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                    Anthropic API (Claude)                            │
│                  AI Insights Generation                              │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Architecture Diagrams

### 1. Authentication Flow Diagram

```
┌──────────┐                                    ┌──────────────────┐
│          │  1. Access Application             │                  │
│  User    ├───────────────────────────────────►│  Application     │
│  Browser │                                    │  Load Balancer   │
│          │◄───────────────────────────────────┤  (ALB)           │
└──────────┘  2. Redirect to Cognito Login     └────────┬─────────┘
     │                                                   │
     │                                                   │
     │        3. Login Request                           │
     │        ┌──────────────────────────────────────────┘
     │        │
     │        ▼
     │   ┌────────────────────┐
     │   │  AWS Cognito       │
     │   │  User Pool         │
     │   │                    │
     │   │  - Validate        │
     │   │    Credentials     │
     │   │  - Generate        │
     │   │    Auth Code       │
     │   └────────┬───────────┘
     │            │
     │            │ 4. Auth Code
     ▼            ▼
┌──────────────────────────────┐
│  5. Exchange Code for Token  │
│     (OAuth 2.0 Flow)         │
└──────────┬───────────────────┘
           │
           │ 6. Access Token
           ▼
┌──────────────────────────────┐
│  7. Access Application        │
│     with Valid Token          │
│                               │
│  ┌─────────────────────────┐ │
│  │  JHB StreamPulse        │ │
│  │  Dashboard              │ │
│  └─────────────────────────┘ │
└───────────────────────────────┘
```


### 2. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        User Actions                                  │
└────────┬────────────────────────────────────────────────────────┬───┘
         │                                                        │
         │ Upload CSV                                    View Dashboard
         │                                                        │
         ▼                                                        ▼
┌─────────────────────┐                              ┌──────────────────┐
│  CSV Upload         │                              │  Dashboard       │
│  Endpoint           │                              │  View            │
│  /api/upload        │                              │  /               │
└────────┬────────────┘                              └────────┬─────────┘
         │                                                     │
         │ Parse & Validate                                   │ Fetch Data
         │                                                     │
         ▼                                                     ▼
┌─────────────────────┐                              ┌──────────────────┐
│  CSV Parser         │                              │  API Endpoints   │
│  (csv-parser.js)    │                              │  /api/data       │
│                     │                              │  /api/stats      │
└────────┬────────────┘                              └────────┬─────────┘
         │                                                     │
         │ Store Data                                         │ Query Data
         │                                                     │
         ▼                                                     ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    SQLite Database                                    │
│                  (streampulse.db)                                    │
│                                                                       │
│  Tables:                                                              │
│  - weekly_data                                                        │
│  - special_events                                                     │
│  - special_event_data                                                 │
│  - upload_history                                                     │
│  - ai_insights                                                        │
└────────┬─────────────────────────────────────────────────────────────┘
         │
         │ Trigger AI Analysis
         │
         ▼
┌─────────────────────┐
│  AI Insights        │
│  Generator          │
│  /api/insights/     │
│  generate           │
└────────┬────────────┘
         │
         │ API Call
         │
         ▼
┌─────────────────────┐
│  Anthropic API      │
│  (Claude)           │
│                     │
│  - Analyze Data     │
│  - Generate         │
│    Insights         │
│  - Return Summary   │
└────────┬────────────┘
         │
         │ Store Insights
         │
         ▼
┌─────────────────────┐
│  ai_insights        │
│  Table              │
└─────────────────────┘
```

### 3. Network Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          AWS Cloud (us-east-1)                       │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    VPC (EKS Cluster VPC)                     │   │
│  │                                                               │   │
│  │  ┌─────────────────────┐      ┌─────────────────────┐      │   │
│  │  │  Availability Zone  │      │  Availability Zone  │      │   │
│  │  │  us-east-1a         │      │  us-east-1d         │      │   │
│  │  │                     │      │                     │      │   │
│  │  │  ┌───────────────┐ │      │  ┌───────────────┐ │      │   │
│  │  │  │ Public Subnet │ │      │  │ Public Subnet │ │      │   │
│  │  │  │               │ │      │  │               │ │      │   │
│  │  │  │  ┌─────────┐  │ │      │  │  ┌─────────┐  │ │      │   │
│  │  │  │  │   ALB   │  │ │      │  │  │   ALB   │  │ │      │   │
│  │  │  │  │ Target  │  │ │      │  │  │ Target  │  │ │      │   │
│  │  │  │  └─────────┘  │ │      │  │  └─────────┘  │ │      │   │
│  │  │  └───────┬───────┘ │      │  └───────┬───────┘ │      │   │
│  │  │          │         │      │          │         │      │   │
│  │  │  ┌───────▼───────┐ │      │  ┌───────▼───────┐ │      │   │
│  │  │  │ Private       │ │      │  │ Private       │ │      │   │
│  │  │  │ Subnet        │ │      │  │ Subnet        │ │      │   │
│  │  │  │               │ │      │  │               │ │      │   │
│  │  │  │ ┌───────────┐ │ │      │  │ ┌───────────┐ │ │      │   │
│  │  │  │ │ EKS Node  │ │ │      │  │ │ EKS Node  │ │ │      │   │
│  │  │  │ │ (t3.medium│ │ │      │  │ │ (t3.medium│ │ │      │   │
│  │  │  │ │           │ │ │      │  │ │           │ │ │      │   │
│  │  │  │ │ ┌───────┐ │ │ │      │  │ │ ┌───────┐ │ │ │      │   │
│  │  │  │ │ │ Pods  │ │ │ │      │  │ │ │ Pods  │ │ │ │      │   │
│  │  │  │ │ └───────┘ │ │ │      │  │ │ └───────┘ │ │ │      │   │
│  │  │  │ └───────────┘ │ │      │  │ └───────────┘ │ │      │   │
│  │  │  │               │ │      │  │               │ │      │   │
│  │  │  │ ┌───────────┐ │ │      │  │ ┌───────────┐ │ │      │   │
│  │  │  │ │ EBS Volume│ │ │      │  │ │ EBS Volume│ │ │      │   │
│  │  │  │ │ (gp3 5Gi) │ │ │      │  │ │ (gp3 5Gi) │ │ │      │   │
│  │  │  │ └───────────┘ │ │      │  │ └───────────┘ │ │      │   │
│  │  │  └───────────────┘ │      │  └───────────────┘ │      │   │
│  │  └─────────────────────┘      └─────────────────────┘      │   │
│  │                                                               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              AWS Services (Regional)                         │   │
│  │                                                               │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │   │
│  │  │   Cognito    │  │     ACM      │  │   Route 53   │     │   │
│  │  │  User Pool   │  │ Certificate  │  │     DNS      │     │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘     │   │
│  │                                                               │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │   │
│  │  │     ECR      │  │  CloudWatch  │  │   Secrets    │     │   │
│  │  │   Registry   │  │     Logs     │  │   Manager    │     │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘     │   │
│  └─────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────────────┘
                             │
                             │ External API
                             ▼
                    ┌──────────────────┐
                    │  Anthropic API   │
                    │  (Claude AI)     │
                    └──────────────────┘
```


---

## Component Details

### 1. Frontend Layer

**Technology**: React 18 + Vite

**Components**:
- Dashboard UI with real-time data visualization
- CSV upload interface
- AI insights panel
- Admin authentication interface
- Data export functionality

**Features**:
- Responsive design
- Real-time data updates
- Interactive charts and graphs
- Session management
- Error handling

### 2. Backend Layer

**Technology**: Node.js 20 + Express

**API Endpoints**:
```
GET  /api/data              - Retrieve all streaming data
GET  /api/data/:service     - Get data for specific service
GET  /api/special-events    - Get special events
GET  /api/stats             - Get summary statistics
GET  /api/uploads           - Get upload history
GET  /api/export            - Export data as CSV
GET  /api/insights          - Get latest AI insight
GET  /api/insights/status   - Check AI configuration
GET  /api/insights/history  - Get past insights
POST /api/auth              - Verify admin PIN
POST /api/upload            - Upload CSV file
POST /api/data              - Manual data entry
POST /api/insights/generate - Generate new AI insight
DELETE /api/data/:service   - Delete service data
```

**Features**:
- RESTful API design
- Request validation
- Error handling
- Logging
- CORS configuration

### 3. Database Layer

**Technology**: SQLite (sql.js)

**Schema**:
```sql
-- Weekly streaming data
CREATE TABLE weekly_data (
    id INTEGER PRIMARY KEY,
    service TEXT,
    platform TEXT,
    week_start DATE,
    week_end DATE,
    viewers INTEGER,
    created_at TIMESTAMP
);

-- Special events
CREATE TABLE special_events (
    id INTEGER PRIMARY KEY,
    name TEXT,
    start_date DATE,
    end_date DATE,
    description TEXT
);

-- Special event daily data
CREATE TABLE special_event_data (
    id INTEGER PRIMARY KEY,
    event_id INTEGER,
    service TEXT,
    platform TEXT,
    date DATE,
    viewers INTEGER,
    FOREIGN KEY (event_id) REFERENCES special_events(id)
);

-- Upload history
CREATE TABLE upload_history (
    id INTEGER PRIMARY KEY,
    filename TEXT,
    upload_date TIMESTAMP,
    rows_imported INTEGER,
    mode TEXT
);

-- AI insights
CREATE TABLE ai_insights (
    id INTEGER PRIMARY KEY,
    generated_at TIMESTAMP,
    summary TEXT,
    highlights TEXT,
    platform_analysis TEXT,
    alerts TEXT,
    recommendation TEXT
);
```

**Storage**:
- Persistent Volume: EBS gp3 (5Gi)
- Mount Path: `/app/data`
- File: `streampulse.db`

### 4. Authentication Layer

**Technology**: AWS Cognito

**Configuration**:
- User Pool ID: `us-east-1_fZ6Vfj5k1`
- OAuth 2.0 Flow: Authorization Code Grant
- Scopes: email, openid, profile
- Session Timeout: 3600 seconds (1 hour)

**User Groups**:
1. **Admins**: Full access (upload, delete, generate insights)
2. **Viewers**: Read-only access

**Password Policy**:
- Minimum 8 characters
- Requires uppercase letters
- Requires lowercase letters
- Requires numbers
- Requires special characters

### 5. Load Balancer Layer

**Technology**: Application Load Balancer (ALB)

**Configuration**:
- Scheme: Internet-facing
- Listeners: HTTP (80), HTTPS (443)
- SSL Policy: Default
- Target Type: IP
- Health Check: `/api/stats`

**Features**:
- SSL/TLS termination
- HTTP to HTTPS redirect
- Cognito authentication integration
- Session affinity
- Cross-zone load balancing

### 6. Container Orchestration

**Technology**: Amazon EKS (Kubernetes 1.31)

**Resources**:
```yaml
Namespace: jhb-streampulse
Deployment: jhb-streampulse (2 replicas)
Service: jhb-streampulse-nodeport (NodePort)
Ingress: jhb-streampulse-alb (ALB)
PVC: jhb-streampulse-data (5Gi gp3)
HPA: 2-5 replicas (CPU/Memory based)
PDB: Min 1 pod available
ConfigMap: Environment variables
Secret: Anthropic API key
```

**Pod Specifications**:
```yaml
Resources:
  Requests:
    memory: 64Mi
    cpu: 50m
  Limits:
    memory: 256Mi
    cpu: 200m

Probes:
  Liveness:
    path: /api/stats
    initialDelaySeconds: 30
    periodSeconds: 10
  Readiness:
    path: /api/stats
    initialDelaySeconds: 10
    periodSeconds: 5
```

### 7. AI Integration Layer

**Technology**: Anthropic Claude API

**Features**:
- Automated insight generation
- Post-upload analysis
- Natural language summaries
- Trend identification
- Alert generation
- Recommendations

**API Configuration**:
- Model: Claude Sonnet
- Cost: ~$0.01-$0.02 per analysis
- Stored in: Kubernetes Secret


---

## Data Flow

### 1. User Authentication Flow

```
1. User accesses https://jhbstreampulse.opssightai.com
2. ALB checks for authentication cookie
3. If not authenticated:
   a. ALB redirects to Cognito hosted UI
   b. User enters email/password
   c. Cognito validates credentials
   d. Cognito generates authorization code
   e. ALB exchanges code for access token
   f. ALB sets authentication cookie
   g. User redirected to application
4. If authenticated:
   a. ALB validates token with Cognito
   b. Request forwarded to application
```

### 2. CSV Upload Flow

```
1. Admin user uploads CSV file
2. Backend receives file at /api/upload
3. CSV parser validates format
4. Data extracted and transformed
5. Database transaction begins
6. Data inserted/updated in weekly_data table
7. Upload recorded in upload_history
8. Transaction committed
9. AI insight generation triggered (async)
10. Response sent to user
11. AI analyzes data via Anthropic API
12. Insights stored in ai_insights table
13. User notified of new insights
```

### 3. Dashboard View Flow

```
1. User navigates to dashboard
2. Frontend requests data from /api/data
3. Backend queries SQLite database
4. Data aggregated and formatted
5. Response sent to frontend
6. Frontend renders charts and graphs
7. AI insights fetched from /api/insights
8. Insights displayed in panel
```

### 4. AI Insight Generation Flow

```
1. Trigger: CSV upload or manual request
2. Backend fetches recent data from database
3. Data formatted for AI analysis
4. API call to Anthropic Claude
5. Claude analyzes streaming patterns
6. Generates:
   - Executive summary
   - Key highlights
   - Platform analysis
   - Alerts
   - Recommendations
7. Response parsed and stored
8. Insights available via API
```

---

## Security Architecture

### 1. Network Security

**Layers**:
```
Internet → Route 53 → ALB (HTTPS) → EKS Private Subnets → Pods
```

**Security Groups**:
- ALB: Allow 80, 443 from 0.0.0.0/0
- EKS Nodes: Allow traffic from ALB security group
- Pods: Network policies restrict pod-to-pod communication

### 2. Authentication & Authorization

**Multi-Layer Security**:
1. **ALB Layer**: Cognito authentication
2. **Application Layer**: Session validation
3. **API Layer**: Token verification
4. **Database Layer**: Access control

**OAuth 2.0 Flow**:
```
Authorization Code Grant with PKCE
- Prevents authorization code interception
- Secure token exchange
- Short-lived access tokens
- Refresh token rotation
```

### 3. Data Security

**Encryption**:
- **In Transit**: TLS 1.2+ (ALB to users)
- **At Rest**: EBS encryption (database)
- **Secrets**: Kubernetes Secrets (base64 encoded)

**Recommendations**:
- Enable EBS encryption
- Use AWS Secrets Manager for API keys
- Implement database encryption at rest
- Enable CloudTrail for audit logging

### 4. Access Control

**User Groups**:
```
Admins:
  - Full CRUD operations
  - CSV upload/export
  - AI insight generation
  - User management

Viewers:
  - Read-only access
  - View dashboards
  - View insights
  - No data modification
```

### 5. Security Best Practices

**Implemented**:
- ✅ HTTPS only (HTTP redirects to HTTPS)
- ✅ Strong password policies
- ✅ Session timeout (1 hour)
- ✅ Non-root container user
- ✅ Read-only root filesystem (where possible)
- ✅ Dropped all capabilities
- ✅ Pod security context

**Recommended**:
- Enable MFA for admin users
- Implement rate limiting
- Add AWS WAF rules
- Enable GuardDuty
- Set up Security Hub
- Implement automated vulnerability scanning

---

## Scalability & High Availability

### 1. Horizontal Scaling

**Horizontal Pod Autoscaler (HPA)**:
```yaml
Min Replicas: 2
Max Replicas: 5
Metrics:
  - CPU Utilization > 70%
  - Memory Utilization > 80%
Scale Up: Add 1 pod every 30 seconds
Scale Down: Remove 1 pod every 5 minutes
```

**Benefits**:
- Automatic scaling based on load
- Cost optimization during low traffic
- Improved performance during peak times

### 2. High Availability

**Multi-AZ Deployment**:
```
Availability Zones: us-east-1a, us-east-1d
ALB: Distributed across both AZs
EKS Nodes: Distributed across both AZs
Pods: Scheduled across multiple nodes
```

**Pod Disruption Budget**:
```yaml
Min Available: 1 pod
Ensures: At least 1 pod always running
Protects: Against voluntary disruptions
```

**Rolling Updates**:
```yaml
Strategy: RollingUpdate
Max Surge: 1 (max 3 pods during update)
Max Unavailable: 0 (zero downtime)
```

### 3. Load Distribution

**ALB Configuration**:
- Cross-zone load balancing enabled
- Session affinity (sticky sessions)
- Health checks every 30 seconds
- Automatic failover to healthy targets

**Kubernetes Service**:
- Type: NodePort
- Session Affinity: ClientIP
- Timeout: 3 hours

### 4. Data Persistence

**Persistent Volume**:
```yaml
Storage Class: gp3
Size: 5Gi
Access Mode: ReadWriteOnce
Reclaim Policy: Retain
```

**Backup Strategy**:
```bash
# Manual backup
kubectl cp <pod>:/app/data/streampulse.db ./backup.db

# Automated backup (recommended)
- CronJob to S3 every 24 hours
- Retention: 30 days
- Versioning enabled
```

### 5. Performance Optimization

**Caching**:
- Browser caching for static assets
- API response caching (future)
- Database query optimization

**Resource Limits**:
- Prevents resource exhaustion
- Ensures fair resource allocation
- Enables efficient bin packing


---

## Deployment Architecture

### 1. Infrastructure Components

**AWS Services Used**:
```
┌─────────────────────────────────────────────────────────────┐
│ Compute & Orchestration                                      │
├─────────────────────────────────────────────────────────────┤
│ - Amazon EKS (Kubernetes 1.31)                              │
│ - EC2 Instances (2x t3.medium)                              │
│ - EBS Volumes (gp3)                                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Networking & Load Balancing                                  │
├─────────────────────────────────────────────────────────────┤
│ - Application Load Balancer (ALB)                           │
│ - VPC with Public/Private Subnets                           │
│ - Internet Gateway                                           │
│ - NAT Gateway                                                │
│ - Route Tables                                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Security & Identity                                          │
├─────────────────────────────────────────────────────────────┤
│ - AWS Cognito User Pool                                     │
│ - AWS Certificate Manager (ACM)                             │
│ - IAM Roles & Policies                                      │
│ - Security Groups                                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ DNS & Content Delivery                                       │
├─────────────────────────────────────────────────────────────┤
│ - Route 53 (DNS)                                            │
│ - CloudFront (optional, future)                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Container Registry & Storage                                 │
├─────────────────────────────────────────────────────────────┤
│ - Amazon ECR (Docker images)                                │
│ - Amazon EBS (persistent storage)                           │
│ - Amazon S3 (backups, optional)                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Monitoring & Logging                                         │
├─────────────────────────────────────────────────────────────┤
│ - CloudWatch Logs                                            │
│ - CloudWatch Metrics                                         │
│ - CloudWatch Alarms (recommended)                           │
└─────────────────────────────────────────────────────────────┘
```

### 2. Deployment Environments

**Production Environment**:
```
URL: https://jhbstreampulse.opssightai.com
Region: us-east-1
Cluster: jhb-streampulse-cluster
Namespace: jhb-streampulse
Replicas: 2-5 (auto-scaling)
Authentication: Enabled (Cognito)
SSL/TLS: Enabled (ACM)
```

**Legacy Environment** (Public, No Auth):
```
URL: http://k8s-jhbstrea-jhbstrea-e1e5ea8a68-c77c5936cff58e7c.elb.us-east-1.amazonaws.com
Load Balancer: Network Load Balancer (NLB)
Authentication: Disabled
SSL/TLS: Disabled
Status: Active (can be decommissioned)
```

### 3. CI/CD Pipeline (Recommended)

```
┌──────────────┐
│   GitHub     │
│  Repository  │
└──────┬───────┘
       │
       │ Push/PR
       ▼
┌──────────────┐
│   GitHub     │
│   Actions    │
│              │
│ - Lint       │
│ - Test       │
│ - Build      │
└──────┬───────┘
       │
       │ Build Image
       ▼
┌──────────────┐
│   Amazon     │
│     ECR      │
│              │
│ - Store      │
│   Image      │
└──────┬───────┘
       │
       │ Deploy
       ▼
┌──────────────┐
│   Amazon     │
│     EKS      │
│              │
│ - Rolling    │
│   Update     │
└──────────────┘
```

### 4. Disaster Recovery

**Backup Strategy**:
```
Database Backups:
  - Frequency: Daily
  - Retention: 30 days
  - Location: S3 bucket
  - Encryption: AES-256

Configuration Backups:
  - Kubernetes manifests in Git
  - Infrastructure as Code (CloudFormation)
  - Secrets documented (not stored in Git)
```

**Recovery Procedures**:
```
1. Database Recovery:
   - Restore from S3 backup
   - Copy to pod volume
   - Restart pods

2. Infrastructure Recovery:
   - Deploy CloudFormation stacks
   - Apply Kubernetes manifests
   - Restore secrets
   - Update DNS

3. RTO/RPO:
   - RTO: 1 hour
   - RPO: 24 hours (daily backups)
```

---

## Technology Stack

### Frontend
```
Framework: React 18
Build Tool: Vite
Language: JavaScript
Styling: CSS
Charts: Custom/D3.js (if applicable)
```

### Backend
```
Runtime: Node.js 20
Framework: Express
Language: JavaScript
Database Driver: sql.js (SQLite)
AI SDK: Anthropic SDK
```

### Database
```
Type: SQLite
Driver: sql.js (in-memory with persistence)
Storage: EBS gp3 volume
Size: 5Gi
```

### Infrastructure
```
Cloud Provider: AWS
Container Orchestration: Kubernetes (EKS)
Container Runtime: containerd
Image Registry: Amazon ECR
Load Balancer: Application Load Balancer
DNS: Route 53
SSL/TLS: AWS Certificate Manager
Authentication: AWS Cognito
```

### DevOps Tools
```
Version Control: Git (GitHub)
CI/CD: GitHub Actions (recommended)
IaC: CloudFormation, Kubernetes YAML
Monitoring: CloudWatch
Logging: CloudWatch Logs
```

---

## Infrastructure as Code

### 1. CloudFormation Templates

**Cognito User Pool** (`eks/cognito-setup.yaml`):
```yaml
Resources:
  - UserPool
  - UserPoolDomain
  - UserPoolClient
  - AdminGroup
  - ViewerGroup
```

### 2. Kubernetes Manifests

**Core Resources** (`eks/`):
```yaml
- namespace.yaml          # Namespace definition
- service-account.yaml    # Service account with IRSA
- configmap.yaml          # Environment variables
- secret.yaml.example     # Secret template
- pvc.yaml                # Persistent volume claim
- deployment.yaml         # Application deployment
- service.yaml            # NodePort service
- alb-with-auth.yaml      # ALB Ingress with Cognito
- hpa.yaml                # Horizontal Pod Autoscaler
- pdb.yaml                # Pod Disruption Budget
```

### 3. Deployment Scripts

**Automated Setup** (`setup-cognito-auth.sh`):
```bash
1. Create Cognito User Pool
2. Create admin user
3. Request SSL certificate
4. Wait for DNS validation
5. Update Cognito callback URLs
6. Deploy ALB Ingress
7. Add DNS records
8. Display access information
```

**Cluster Creation** (`create-eks-cluster.sh`):
```bash
1. Create EKS cluster
2. Create node group
3. Install add-ons
4. Configure kubectl
5. Install AWS Load Balancer Controller
6. Install Cluster Autoscaler
```

### 4. Configuration Management

**Environment Variables** (ConfigMap):
```yaml
NODE_ENV: production
PORT: 8000
ADMIN_PIN: 1234
```

**Secrets** (Kubernetes Secret):
```yaml
ANTHROPIC_API_KEY: <encrypted>
```

**Resource Quotas** (Deployment):
```yaml
requests:
  memory: 64Mi
  cpu: 50m
limits:
  memory: 256Mi
  cpu: 200m
```

