/**
 * OpsSightAI - Sample Data Generator
 * 
 * Generates realistic industrial sensor data for prototype demonstrations
 * 
 * Usage:
 *   node scripts/generate-sample-data.js
 *   node scripts/generate-sample-data.js --days=30 --assets=10
 */

const { Pool } = require('pg');

// Configuration
const config = {
  days: parseInt(process.argv.find(arg => arg.startsWith('--days='))?.split('=')[1]) || 35,
  assetsCount: parseInt(process.argv.find(arg => arg.startsWith('--assets='))?.split('=')[1]) || 4,
  readingsPerHour: 12, // One reading every 5 minutes
};

// Database connection
const pool = new Pool({
  host: process.env.DATABASE_HOST || 'localhost',
  port: process.env.DATABASE_PORT || 5433,
  database: process.env.DATABASE_NAME || 'opssight',
  user: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
});

// Asset templates with realistic parameters
const assetTemplates = [
  {
    name: 'Main Transformer T1',
    type: 'transformer',
    manufacturer: 'ABB',
    model: 'TXF-500',
    sensors: {
      temperature: { min: 65, max: 95, normal: 75, unit: '°C', variance: 5 },
      voltage: { min: 220, max: 240, normal: 230, unit: 'V', variance: 3 },
      current: { min: 80, max: 120, normal: 95, unit: 'A', variance: 8 },
    }
  },
  {
    name: 'Motor M1',
    type: 'motor',
    manufacturer: 'Siemens',
    model: 'MOT-100',
    sensors: {
      temperature: { min: 70, max: 100, normal: 80, unit: '°C', variance: 6 },
      vibration: { min: 0.5, max: 2.5, normal: 1.2, unit: 'mm/s', variance: 0.3 },
      current: { min: 120, max: 180, normal: 145, unit: 'A', variance: 10 },
    }
  },
  {
    name: 'Generator G1',
    type: 'generator',
    manufacturer: 'Caterpillar',
    model: 'GEN-250',
    sensors: {
      temperature: { min: 75, max: 105, normal: 85, unit: '°C', variance: 7 },
      voltage: { min: 380, max: 420, normal: 400, unit: 'V', variance: 5 },
      current: { min: 150, max: 250, normal: 190, unit: 'A', variance: 15 },
    }
  },
  {
    name: 'Pump P1',
    type: 'pump',
    manufacturer: 'Grundfos',
    model: 'PMP-75',
    sensors: {
      temperature: { min: 60, max: 85, normal: 70, unit: '°C', variance: 4 },
      pressure: { min: 3.0, max: 5.5, normal: 4.2, unit: 'bar', variance: 0.4 },
      vibration: { min: 0.3, max: 1.8, normal: 0.8, unit: 'mm/s', variance: 0.2 },
    }
  },
];

// Helper functions
function randomNormal(mean, stdDev) {
  // Box-Muller transform for normal distribution
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return mean + z0 * stdDev;
}

function generateSensorValue(sensor, timestamp, dayIndex) {
  const { min, max, normal, variance } = sensor;
  
  // Add daily cycle (temperature higher during day)
  const hour = timestamp.getHours();
  const dailyCycle = Math.sin((hour - 6) * Math.PI / 12) * variance * 0.5;
  
  // Add weekly trend (slight degradation over time)
  const weeklyTrend = (dayIndex / config.days) * variance * 0.3;
  
  // Add random noise
  const noise = randomNormal(0, variance * 0.3);
  
  // Occasionally add anomalies (5% chance)
  const anomaly = Math.random() < 0.05 ? randomNormal(0, variance * 3) : 0;
  
  let value = normal + dailyCycle + weeklyTrend + noise + anomaly;
  
  // Clamp to min/max
  value = Math.max(min, Math.min(max, value));
  
  return parseFloat(value.toFixed(4));
}

function generateAnomaly(assetId, timestamp, sensorType, expectedValue, actualValue) {
  const deviation = Math.abs(((actualValue - expectedValue) / expectedValue) * 100);
  
  let severity = 'low';
  if (deviation > 37.5) severity = 'critical';
  else if (deviation > 25) severity = 'high';
  else if (deviation > 12.5) severity = 'medium';
  
  return {
    asset_id: assetId,
    timestamp,
    severity,
    metric: sensorType,
    expected_value: expectedValue,
    actual_value: actualValue,
    deviation: parseFloat(deviation.toFixed(2)),
    description: `${sensorType} reading of ${actualValue} is ${deviation.toFixed(1)}% ${actualValue > expectedValue ? 'above' : 'below'} expected value of ${expectedValue}`,
    status: 'open'
  };
}

async function main() {
  console.log('🚀 OpsSightAI Sample Data Generator');
  console.log('=====================================');
  console.log(`Generating ${config.days} days of data for ${config.assetsCount} assets`);
  console.log(`Readings per hour: ${config.readingsPerHour}`);
  console.log('');

  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connected');

    // Get or create assets
    console.log('\n📦 Creating assets...');
    const assets = [];
    
    for (let i = 0; i < Math.min(config.assetsCount, assetTemplates.length); i++) {
      const template = assetTemplates[i];
      const result = await pool.query(
        `INSERT INTO assets (name, type, plant_id, location, metadata, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT DO NOTHING
         RETURNING id`,
        [
          template.name,
          template.type,
          'PLANT-001',
          JSON.stringify({ building: String.fromCharCode(65 + i), floor: '1' }),
          JSON.stringify({ manufacturer: template.manufacturer, model: template.model }),
          'active'
        ]
      );
      
      if (result.rows.length > 0) {
        assets.push({ id: result.rows[0].id, ...template });
        console.log(`  ✓ Created ${template.name} (${template.type})`);
      } else {
        // Asset already exists, get its ID
        const existing = await pool.query(
          'SELECT id FROM assets WHERE name = $1',
          [template.name]
        );
        if (existing.rows.length > 0) {
          assets.push({ id: existing.rows[0].id, ...template });
          console.log(`  ✓ Using existing ${template.name} (${template.type})`);
        }
      }
    }

    // Generate sensor readings
    console.log('\n📊 Generating sensor readings...');
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - config.days);
    
    const totalReadings = config.days * 24 * config.readingsPerHour * assets.length;
    let readingsGenerated = 0;
    let anomaliesDetected = 0;
    
    const sensorReadings = [];
    const anomalies = [];
    
    for (let dayIndex = 0; dayIndex < config.days; dayIndex++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + dayIndex);
      
      for (let hour = 0; hour < 24; hour++) {
        for (let reading = 0; reading < config.readingsPerHour; reading++) {
          const timestamp = new Date(currentDate);
          timestamp.setHours(hour);
          timestamp.setMinutes((60 / config.readingsPerHour) * reading);
          
          for (const asset of assets) {
            for (const [sensorType, sensorConfig] of Object.entries(asset.sensors)) {
              const value = generateSensorValue(sensorConfig, timestamp, dayIndex);
              
              sensorReadings.push({
                time: timestamp.toISOString(),
                asset_id: asset.id,
                sensor_type: sensorType,
                value,
                unit: sensorConfig.unit,
                quality: 'good'
              });
              
              // Check for anomalies
              const deviation = Math.abs(value - sensorConfig.normal);
              if (deviation > sensorConfig.variance * 2.5) {
                anomalies.push(generateAnomaly(
                  asset.id,
                  timestamp.toISOString(),
                  sensorType,
                  sensorConfig.normal,
                  value
                ));
                anomaliesDetected++;
              }
              
              readingsGenerated++;
            }
          }
        }
      }
      
      // Progress indicator
      const progress = ((dayIndex + 1) / config.days * 100).toFixed(1);
      process.stdout.write(`\r  Progress: ${progress}% (${readingsGenerated}/${totalReadings} readings, ${anomaliesDetected} anomalies)`);
    }
    
    console.log('\n');

    // Batch insert sensor readings
    console.log('💾 Inserting sensor readings into database...');
    const batchSize = 1000;
    for (let i = 0; i < sensorReadings.length; i += batchSize) {
      const batch = sensorReadings.slice(i, i + batchSize);
      const values = batch.map((r, idx) => {
        const base = idx * 6;
        return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6})`;
      }).join(',');
      
      const params = batch.flatMap(r => [r.time, r.asset_id, r.sensor_type, r.value, r.unit, r.quality]);
      
      await pool.query(
        `INSERT INTO sensor_readings (time, asset_id, sensor_type, value, unit, quality)
         VALUES ${values}
         ON CONFLICT DO NOTHING`,
        params
      );
      
      process.stdout.write(`\r  Inserted ${Math.min(i + batchSize, sensorReadings.length)}/${sensorReadings.length} readings`);
    }
    console.log('\n');

    // Insert anomalies
    if (anomalies.length > 0) {
      console.log('🚨 Inserting anomalies...');
      for (const anomaly of anomalies) {
        await pool.query(
          `INSERT INTO anomalies (asset_id, timestamp, severity, metric, expected_value, actual_value, deviation, description, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [anomaly.asset_id, anomaly.timestamp, anomaly.severity, anomaly.metric, anomaly.expected_value, anomaly.actual_value, anomaly.deviation, anomaly.description, anomaly.status]
        );
      }
      console.log(`  ✓ Inserted ${anomalies.length} anomalies`);
    }

    // Generate risk scores
    console.log('\n📈 Generating risk scores...');
    for (const asset of assets) {
      for (let dayIndex = 0; dayIndex < config.days; dayIndex++) {
        const timestamp = new Date(startDate);
        timestamp.setDate(timestamp.getDate() + dayIndex);
        timestamp.setHours(12); // Noon each day
        
        // Calculate risk score based on sensor readings
        const baseRisk = 20 + Math.random() * 30;
        const trendRisk = (dayIndex / config.days) * 15;
        const randomRisk = Math.random() * 10;
        const riskScore = Math.min(100, baseRisk + trendRisk + randomRisk);
        
        await pool.query(
          `INSERT INTO risk_scores (time, asset_id, score, explanation, confidence)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT DO NOTHING`,
          [
            timestamp.toISOString(),
            asset.id,
            parseFloat(riskScore.toFixed(2)),
            `Risk assessment for ${asset.name}`,
            0.85
          ]
        );
      }
      console.log(`  ✓ Generated risk scores for ${asset.name}`);
    }

    // Update current risk scores on assets
    console.log('\n🔄 Updating current risk scores...');
    for (const asset of assets) {
      const latestRisk = await pool.query(
        'SELECT score FROM risk_scores WHERE asset_id = $1 ORDER BY time DESC LIMIT 1',
        [asset.id]
      );
      
      if (latestRisk.rows.length > 0) {
        await pool.query(
          'UPDATE assets SET current_risk_score = $1, updated_at = NOW() WHERE id = $2',
          [latestRisk.rows[0].score, asset.id]
        );
      }
    }

    // Create sample user
    console.log('\n👤 Creating sample user...');
    const userId = '166c97fe-2cd9-4149-bc42-bee305c58037';
    await pool.query(
      `INSERT INTO users (id, email, password_hash, name, role, plant_ids)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO NOTHING`,
      [userId, 'demo@opssightai.com', '$2b$10$dummy', 'Demo User', 'operator', ['PLANT-001']]
    );
    console.log('  ✓ Created demo user (demo@opssightai.com)');

    // Generate sample notifications
    console.log('\n🔔 Generating notifications...');
    const criticalAnomalies = anomalies.filter(a => a.severity === 'critical').slice(0, 5);
    for (const anomaly of criticalAnomalies) {
      await pool.query(
        `INSERT INTO notifications (user_id, asset_id, type, severity, title, message, channels)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          userId,
          anomaly.asset_id,
          'anomaly',
          anomaly.severity,
          `Critical Anomaly Detected`,
          anomaly.description,
          ['in-app', 'email']
        ]
      );
    }
    console.log(`  ✓ Created ${criticalAnomalies.length} notifications`);

    console.log('\n✅ Sample data generation complete!');
    console.log('\n📊 Summary:');
    console.log(`  • Assets: ${assets.length}`);
    console.log(`  • Sensor readings: ${readingsGenerated.toLocaleString()}`);
    console.log(`  • Anomalies: ${anomaliesDetected}`);
    console.log(`  • Risk scores: ${assets.length * config.days}`);
    console.log(`  • Time range: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`);
    console.log('\n🎯 You can now access the application with realistic data!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
