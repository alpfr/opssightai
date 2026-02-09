-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Create assets table
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  plant_id VARCHAR(100) NOT NULL,
  location JSONB,
  metadata JSONB,
  status VARCHAR(50) DEFAULT 'active',
  current_risk_score DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create sensor readings table (will be converted to hypertable)
CREATE TABLE IF NOT EXISTS sensor_readings (
  time TIMESTAMPTZ NOT NULL,
  asset_id UUID NOT NULL,
  sensor_type VARCHAR(50) NOT NULL,
  value DECIMAL(10,4) NOT NULL,
  unit VARCHAR(20),
  quality VARCHAR(20) DEFAULT 'good',
  metadata JSONB,
  PRIMARY KEY (time, asset_id, sensor_type)
);

-- Convert sensor_readings to hypertable
SELECT create_hypertable('sensor_readings', 'time', if_not_exists => TRUE);

-- Create risk scores table (will be converted to hypertable)
CREATE TABLE IF NOT EXISTS risk_scores (
  time TIMESTAMPTZ NOT NULL,
  asset_id UUID NOT NULL,
  score DECIMAL(5,2) NOT NULL,
  explanation TEXT,
  factors JSONB,
  model_version VARCHAR(50),
  confidence DECIMAL(3,2),
  PRIMARY KEY (time, asset_id)
);

-- Convert risk_scores to hypertable
SELECT create_hypertable('risk_scores', 'time', if_not_exists => TRUE);

-- Create anomalies table
CREATE TABLE IF NOT EXISTS anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  severity VARCHAR(20) NOT NULL,
  metric VARCHAR(100) NOT NULL,
  expected_value DECIMAL(10,4),
  actual_value DECIMAL(10,4),
  deviation DECIMAL(5,2),
  description TEXT,
  status VARCHAR(50) DEFAULT 'open',
  assigned_to UUID,
  resolved_at TIMESTAMPTZ,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_anomalies_asset_time ON anomalies(asset_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_anomalies_severity ON anomalies(severity) WHERE status = 'open';

-- Create forecasts table
CREATE TABLE IF NOT EXISTS forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ NOT NULL,
  predictions JSONB NOT NULL,
  model_version VARCHAR(50),
  accuracy DECIMAL(3,2)
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  plant_ids TEXT[],
  notification_preferences JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  asset_id UUID,
  type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  channels TEXT[]
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id) WHERE read_at IS NULL;

-- Create executive summaries table
CREATE TABLE IF NOT EXISTS executive_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id VARCHAR(100) NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  overall_health_score DECIMAL(5,2) NOT NULL,
  total_assets INTEGER NOT NULL,
  risk_distribution JSONB NOT NULL,
  critical_anomaly_count INTEGER NOT NULL,
  top_risk_assets JSONB NOT NULL,
  trending_issues JSONB,
  recommendations JSONB
);

CREATE INDEX IF NOT EXISTS idx_executive_summaries_plant ON executive_summaries(plant_id, generated_at DESC);

-- Insert sample data for development
INSERT INTO assets (name, type, plant_id, location, metadata, status, current_risk_score)
VALUES 
  ('Main Transformer T1', 'transformer', 'PLANT-001', '{"building": "A", "floor": "1"}', '{"manufacturer": "ABB", "model": "TXF-500", "capacity": "500 kVA"}', 'active', 45.5),
  ('Motor M1', 'motor', 'PLANT-001', '{"building": "B", "floor": "2"}', '{"manufacturer": "Siemens", "model": "MOT-100", "power": "100 HP"}', 'active', 62.3),
  ('Generator G1', 'generator', 'PLANT-001', '{"building": "C", "floor": "1"}', '{"manufacturer": "Caterpillar", "model": "GEN-250", "capacity": "250 kW"}', 'active', 38.7)
ON CONFLICT DO NOTHING;

-- Insert sample admin user (password: admin123)
INSERT INTO users (email, password_hash, name, role, plant_ids)
VALUES ('admin@opssightai.com', '$2b$10$rKZvVqZvZvZvZvZvZvZvZuZvZvZvZvZvZvZvZvZvZvZvZvZvZvZvZ', 'Admin User', 'admin', ARRAY['PLANT-001'])
ON CONFLICT DO NOTHING;
