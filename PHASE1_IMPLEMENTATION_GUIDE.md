# OpsSightAI Phase 1 Implementation Guide

## 🎯 Overview

This guide provides step-by-step instructions for implementing Phase 1 Asset Management Enhancements.

## 📋 Prerequisites

- Docker and Docker Compose running
- OpsSightAI backend and frontend running
- PostgreSQL/TimescaleDB accessible on port 5433
- Node.js 18+ installed

## 🚀 Implementation Steps

### Step 1: Apply Database Migration

```bash
# Start database if not running
cd opssightai
docker-compose up -d

# Wait for database to be ready
sleep 10

# Run migration
./scripts/run-migration.sh
```

**What this does:**
- Creates 11 new tables for maintenance, metrics, and relationships
- Adds columns to existing assets table
- Creates triggers and functions for automation
- Inserts sample data (technicians, asset groups)

**New Tables Created:**
1. `technicians` - Maintenance technicians
2. `maintenance_schedules` - Preventive maintenance schedules
3. `work_orders` - Maintenance work orders
4. `maintenance_history` - Complete maintenance logs
5. `maintenance_recommendations` - AI-generated recommendations
6. `uptime_events` - Uptime/downtime tracking
7. `asset_metrics` - Daily aggregated metrics
8. `asset_kpis` - Calculated KPIs (OEE, MTBF, MTTR)
9. `asset_relationships` - Parent-child and dependencies
10. `asset_groups` - Logical asset groupings
11. `asset_group_members` - Group membership


### Step 2: Verify Migration

```bash
# Check if tables were created
psql -h localhost -p 5433 -U postgres -d opssight -c "\dt"

# Check sample data
psql -h localhost -p 5433 -U postgres -d opssight -c "SELECT * FROM technicians;"
psql -h localhost -p 5433 -U postgres -d opssight -c "SELECT * FROM asset_groups;"
```

### Step 3: Implement Backend Services

The following files need to be created in `opssightai/backend/src/`:

**Services:**
- `services/maintenanceService.ts` - Maintenance management logic
- `services/performanceService.ts` - Performance metrics calculations
- `services/relationshipService.ts` - Asset relationships management

**Routes:**
- `routes/maintenance.ts` - Maintenance API endpoints
- `routes/performance.ts` - Performance metrics API endpoints
- `routes/relationships.ts` - Asset relationships API endpoints

**Types:**
- `types/maintenance.ts` - Maintenance-related types
- `types/performance.ts` - Performance metrics types
- `types/relationships.ts` - Relationship types

### Step 4: Implement Frontend Components

The following files need to be created in `opssightai/frontend/src/`:

**Pages:**
- `pages/Maintenance.tsx` - Maintenance management dashboard
- `pages/Performance.tsx` - Performance metrics dashboard
- `pages/AssetHierarchy.tsx` - Asset relationships visualization

**Components:**
- `components/MaintenanceCalendar.tsx` - Calendar view
- `components/WorkOrderList.tsx` - Work order management
- `components/PerformanceMetrics.tsx` - KPI cards
- `components/OEEChart.tsx` - OEE visualization
- `components/AssetTree.tsx` - Hierarchy tree view
- `components/DependencyGraph.tsx` - Dependency visualization

### Step 5: Update Navigation

Add new routes to the application:

```typescript
// In App.tsx or router configuration
<Route path="/maintenance" element={<Maintenance />} />
<Route path="/performance" element={<Performance />} />
<Route path="/asset-hierarchy" element={<AssetHierarchy />} />
```

Update navigation menu to include new pages.

## 📊 Implementation Status

### ✅ Completed
- [x] Database schema design
- [x] Migration script created
- [x] Migration runner script created
- [x] Sample data prepared

### 🔄 In Progress
- [ ] Backend services implementation
- [ ] API endpoints implementation
- [ ] Frontend components implementation
- [ ] Integration testing

### ⏳ Pending
- [ ] Performance optimization
- [ ] Documentation updates
- [ ] User acceptance testing
- [ ] Production deployment

## 🎯 Quick Wins (Implement First)

These can be implemented immediately with minimal effort:

### 1. Add Maintenance Due Indicator to Asset List

**File:** `frontend/src/pages/AssetList.tsx`

```typescript
// Add this column to the table
<td>
  {asset.nextScheduledMaintenance && (
    <span className={`maintenance-badge ${
      new Date(asset.nextScheduledMaintenance) < new Date() ? 'overdue' : 'upcoming'
    }`}>
      {new Date(asset.nextScheduledMaintenance) < new Date() ? '⚠️ Overdue' : '📅 Due Soon'}
    </span>
  )}
</td>
```

### 2. Add Asset Age to Asset Detail

**File:** `frontend/src/pages/AssetDetail.tsx`

```typescript
function calculateAge(installationDate: Date): string {
  const years = (Date.now() - new Date(installationDate).getTime()) / (1000 * 60 * 60 * 24 * 365);
  return `${years.toFixed(1)} years`;
}

// Add to info card
<div className="info-row">
  <span className="label">Age:</span>
  <span className="value">{calculateAge(asset.metadata.installationDate)}</span>
</div>
```

### 3. Add Quick Stats Widget to Dashboard

**File:** `frontend/src/pages/Dashboard.tsx`

```typescript
const stats = {
  totalAssets: assets.length,
  activeAssets: assets.filter(a => a.status === 'active').length,
  maintenanceDue: assets.filter(a => 
    a.nextScheduledMaintenance && new Date(a.nextScheduledMaintenance) < new Date()
  ).length,
  highRiskAssets: assets.filter(a => (a.currentRiskScore || 0) > 60).length,
};

// Render stats cards
<div className="stats-grid">
  <StatCard title="Total Assets" value={stats.totalAssets} icon="📦" />
  <StatCard title="Maintenance Due" value={stats.maintenanceDue} icon="🔧" />
  <StatCard title="High Risk" value={stats.highRiskAssets} icon="⚠️" />
  <StatCard title="Active" value={stats.activeAssets} icon="✅" />
</div>
```

## 📚 Next Steps

1. **Start Database**: Ensure Docker is running and database is accessible
2. **Run Migration**: Execute `./scripts/run-migration.sh`
3. **Implement Services**: Start with maintenance service
4. **Create API Endpoints**: Add routes for maintenance management
5. **Build UI Components**: Create maintenance calendar and work order list
6. **Test Integration**: Verify end-to-end functionality
7. **Deploy**: Follow deployment guide for production

## 🆘 Troubleshooting

### Database Connection Issues
```bash
# Check if database is running
docker ps | grep timescaledb

# Restart database
docker-compose restart timescaledb

# Check logs
docker-compose logs timescaledb
```

### Migration Fails
```bash
# Rollback migration (if needed)
psql -h localhost -p 5433 -U postgres -d opssight -c "
  DROP TABLE IF EXISTS technicians CASCADE;
  DROP TABLE IF EXISTS maintenance_schedules CASCADE;
  -- ... drop other tables
"

# Re-run migration
./scripts/run-migration.sh
```

### Backend Won't Start
```bash
# Check for TypeScript errors
cd backend
npm run build

# Check dependencies
npm install

# Restart backend
npm run dev
```

## 📖 Documentation

- **Requirements**: `.kiro/specs/asset-management-phase1/requirements.md`
- **Database Schema**: `docker/migrations/001_asset_management_phase1.sql`
- **Feature Details**: `ASSET_MANAGEMENT_ENHANCEMENTS.md`
- **Roadmap**: `ASSET_FEATURES_ROADMAP.md`

---

**Ready to implement?** Start with Step 1 and work through each step sequentially!

