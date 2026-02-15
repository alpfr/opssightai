# JHB StreamPulse Dashboard v2.1

Streaming analytics dashboard for Jesus House Baltimore with SQLite backend, CSV upload/export, admin authentication, and AI-powered insights via Claude.

## 🚀 Live Deployments

### AWS EKS (Production)
**URL**: http://k8s-jhbstrea-jhbstrea-e1e5ea8a68-c77c5936cff58e7c.elb.us-east-1.amazonaws.com  
**Region**: us-east-1  
**Status**: ✅ LIVE

### Google Cloud GKE
**URL**: http://35.186.198.61  
**Region**: us-central1  
**Status**: ✅ LIVE

See [EKS_DEPLOYMENT_GUIDE.md](EKS_DEPLOYMENT_GUIDE.md) or [GKE_DEPLOYMENT_GUIDE.md](GKE_DEPLOYMENT_GUIDE.md) for deployment instructions.

## Quick Start (Mac)

```bash
# Double-click start.command, or:
chmod +x start.command
./start.command
```

Opens at **http://localhost:8000**

## Manual Setup

```bash
# 1. Install dependencies
npm install

# 2. Seed database (first run)
node seed.js                          # Built-in 2026 data only
node seed.js path/to/your-data.csv    # Import from CSV file

# 3. Build frontend
npx vite build

# 4. Start server
node server.js
```

## AI Insights (Powered by Claude)

StreamPulse can analyze your streaming data with AI and generate natural-language summaries, trend highlights, platform analysis, alerts, and actionable recommendations.

### Setup

1. Get an API key from [console.anthropic.com](https://console.anthropic.com) → **API Keys** → **Create Key**
2. Start the server with the key:

```bash
export ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
node server.js
```

The server banner will show `✨ AI Insights: ON` when configured.

### How It Works

- **Auto-generate after upload** — Every CSV upload automatically triggers an AI analysis in the background
- **Manual generate** — Admins can click the **Generate** button in the AI Insights panel anytime
- **View insights** — Click the **✨ AI Insights** button in the header, or the purple banner on the Overview tab

### What You Get

| Section | Description |
|---------|-------------|
| **Executive Summary** | 2-3 sentence overview of streaming health |
| **Key Highlights** | 4-6 specific insights with trend icons |
| **Platform Analysis** | Which platforms are growing or declining |
| **Alerts** | Warnings and observations with severity levels |
| **Recommendation** | One specific, actionable suggestion for the media team |

### Cost

Each AI Insights generation costs roughly **$0.01–$0.02** (uses Claude Sonnet, ~1,500 tokens per call). Very affordable — even generating daily would cost under $1/month.

### Docker with AI

```bash
ANTHROPIC_API_KEY=sk-ant-api03-your-key docker compose up -d
```

## CSV Upload

1. Log in as admin (default PIN: `1234`)
2. Click the **Upload** button in the header
3. Drag & drop your CSV file or click to browse
4. Choose mode:
   - **Merge/Append** — adds new weeks, updates existing ones
   - **Replace All** — clears database, imports fresh
5. Click Upload

The parser automatically handles the JHB multi-service side-by-side CSV format.

## CSV Export

Click **Export CSV** to download all current data as a flat CSV file.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/data` | All weekly data + special events |
| GET | `/api/data/:service` | Data for one service |
| GET | `/api/special-events` | Special events only |
| GET | `/api/stats` | Summary statistics |
| GET | `/api/uploads` | Upload history |
| GET | `/api/export` | Download data as CSV |
| GET | `/api/insights` | Latest AI insight |
| GET | `/api/insights/status` | AI configuration status |
| GET | `/api/insights/history` | Past insight summaries |
| POST | `/api/auth` | Verify admin PIN |
| POST | `/api/upload` | Upload CSV (requires admin) |
| POST | `/api/data` | Manual entry (requires admin) |
| POST | `/api/insights/generate` | Generate new AI insight (requires admin) |
| DELETE | `/api/data/:service` | Delete service data (requires admin) |

## Docker Deployment

### Local Development
```bash
# Build and run
docker compose up -d

# With custom admin PIN and AI enabled
ADMIN_PIN=5678 ANTHROPIC_API_KEY=sk-ant-api03-your-key docker compose up -d
```

### Cloud Deployment

#### AWS EKS
```bash
# Quick deployment
cd jhb-streampulse
export ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
./deploy-to-eks.sh

# Or create cluster first
./create-eks-cluster.sh
```

See [EKS_DEPLOYMENT_GUIDE.md](EKS_DEPLOYMENT_GUIDE.md) for complete instructions.

#### Google Cloud GKE
```bash
# Deploy to GKE
cd jhb-streampulse
./deploy-to-gke.sh
```

See [GKE_DEPLOYMENT_GUIDE.md](GKE_DEPLOYMENT_GUIDE.md) for complete instructions.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8000` | Server port |
| `ADMIN_PIN` | `1234` | Admin authentication PIN |
| `ANTHROPIC_API_KEY` | *(none)* | Claude API key for AI Insights (optional) |

## Project Structure

```
├── server.js          # Express API server + AI insights engine
├── db.js              # SQLite database (sql.js)
├── csv-parser.js      # JHB CSV format parser
├── seed.js            # Database seeder
├── src/
│   ├── Dashboard.jsx  # React dashboard + AI insights panel
│   └── main.jsx       # Entry point
├── public/            # Built frontend
├── data/
│   └── streampulse.db # SQLite database file
├── start.command      # Mac launcher
├── Dockerfile         # Container build
└── docker-compose.yml # Docker deployment
```

## Database

SQLite file at `data/streampulse.db`. Back up by copying this single file.

### Tables

- **weekly_data** — Weekly viewer counts per service/platform
- **special_events** — Event metadata (14 DOG, Solution Night, etc.)
- **special_event_data** — Daily viewer counts for events
- **upload_history** — CSV upload audit log
- **ai_insights** — AI-generated analysis history

## Services Tracked

| Service | Platforms |
|---------|-----------|
| Insights with PT | YouTube, Facebook, X, Instagram, PT's YouTube |
| JHB Services | YouTube, Facebook, X, Instagram, Telegram, Emerge, BoxCast |
| JHB Charlotte | YouTube, Facebook, X, Instagram, Telegram |
| Bible Study | YouTube, Facebook, X, Instagram, Telegram, Zoom, BoxCast |
