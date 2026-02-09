# OpsSightAI - Sample Data Sources Summary

## 🎯 Quick Answer: How to Get Sample Data

### ✅ Recommended: Use Our Built-in Generator

**Fastest and easiest option** - No external dependencies needed!

```bash
# From opssightai directory
./generate-sample-data.sh

# Or from backend directory
cd backend
npm run generate-data
```

**What you get:**
- 4 realistic industrial assets (Transformer, Motor, Generator, Pump)
- 35 days of sensor data (120,000+ readings)
- Realistic anomalies and patterns
- Risk scores and forecasts
- Sample notifications
- Ready to use immediately!

---

## 📊 All Available Options

### 1. Built-in Generator (Recommended) ⭐
**Effort**: ⚡ Instant  
**Cost**: Free  
**Data Quality**: Excellent for demos

```bash
./generate-sample-data.sh --days=35 --assets=4
```

### 2. Public Datasets
**Effort**: 🔨 Medium  
**Cost**: Free  
**Data Quality**: Real industrial data

**Best Sources:**
- **NASA Turbofan Dataset**: Real engine degradation data
  - URL: https://ti.arc.nasa.gov/c/6/
  - Size: ~100MB
  - Format: Text files

- **Kaggle Predictive Maintenance**: Industrial equipment data
  - URL: https://www.kaggle.com/datasets/shivamb/machine-predictive-maintenance-classification
  - Size: ~50MB
  - Format: CSV

- **UCI Hydraulic Systems**: Sensor data from hydraulic test rigs
  - URL: https://archive.ics.uci.edu/ml/datasets/Condition+monitoring+of+hydraulic+systems
  - Size: ~400MB
  - Format: Text files

### 3. Real SCADA/IoT Data
**Effort**: 🔨🔨🔨 High  
**Cost**: Varies  
**Data Quality**: Production-grade

**Requirements:**
- Access to industrial SCADA system
- OPC UA, Modbus, or MQTT integration
- Data collection scripts
- Proper security clearances

### 4. Synthetic Data Generation
**Effort**: 🔨🔨 Medium  
**Cost**: Free  
**Data Quality**: Customizable

**Tools:**
- Python with NumPy/Pandas
- Faker library
- Custom algorithms

### 5. Online IoT Platforms
**Effort**: 🔨 Medium  
**Cost**: Free tier available  
**Data Quality**: Real sensor data

**Platforms:**
- ThingSpeak (https://thingspeak.com/)
- Adafruit IO (https://io.adafruit.com/)
- OpenSensors (https://opensensors.com/)

---

## 🚀 Quick Start Guide

### Step 1: Start OpsSightAI
```bash
# Start Docker services
docker-compose up -d

# Start backend
cd backend && npm install && npm run dev

# Start frontend (new terminal)
cd frontend && npm install && npm run dev
```

### Step 2: Generate Data
```bash
# Use the generator
./generate-sample-data.sh
```

### Step 3: Access Application
Open http://localhost:4001 in your browser

---

## 📁 File Locations

### Data Generator
- **Script**: `scripts/generate-sample-data.js`
- **Wrapper**: `generate-sample-data.sh`
- **Documentation**: `SAMPLE_DATA_GUIDE.md`

### Database
- **Init Script**: `docker/init-db.sql`
- **Connection**: localhost:5433
- **Database**: opssight
- **User**: postgres

### Configuration
- **Backend**: `backend/.env`
- **Frontend**: `frontend/.env`
- **Docker**: `docker-compose.yml`

---

## 💡 Tips for Demos

### For Quick Demos (5 minutes)
```bash
./generate-sample-data.sh --days=7 --assets=2
```
- Minimal data, fast generation
- Perfect for quick presentations

### For Realistic Demos (30 days)
```bash
./generate-sample-data.sh --days=30 --assets=4
```
- Standard configuration
- Good balance of data and performance

### For Comprehensive Demos (90 days)
```bash
./generate-sample-data.sh --days=90 --assets=4
```
- Extensive historical data
- Shows long-term trends
- Takes longer to generate

---

## 🎨 Data Characteristics

### Sensor Types Generated
- **Temperature**: 65-105°C with daily cycles
- **Voltage**: 220-420V with minor fluctuations
- **Current**: 80-250A with load variations
- **Vibration**: 0.3-2.5 mm/s with degradation
- **Pressure**: 3.0-5.5 bar with cycles

### Patterns Included
- ✅ Daily temperature cycles
- ✅ Weekly degradation trends
- ✅ Random noise (realistic variance)
- ✅ Anomalies (5% occurrence)
- ✅ Seasonal effects
- ✅ Equipment aging

### Anomaly Types
- **Low Severity**: 12.5-25% deviation
- **Medium Severity**: 25-37.5% deviation
- **High Severity**: 37.5-50% deviation
- **Critical Severity**: >50% deviation

---

## 📚 Documentation

- **Getting Started**: `GETTING_STARTED.md`
- **Sample Data Guide**: `SAMPLE_DATA_GUIDE.md`
- **Full README**: `README.md`
- **Deployment**: `DEPLOYMENT.md`
- **AWS EKS**: `AWS_EKS_IMPLEMENTATION_PLAN.md`

---

## 🆘 Common Issues

### "Cannot find module 'pg'"
**Solution**: Run from backend directory or use the shell script
```bash
cd backend
npm install
npm run generate-data
```

### "Database connection failed"
**Solution**: Make sure Docker is running and database is started
```bash
docker-compose up -d
docker ps | grep timescaledb
```

### "No data showing in UI"
**Solution**: Verify data was generated
```bash
psql -h localhost -p 5433 -U postgres -d opssight \
  -c "SELECT COUNT(*) FROM sensor_readings;"
```

---

## 🎯 Summary

**For Prototypes/Demos**: Use the built-in generator ✅  
**For Research**: Use public datasets (NASA, Kaggle)  
**For Production**: Integrate with real SCADA/IoT systems  
**For Custom Scenarios**: Modify the generator script  

**Recommended Command:**
```bash
./generate-sample-data.sh
```

That's it! You'll have a fully functional prototype with realistic data in under 2 minutes.

---

**Questions?** See `SAMPLE_DATA_GUIDE.md` for detailed instructions or contact support@opssightai.com
