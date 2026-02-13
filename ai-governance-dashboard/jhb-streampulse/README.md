# JHB StreamPulse Dashboard v2.0

Streaming analytics dashboard for Jesus House Baltimore with SQLite backend, CSV upload/export, and admin authentication.

**🚀 Now Deployed on Google Kubernetes Engine!**

- **Production URL**: http://35.186.198.61
- **Status**: ✅ Running with 2 pods, auto-scaling enabled

## Quick Start (Mac)

```bash
# Double-click start.command, or:
chmod +x start.command
./start.command
```

Opens at **http://localhost:3000**

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
| POST | `/api/auth` | Verify admin PIN |
| POST | `/api/upload` | Upload CSV (requires admin) |
| POST | `/api/data` | Manual entry (requires admin) |
| DELETE | `/api/data/:service` | Delete service data (requires admin) |

## Production Deployment (GKE)

**Currently Deployed**: ✅ Running on Google Kubernetes Engine

### Quick Deploy
```bash
# Deploy to GKE
./deploy-to-gke.sh
```

### Access Production
- **URL**: http://35.186.198.61
- **API**: http://35.186.198.61/api/stats
- **Export**: http://35.186.198.61/api/export

### Deployment Details
- **Platform**: Google Kubernetes Engine
- **Cluster**: sermon-slicer-cluster (us-central1)
- **Replicas**: 2-5 (auto-scaling)
- **Storage**: 5Gi persistent volume
- **SSL**: Google-managed certificate (provisioning)

### Management Commands
```bash
# Check status
kubectl get pods -n jhb-streampulse

# View logs
kubectl logs -f deployment/jhb-streampulse -n jhb-streampulse

# Check ingress
kubectl get ingress -n jhb-streampulse

# Port forward for testing
kubectl port-forward -n jhb-streampulse service/jhb-streampulse 8080:80
```

**📘 Complete Guide**: See [GKE_DEPLOYMENT_GUIDE.md](GKE_DEPLOYMENT_GUIDE.md)  
**🎉 Deployment Summary**: See [DEPLOYMENT_SUCCESS.md](DEPLOYMENT_SUCCESS.md)

---

## Docker Deployment (Local)

```bash
# Build and run locally
docker compose up -d

# With custom admin PIN
ADMIN_PIN=5678 docker compose up -d
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `ADMIN_PIN` | `1234` | Admin authentication PIN |

## Project Structure

```
├── server.js          # Express API server
├── db.js              # SQLite database (sql.js)
├── csv-parser.js      # JHB CSV format parser
├── seed.js            # Database seeder
├── src/
│   ├── Dashboard.jsx  # React dashboard
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

## Services Tracked

| Service | Platforms |
|---------|-----------|
| Insights with PT | YouTube, Facebook, X, Instagram, PT's YouTube |
| JHB Services | YouTube, Facebook, X, Instagram, Telegram, Emerge, BoxCast |
| JHB Charlotte | YouTube, Facebook, X, Instagram, Telegram |
| Bible Study | YouTube, Facebook, X, Instagram, Telegram, Zoom, BoxCast |

---

## 📚 Documentation

- **[GKE Deployment Guide](GKE_DEPLOYMENT_GUIDE.md)** - Complete deployment instructions
- **[Deployment Success](DEPLOYMENT_SUCCESS.md)** - Current deployment status and access info
- **[Kubernetes Manifests](k8s/)** - All K8s configuration files

---

## 🔧 Tech Stack

- **Frontend**: React 18 + Vite 7
- **Backend**: Node.js 20 + Express
- **Database**: SQLite (sql.js)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Deployment**: Docker + Kubernetes (GKE)

---

## 📞 Support

For deployment issues:
- Check logs: `kubectl logs -f deployment/jhb-streampulse -n jhb-streampulse`
- Check status: `kubectl get all -n jhb-streampulse`
- Review: [GKE_DEPLOYMENT_GUIDE.md](GKE_DEPLOYMENT_GUIDE.md)

---

**Version**: 2.0.0  
**Deployed**: February 13, 2026  
**Platform**: Google Kubernetes Engine  
**Status**: ✅ Production Ready
