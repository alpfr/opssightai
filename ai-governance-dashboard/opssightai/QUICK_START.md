# OpsSight AI - Quick Start Guide

Get OpsSight AI running in under 5 minutes!

## Prerequisites
- Docker & Docker Compose installed
- Node.js 18+ installed
- 4GB RAM available

## Quick Start

### 1. Clone & Navigate
```bash
git clone <repository-url>
cd opssightai
```

### 2. Start Infrastructure
```bash
docker-compose up -d
```

Wait ~30 seconds for services to initialize.

### 3. Install Dependencies
```bash
# Backend
cd backend && npm install && cd ..

# Frontend
cd frontend && npm install && cd ..
```

### 4. Start Services
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 5. Access Application
- **Frontend**: http://localhost:4001
- **Backend API**: http://localhost:4000
- **API Health**: http://localhost:4000/api/health

## Default Credentials
- **User ID**: `166c97fe-2cd9-4149-bc42-bee305c58037`
- **Plant ID**: `PLANT-001`

## Quick Test
```bash
# Check system health
curl http://localhost:4000/api/health

# View assets
curl http://localhost:4000/api/assets

# Get executive summary
curl http://localhost:4000/api/summary/PLANT-001
```

## What's Included

### Sample Data
- 4 industrial assets (Transformer, Motor, Generator, Pump)
- 35 days of sensor readings
- 30 days of risk score history
- 6 anomalies
- 30-day forecast

### Features Available
✅ Asset Management  
✅ Risk Scoring  
✅ Anomaly Detection  
✅ Forecasting  
✅ Executive Dashboard  
✅ Notifications  
✅ Interactive Charts  

## Next Steps

1. **Explore Dashboard**: Navigate to http://localhost:4001
2. **View Assets**: Click "Assets" in navigation
3. **Check Executive Summary**: Click "Executive" for plant overview
4. **View Notifications**: Click the 🔔 bell icon
5. **Asset Details**: Click any asset to see detailed analytics

## Troubleshooting

### Port Already in Use
```bash
# Change ports in docker-compose.yml
# Backend: Change PORT in backend/.env
# Frontend: Change port in frontend/vite.config.js
```

### Database Connection Failed
```bash
# Restart Docker services
docker-compose restart

# Check logs
docker-compose logs timescaledb
```

### Frontend Won't Load
```bash
# Clear cache and rebuild
cd frontend
rm -rf node_modules dist
npm install
npm run dev
```

## Stop Services
```bash
# Stop backend & frontend (Ctrl+C in terminals)

# Stop Docker services
docker-compose down

# Stop and remove all data
docker-compose down -v
```

## Need Help?
- Full Documentation: `DEPLOYMENT.md`
- API Reference: `README.md`
- Issues: Create a GitHub issue

---

**Ready in 5 minutes!** 🚀
