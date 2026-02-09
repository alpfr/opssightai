# OpsSightAI - Getting Started Guide

## 🚀 Quick Start (5 Minutes)

### 1. Start the Application

```bash
# Make sure Docker is running first!

# Start infrastructure services
docker-compose up -d

# Start backend (Terminal 1)
cd backend
npm install
npm run dev

# Start frontend (Terminal 2)
cd frontend
npm install
npm run dev
```

### 2. Generate Sample Data

```bash
# Option A: Use the shell script (easiest)
./generate-sample-data.sh

# Option B: Use npm script
cd backend
npm run generate-data

# Option C: Generate more data
npm run generate-data:full  # 60 days of data
```

### 3. Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:4001
- **Backend API**: http://localhost:4000
- **API Health**: http://localhost:4000/api/health

### 4. Explore the Features

**Dashboard** (http://localhost:4001)
- View all assets with risk scores
- Color-coded risk indicators (green/yellow/red)
- Quick statistics

**Assets Page** (http://localhost:4001/assets)
- List of all industrial assets
- Search and filter capabilities
- Click any asset for details

**Asset Detail Page**
- Comprehensive asset information
- Recent sensor readings
- Risk score history chart
- Anomaly timeline
- Forecast predictions

**Executive Dashboard** (http://localhost:4001/executive)
- Plant-level overview
- KPIs and metrics
- Top risk assets
- Trending issues
- AI-generated recommendations

**Notifications** (🔔 bell icon)
- Real-time alerts
- Anomaly notifications
- Risk threshold warnings

## 📊 Sample Data Details

The data generator creates:

### Assets (4 types)
1. **Main Transformer T1**
   - Sensors: Temperature, Voltage, Current
   - Normal operating range with occasional spikes

2. **Motor M1**
   - Sensors: Temperature, Vibration, Current
   - Includes degradation patterns over time

3. **Generator G1**
   - Sensors: Temperature, Voltage, Current
   - Realistic power generation patterns

4. **Pump P1**
   - Sensors: Temperature, Pressure, Vibration
   - Cyclic operation patterns

### Data Characteristics
- **Time Range**: 35 days (default) or custom
- **Frequency**: 12 readings/hour (every 5 minutes)
- **Total Readings**: ~120,000 for 35 days with 4 assets
- **Anomalies**: ~5% of readings (realistic occurrence rate)
- **Risk Scores**: Daily calculations for each asset
- **Notifications**: Generated for critical anomalies

### Sensor Patterns
- **Daily Cycles**: Temperature higher during day hours
- **Weekly Trends**: Slight degradation over time
- **Random Noise**: Realistic sensor variance
- **Anomalies**: Occasional spikes and drops
- **Seasonal Effects**: Subtle long-term patterns

## 🎯 Demo Scenarios

### Scenario 1: Normal Operations
- All assets operating within normal parameters
- Risk scores in LOW to MEDIUM range (0-60)
- Occasional minor anomalies

### Scenario 2: Degrading Asset
- Motor M1 shows increasing temperature trend
- Risk score gradually increases over time
- Multiple anomalies detected
- Forecast predicts continued degradation

### Scenario 3: Critical Alert
- Transformer T1 experiences voltage spike
- Critical anomaly detected
- Notification sent to operators
- Risk score jumps to HIGH range (60-80)

### Scenario 4: Predictive Maintenance
- Pump P1 vibration increasing
- Forecast shows risk will exceed threshold
- Recommendation: Schedule maintenance
- Prevents potential failure

## 🔧 Customization

### Generate Custom Data

```bash
# More historical data
./generate-sample-data.sh --days=90

# Fewer assets
./generate-sample-data.sh --assets=2

# Combination
./generate-sample-data.sh --days=60 --assets=3
```

### Modify Asset Parameters

Edit `scripts/generate-sample-data.js`:

```javascript
const assetTemplates = [
  {
    name: 'Your Asset Name',
    type: 'your_type',
    sensors: {
      temperature: { 
        min: 60, 
        max: 100, 
        normal: 75, 
        unit: '°C', 
        variance: 5 
      },
      // Add more sensors
    }
  }
];
```

### Add More Sensor Types

Supported sensor types:
- `temperature` (°C, °F)
- `voltage` (V, kV)
- `current` (A)
- `vibration` (mm/s, g)
- `pressure` (bar, psi)
- `flow` (L/min, m³/h)
- `speed` (RPM)
- `power` (kW, MW)

## 📚 API Examples

### Get All Assets
```bash
curl http://localhost:4000/api/assets
```

### Get Asset Details
```bash
curl http://localhost:4000/api/assets/{asset-id}
```

### Get Sensor Data
```bash
curl "http://localhost:4000/api/data/{asset-id}?limit=100"
```

### Calculate Risk Score
```bash
curl -X POST http://localhost:4000/api/risk/calculate \
  -H "Content-Type: application/json" \
  -d '{"assetId": "asset-id", "assetType": "transformer"}'
```

### Detect Anomalies
```bash
curl -X POST http://localhost:4000/api/anomalies/detect \
  -H "Content-Type: application/json" \
  -d '{"assetId": "asset-id", "assetType": "transformer"}'
```

### Get Forecast
```bash
curl http://localhost:4000/api/forecast/{asset-id}
```

### Get Executive Summary
```bash
curl http://localhost:4000/api/summary/PLANT-001
```

### Get Notifications
```bash
curl "http://localhost:4000/api/notifications/{user-id}?unreadOnly=true"
```

## 🗄️ Database Access

### Connect to Database
```bash
# Using psql
psql -h localhost -p 5433 -U postgres -d opssight

# Using Docker
docker exec -it opssightai-timescaledb psql -U postgres -d opssight
```

### Useful Queries

```sql
-- Count sensor readings
SELECT COUNT(*) FROM sensor_readings;

-- View recent readings
SELECT * FROM sensor_readings 
ORDER BY time DESC 
LIMIT 10;

-- Check anomalies
SELECT severity, COUNT(*) 
FROM anomalies 
GROUP BY severity;

-- View risk scores
SELECT a.name, r.score, r.time
FROM risk_scores r
JOIN assets a ON r.asset_id = a.id
ORDER BY r.time DESC
LIMIT 10;

-- Asset statistics
SELECT 
  a.name,
  COUNT(DISTINCT sr.sensor_type) as sensor_count,
  COUNT(sr.*) as reading_count,
  MAX(sr.time) as last_reading
FROM assets a
LEFT JOIN sensor_readings sr ON a.id = sr.asset_id
GROUP BY a.id, a.name;
```

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check if database is running
docker ps | grep timescaledb

# Restart database
docker-compose restart timescaledb

# Check logs
docker-compose logs timescaledb
```

### No Data in UI
```bash
# Verify data exists
psql -h localhost -p 5433 -U postgres -d opssight \
  -c "SELECT COUNT(*) FROM sensor_readings;"

# Regenerate data
./generate-sample-data.sh
```

### Backend Not Starting
```bash
# Check if port 4000 is available
lsof -i :4000

# Check environment variables
cat backend/.env

# Reinstall dependencies
cd backend
rm -rf node_modules
npm install
```

### Frontend Not Loading
```bash
# Check if port 4001 is available
lsof -i :4001

# Clear cache and rebuild
cd frontend
rm -rf node_modules dist
npm install
npm run dev
```

## 📖 Next Steps

1. **Explore the UI**: Navigate through all pages and features
2. **Test API Endpoints**: Use curl or Postman to test the API
3. **Review Documentation**: Check out the full documentation
4. **Customize Data**: Modify the data generator for your use case
5. **Deploy to Production**: Follow the deployment guide

## 🆘 Need Help?

- **Documentation**: See `README.md` for full documentation
- **Sample Data Guide**: See `SAMPLE_DATA_GUIDE.md` for data options
- **Deployment Guide**: See `DEPLOYMENT.md` for production setup
- **EKS Deployment**: See `AWS_EKS_IMPLEMENTATION_PLAN.md` for AWS deployment
- **Support**: Open an issue or contact support@opssightai.com

---

**Happy Monitoring! 🎯**
