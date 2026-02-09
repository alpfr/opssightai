# OpsSightAI - Sample Data Guide

This guide provides multiple options for obtaining realistic industrial sensor data for the OpsSightAI prototype.

## 🎯 Quick Start - Generate Sample Data

### Option 1: Use Our Data Generator (Recommended)

The easiest way to get started with realistic data:

```bash
# Navigate to backend directory
cd opssightai/backend

# Install dependencies (if not already done)
npm install

# Run the data generator
node ../scripts/generate-sample-data.js

# Generate custom amount of data
node ../scripts/generate-sample-data.js --days=60 --assets=4
```

**What it generates:**
- 4 industrial assets (Transformer, Motor, Generator, Pump)
- 35 days of sensor readings (default)
- 12 readings per hour per sensor (every 5 minutes)
- Realistic anomalies (5% occurrence rate)
- Daily risk scores
- Sample notifications
- Demo user account

**Parameters:**
- `--days=N` - Number of days of historical data (default: 35)
- `--assets=N` - Number of assets to create (default: 4, max: 4)


## 📊 Option 2: Public Industrial Datasets

### NASA Turbofan Engine Degradation Dataset
**Source**: [NASA Prognostics Data Repository](https://ti.arc.nasa.gov/tech/dash/groups/pcoe/prognostic-data-repository/)

**Description**: Real sensor data from turbofan engines with degradation patterns

**How to use:**
1. Download from: https://ti.arc.nasa.gov/c/6/
2. Extract the dataset
3. Use our conversion script (see below)

```bash
# Download dataset
wget https://ti.arc.nasa.gov/c/6/ -O turbofan_data.zip
unzip turbofan_data.zip

# Convert to OpsSightAI format
node scripts/convert-nasa-data.js turbofan_data/train_FD001.txt
```

### UC Irvine Machine Learning Repository
**Source**: [UCI ML Repository](https://archive.ics.uci.edu/ml/index.php)

**Relevant Datasets:**
- **Condition Monitoring of Hydraulic Systems**: https://archive.ics.uci.edu/ml/datasets/Condition+monitoring+of+hydraulic+systems
- **Gas Sensor Array**: https://archive.ics.uci.edu/ml/datasets/Gas+Sensor+Array+Drift+Dataset
- **SECOM**: https://archive.ics.uci.edu/ml/datasets/SECOM

### Kaggle Industrial Datasets
**Source**: [Kaggle](https://www.kaggle.com/)

**Recommended Datasets:**
1. **Predictive Maintenance Dataset**: https://www.kaggle.com/datasets/shivamb/machine-predictive-maintenance-classification
2. **Pump Sensor Data**: https://www.kaggle.com/datasets/nphantawee/pump-sensor-data
3. **Industrial IoT Sensor Data**: https://www.kaggle.com/datasets/garystafford/environmental-sensor-data-132k

**How to use:**
```bash
# Install Kaggle CLI
pip install kaggle

# Configure API credentials (get from kaggle.com/account)
export KAGGLE_USERNAME=your_username
export KAGGLE_KEY=your_api_key

# Download dataset
kaggle datasets download -d shivamb/machine-predictive-maintenance-classification

# Convert to OpsSightAI format
node scripts/convert-kaggle-data.js predictive_maintenance.csv
```

## 🔧 Option 3: Use Real Industrial Data

### SCADA Systems Integration

If you have access to SCADA (Supervisory Control and Data Acquisition) systems:

**Common SCADA Protocols:**
- OPC UA (Open Platform Communications Unified Architecture)
- Modbus TCP/IP
- DNP3 (Distributed Network Protocol)
- MQTT (Message Queuing Telemetry Transport)

**Integration Steps:**

1. **Install OPC UA Client** (example):
```bash
npm install node-opcua
```

2. **Create Data Collector** (`scripts/collect-scada-data.js`):
```javascript
const { OPCUAClient } = require('node-opcua');

async function collectData() {
  const client = OPCUAClient.create({
    endpoint_must_exist: false,
  });
  
  await client.connect('opc.tcp://your-scada-server:4840');
  const session = await client.createSession();
  
  // Read sensor values
  const dataValue = await session.read({
    nodeId: 'ns=2;s=Temperature',
    attributeId: AttributeIds.Value
  });
  
  // Store in OpsSightAI database
  // ... your code here
}
```

### IoT Platform Integration

**AWS IoT Core:**
```bash
# Subscribe to IoT topic
aws iot-data subscribe --topic "factory/sensors/#" --region us-west-2
```

**Azure IoT Hub:**
```bash
# Install Azure IoT SDK
npm install azure-iothub
```

**Google Cloud IoT:**
```bash
# Install Google Cloud IoT SDK
npm install @google-cloud/iot
```

## 🎨 Option 4: Synthetic Data Generation

### Using Python Faker and NumPy

Create `scripts/generate-synthetic-data.py`:

```python
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import psycopg2
import json

# Configuration
DAYS = 35
ASSETS = 4
READINGS_PER_HOUR = 12

# Asset configurations
assets = [
    {
        'name': 'Transformer T1',
        'type': 'transformer',
        'sensors': {
            'temperature': {'mean': 75, 'std': 5, 'min': 65, 'max': 95},
            'voltage': {'mean': 230, 'std': 3, 'min': 220, 'max': 240},
            'current': {'mean': 95, 'std': 8, 'min': 80, 'max': 120},
        }
    },
    # ... more assets
]

# Generate data
def generate_sensor_data():
    data = []
    start_date = datetime.now() - timedelta(days=DAYS)
    
    for day in range(DAYS):
        for hour in range(24):
            for reading in range(READINGS_PER_HOUR):
                timestamp = start_date + timedelta(
                    days=day,
                    hours=hour,
                    minutes=(60 // READINGS_PER_HOUR) * reading
                )
                
                for asset in assets:
                    for sensor_name, config in asset['sensors'].items():
                        # Generate value with daily cycle
                        hour_factor = np.sin((hour - 6) * np.pi / 12)
                        value = np.random.normal(
                            config['mean'] + hour_factor * config['std'] * 0.5,
                            config['std'] * 0.3
                        )
                        value = np.clip(value, config['min'], config['max'])
                        
                        data.append({
                            'timestamp': timestamp,
                            'asset': asset['name'],
                            'sensor': sensor_name,
                            'value': round(value, 4)
                        })
    
    return pd.DataFrame(data)

# Generate and save
df = generate_sensor_data()
df.to_csv('sensor_data.csv', index=False)
print(f"Generated {len(df)} sensor readings")
```

Run it:
```bash
python scripts/generate-synthetic-data.py
node scripts/import-csv-data.js sensor_data.csv
```

## 📥 Option 5: Import from CSV/Excel

### CSV Format

Create a CSV file with this structure:

```csv
timestamp,asset_id,sensor_type,value,unit
2026-01-01T00:00:00Z,asset-uuid-1,temperature,75.5,°C
2026-01-01T00:05:00Z,asset-uuid-1,temperature,76.2,°C
2026-01-01T00:00:00Z,asset-uuid-1,voltage,230.1,V
```

### Import Script

```bash
# Import CSV data
node scripts/import-csv-data.js your_data.csv

# Import Excel data
node scripts/import-excel-data.js your_data.xlsx
```

## 🌐 Option 6: Online Data Sources

### Industrial IoT Data Platforms

1. **ThingSpeak** (https://thingspeak.com/)
   - Free IoT data platform
   - Public channels with sensor data
   - REST API access

2. **Adafruit IO** (https://io.adafruit.com/)
   - IoT data feeds
   - Public data streams

3. **OpenSensors** (https://opensensors.com/)
   - Open sensor data marketplace

### Example: Fetch from ThingSpeak

```javascript
const axios = require('axios');

async function fetchThingSpeakData() {
  const channelId = '12345'; // Public channel
  const apiKey = 'YOUR_READ_API_KEY';
  
  const response = await axios.get(
    `https://api.thingspeak.com/channels/${channelId}/feeds.json`,
    { params: { api_key: apiKey, results: 8000 } }
  );
  
  // Convert to OpsSightAI format
  const readings = response.data.feeds.map(feed => ({
    timestamp: feed.created_at,
    value: parseFloat(feed.field1),
    sensor_type: 'temperature',
    // ... more fields
  }));
  
  return readings;
}
```

## 🔄 Data Conversion Scripts

### Create CSV Importer

Create `scripts/import-csv-data.js`:

```javascript
const fs = require('fs');
const csv = require('csv-parser');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DATABASE_HOST || 'localhost',
  port: process.env.DATABASE_PORT || 5433,
  database: process.env.DATABASE_NAME || 'opssight',
  user: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
});

async function importCSV(filename) {
  const readings = [];
  
  fs.createReadStream(filename)
    .pipe(csv())
    .on('data', (row) => {
      readings.push({
        time: row.timestamp,
        asset_id: row.asset_id,
        sensor_type: row.sensor_type,
        value: parseFloat(row.value),
        unit: row.unit,
      });
    })
    .on('end', async () => {
      console.log(`Importing ${readings.length} readings...`);
      
      for (const reading of readings) {
        await pool.query(
          `INSERT INTO sensor_readings (time, asset_id, sensor_type, value, unit)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT DO NOTHING`,
          [reading.time, reading.asset_id, reading.sensor_type, reading.value, reading.unit]
        );
      }
      
      console.log('Import complete!');
      await pool.end();
    });
}

const filename = process.argv[2];
if (!filename) {
  console.error('Usage: node import-csv-data.js <filename.csv>');
  process.exit(1);
}

importCSV(filename);
```

## 📋 Data Requirements

For OpsSightAI to work properly, your data should include:

### Minimum Requirements:
- **Timestamp**: ISO 8601 format (e.g., `2026-02-08T12:00:00Z`)
- **Asset ID**: UUID or unique identifier
- **Sensor Type**: temperature, voltage, current, vibration, pressure, etc.
- **Value**: Numeric sensor reading
- **Unit**: Measurement unit (°C, V, A, mm/s, bar, etc.)

### Recommended Data Points:
- At least 7 days of historical data
- Readings every 5-15 minutes
- Multiple sensor types per asset
- Some anomalous readings for testing

### Sensor Types by Asset:

**Transformers:**
- Temperature (°C)
- Voltage (V)
- Current (A)
- Oil level (%)

**Motors:**
- Temperature (°C)
- Vibration (mm/s)
- Current (A)
- Speed (RPM)

**Generators:**
- Temperature (°C)
- Voltage (V)
- Current (A)
- Frequency (Hz)

**Pumps:**
- Temperature (°C)
- Pressure (bar)
- Vibration (mm/s)
- Flow rate (L/min)

## 🎯 Quick Start Checklist

- [ ] Database is running (Docker Compose)
- [ ] Backend is running
- [ ] Run data generator: `node scripts/generate-sample-data.js`
- [ ] Verify data in database: `psql -h localhost -p 5433 -U postgres -d opssight`
- [ ] Check sensor readings: `SELECT COUNT(*) FROM sensor_readings;`
- [ ] Access frontend: http://localhost:4001
- [ ] View assets and their data

## 🆘 Troubleshooting

### Database Connection Error
```bash
# Check if database is running
docker ps | grep timescaledb

# Restart database
cd opssightai
docker-compose restart timescaledb
```

### No Data Showing in UI
```bash
# Verify data exists
psql -h localhost -p 5433 -U postgres -d opssight -c "SELECT COUNT(*) FROM sensor_readings;"

# Check backend logs
cd backend
npm run dev
```

### Data Generator Fails
```bash
# Check database connection
psql -h localhost -p 5433 -U postgres -d opssight -c "SELECT 1;"

# Check environment variables
echo $DATABASE_HOST
echo $DATABASE_PORT
```

## 📚 Additional Resources

- [TimescaleDB Documentation](https://docs.timescale.com/)
- [Industrial IoT Data Standards](https://www.iiconsortium.org/)
- [OPC UA Specification](https://opcfoundation.org/)
- [MQTT Protocol](https://mqtt.org/)

---

**Need help?** Open an issue or contact support@opssightai.com

