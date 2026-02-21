-- OpsSightAI Phase 1 Asset Management Enhancements
-- Migration: 001_asset_management_phase1
-- Description: Add tables for maintenance management, performance metrics, and asset relationships

-- ============================================================================
-- MAINTENANCE MANAGEMENT TABLES
-- ============================================================================

-- Technicians table
CREATE TABLE IF NOT EXISTS technicians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  skills TEXT[],
  certifications JSONB,
  availability_status VARCHAR(50) DEFAULT 'available', -- 'available', 'busy', 'off_duty'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Maintenance schedules table
CREATE TABLE IF NOT EXISTS maintenance_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  schedule_name VARCHAR(255) NOT NULL,
  schedule_type VARCHAR(50) NOT NULL, -- 'preventive', 'predictive', 'corrective'
  trigger_type VARCHAR(50) NOT NULL, -- 'time_based', 'usage_based'
  frequency VARCHAR(50), -- 'daily', 'weekly', 'monthly', 'quarterly', 'annual', 'custom'
  interval_value INTEGER, -- For custom intervals
  interval_unit VARCHAR(20), -- 'days', 'weeks', 'months', 'hours', 'cycles'
  usage_threshold INTEGER, -- For usage-based triggers
  next_due_date TIMESTAMPTZ,
  task_description TEXT NOT NULL,
  estimated_duration INTEGER, -- minutes
  required_parts JSONB,
  assigned_technician_id UUID REFERENCES technicians(id),
  priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_maintenance_schedules_asset ON maintenance_schedules(asset_id);
CREATE INDEX idx_maintenance_schedules_next_due ON maintenance_schedules(next_due_date) WHERE is_active = true;

-- Work orders table
CREATE TABLE IF NOT EXISTS work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES maintenance_schedules(id),
  work_order_number VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  maintenance_type VARCHAR(50) NOT NULL, -- 'preventive', 'corrective', 'predictive', 'emergency'
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'assigned', 'in_progress', 'completed', 'cancelled'
  assigned_technician_id UUID REFERENCES technicians(id),
  estimated_duration INTEGER, -- minutes
  actual_duration INTEGER, -- minutes
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  completion_notes TEXT,
  created_by UUID,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_work_orders_asset ON work_orders(asset_id);
CREATE INDEX idx_work_orders_status ON work_orders(status);
CREATE INDEX idx_work_orders_technician ON work_orders(assigned_technician_id);
CREATE INDEX idx_work_orders_created ON work_orders(created_at DESC);

-- Maintenance history table
CREATE TABLE IF NOT EXISTS maintenance_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  work_order_id UUID REFERENCES work_orders(id),
  performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  maintenance_type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  technician_id UUID REFERENCES technicians(id),
  duration INTEGER, -- minutes
  labor_cost DECIMAL(10,2),
  parts_cost DECIMAL(10,2),
  contractor_cost DECIMAL(10,2),
  other_cost DECIMAL(10,2),
  total_cost DECIMAL(10,2) GENERATED ALWAYS AS (
    COALESCE(labor_cost, 0) + COALESCE(parts_cost, 0) + 
    COALESCE(contractor_cost, 0) + COALESCE(other_cost, 0)
  ) STORED,
  parts_used JSONB,
  notes TEXT,
  attachments JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_maintenance_history_asset ON maintenance_history(asset_id, performed_at DESC);
CREATE INDEX idx_maintenance_history_date ON maintenance_history(performed_at DESC);

-- Maintenance recommendations table
CREATE TABLE IF NOT EXISTS maintenance_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  recommendation_type VARCHAR(50) NOT NULL, -- 'risk_based', 'anomaly_based', 'predictive'
  urgency VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  suggested_actions TEXT NOT NULL,
  estimated_cost DECIMAL(10,2),
  estimated_downtime INTEGER, -- minutes
  risk_if_deferred TEXT,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'accepted', 'deferred', 'dismissed'
  status_updated_at TIMESTAMPTZ,
  status_updated_by UUID,
  deferral_reason TEXT,
  related_anomaly_id UUID,
  related_risk_score DECIMAL(5,2)
);

CREATE INDEX idx_maintenance_recommendations_asset ON maintenance_recommendations(asset_id);
CREATE INDEX idx_maintenance_recommendations_status ON maintenance_recommendations(status);
CREATE INDEX idx_maintenance_recommendations_urgency ON maintenance_recommendations(urgency);

-- ============================================================================
-- PERFORMANCE METRICS TABLES
-- ============================================================================

-- Uptime/Downtime events table
CREATE TABLE IF NOT EXISTS uptime_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  event_type VARCHAR(20) NOT NULL, -- 'uptime', 'downtime'
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration INTEGER, -- minutes, calculated when end_time is set
  downtime_category VARCHAR(50), -- 'planned_maintenance', 'unplanned_failure', 'no_demand', 'other'
  downtime_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_uptime_events_asset ON uptime_events(asset_id, start_time DESC);
CREATE INDEX idx_uptime_events_type ON uptime_events(event_type, start_time DESC);

-- Asset metrics table (daily aggregated metrics)
CREATE TABLE IF NOT EXISTS asset_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  uptime_hours DECIMAL(10,2) DEFAULT 0,
  downtime_hours DECIMAL(10,2) DEFAULT 0,
  planned_downtime_hours DECIMAL(10,2) DEFAULT 0,
  unplanned_downtime_hours DECIMAL(10,2) DEFAULT 0,
  units_produced INTEGER DEFAULT 0,
  defects INTEGER DEFAULT 0,
  good_units INTEGER GENERATED ALWAYS AS (units_produced - defects) STORED,
  energy_consumed DECIMAL(12,2), -- kWh
  operating_cost DECIMAL(12,2),
  maintenance_cost DECIMAL(12,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(asset_id, metric_date)
);

CREATE INDEX idx_asset_metrics_asset_date ON asset_metrics(asset_id, metric_date DESC);

-- Asset KPIs table (calculated KPIs)
CREATE TABLE IF NOT EXISTS asset_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  time_period VARCHAR(20) NOT NULL, -- 'shift', 'daily', 'weekly', 'monthly'
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  availability DECIMAL(5,2), -- percentage
  performance DECIMAL(5,2), -- percentage
  quality DECIMAL(5,2), -- percentage
  oee DECIMAL(5,2), -- percentage
  mtbf DECIMAL(10,2), -- hours
  mttr DECIMAL(10,2), -- hours
  uptime_percentage DECIMAL(5,2),
  cost_per_operating_hour DECIMAL(10,2),
  failure_count INTEGER DEFAULT 0,
  repair_count INTEGER DEFAULT 0,
  total_operating_hours DECIMAL(10,2),
  UNIQUE(asset_id, time_period, period_start)
);

CREATE INDEX idx_asset_kpis_asset ON asset_kpis(asset_id, calculated_at DESC);
CREATE INDEX idx_asset_kpis_period ON asset_kpis(time_period, period_start DESC);

-- ============================================================================
-- ASSET RELATIONSHIPS TABLES
-- ============================================================================

-- Asset relationships table (parent-child and dependencies)
CREATE TABLE IF NOT EXISTS asset_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  child_asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  relationship_type VARCHAR(50) NOT NULL, -- 'contains', 'depends_on', 'feeds_into', 'controls'
  relationship_strength VARCHAR(20) DEFAULT 'normal', -- 'weak', 'normal', 'strong', 'critical'
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_asset_id, child_asset_id, relationship_type),
  CHECK (parent_asset_id != child_asset_id)
);

CREATE INDEX idx_asset_relationships_parent ON asset_relationships(parent_asset_id);
CREATE INDEX idx_asset_relationships_child ON asset_relationships(child_asset_id);
CREATE INDEX idx_asset_relationships_type ON asset_relationships(relationship_type);

-- Asset groups table
CREATE TABLE IF NOT EXISTS asset_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  group_type VARCHAR(50) NOT NULL, -- 'production_line', 'process_unit', 'functional', 'location'
  plant_id VARCHAR(100) NOT NULL,
  parent_group_id UUID REFERENCES asset_groups(id) ON DELETE CASCADE,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_asset_groups_plant ON asset_groups(plant_id);
CREATE INDEX idx_asset_groups_type ON asset_groups(group_type);
CREATE INDEX idx_asset_groups_parent ON asset_groups(parent_group_id);

-- Asset group members table
CREATE TABLE IF NOT EXISTS asset_group_members (
  group_id UUID NOT NULL REFERENCES asset_groups(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (group_id, asset_id)
);

CREATE INDEX idx_asset_group_members_group ON asset_group_members(group_id);
CREATE INDEX idx_asset_group_members_asset ON asset_group_members(asset_id);

-- ============================================================================
-- UPDATE EXISTING ASSETS TABLE
-- ============================================================================

-- Add new columns to assets table if they don't exist
ALTER TABLE assets ADD COLUMN IF NOT EXISTS last_maintenance_date TIMESTAMPTZ;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS next_scheduled_maintenance TIMESTAMPTZ;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS total_operating_hours DECIMAL(12,2) DEFAULT 0;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS total_maintenance_cost DECIMAL(12,2) DEFAULT 0;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS criticality_score INTEGER DEFAULT 50 CHECK (criticality_score >= 0 AND criticality_score <= 100);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update work order number sequence
CREATE OR REPLACE FUNCTION generate_work_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.work_order_number IS NULL THEN
    NEW.work_order_number := 'WO-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('work_order_seq')::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS work_order_seq START 1;

CREATE TRIGGER set_work_order_number
  BEFORE INSERT ON work_orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_work_order_number();

-- Function to update asset last maintenance date
CREATE OR REPLACE FUNCTION update_asset_last_maintenance()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE assets
  SET last_maintenance_date = NEW.performed_at,
      updated_at = NOW()
  WHERE id = NEW.asset_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_asset_maintenance_date
  AFTER INSERT ON maintenance_history
  FOR EACH ROW
  EXECUTE FUNCTION update_asset_last_maintenance();

-- Function to calculate uptime event duration
CREATE OR REPLACE FUNCTION calculate_uptime_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.end_time IS NOT NULL AND NEW.start_time IS NOT NULL THEN
    NEW.duration := EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 60; -- minutes
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_duration
  BEFORE INSERT OR UPDATE ON uptime_events
  FOR EACH ROW
  EXECUTE FUNCTION calculate_uptime_duration();

-- ============================================================================
-- SAMPLE DATA FOR DEVELOPMENT
-- ============================================================================

-- Insert sample technicians
INSERT INTO technicians (name, email, phone, skills, certifications, availability_status)
VALUES 
  ('John Smith', 'john.smith@opssightai.com', '+1-555-0101', ARRAY['electrical', 'mechanical', 'plc'], '{"electrical": "Level 3", "safety": "OSHA 30"}', 'available'),
  ('Maria Garcia', 'maria.garcia@opssightai.com', '+1-555-0102', ARRAY['mechanical', 'hydraulic'], '{"mechanical": "Level 2", "safety": "OSHA 10"}', 'available'),
  ('David Chen', 'david.chen@opssightai.com', '+1-555-0103', ARRAY['electrical', 'instrumentation'], '{"electrical": "Level 2", "instrumentation": "Level 3"}', 'busy')
ON CONFLICT DO NOTHING;

-- Insert sample asset groups
INSERT INTO asset_groups (name, description, group_type, plant_id)
VALUES 
  ('Production Line 1', 'Main production line for manufacturing', 'production_line', 'PLANT-001'),
  ('Power Distribution', 'Electrical power distribution system', 'functional', 'PLANT-001'),
  ('HVAC System', 'Heating, ventilation, and air conditioning', 'functional', 'PLANT-001')
ON CONFLICT DO NOTHING;

COMMIT;
