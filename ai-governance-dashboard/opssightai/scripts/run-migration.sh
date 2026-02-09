#!/bin/bash

# OpsSightAI Database Migration Runner
# Usage: ./scripts/run-migration.sh [migration_file]

set -e

# Configuration
DB_HOST=${DATABASE_HOST:-localhost}
DB_PORT=${DATABASE_PORT:-5433}
DB_NAME=${DATABASE_NAME:-opssight}
DB_USER=${DATABASE_USER:-postgres}
DB_PASSWORD=${DATABASE_PASSWORD:-postgres}

MIGRATION_FILE=${1:-"docker/migrations/001_asset_management_phase1.sql"}

echo "🔄 Running OpsSightAI Database Migration"
echo "========================================"
echo "Database: $DB_NAME@$DB_HOST:$DB_PORT"
echo "Migration: $MIGRATION_FILE"
echo ""

# Check if migration file exists
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Migration file not found: $MIGRATION_FILE"
    exit 1
fi

# Check if database is accessible
if ! PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1" > /dev/null 2>&1; then
    echo "❌ Cannot connect to database. Is it running?"
    echo "   Try: docker-compose up -d"
    exit 1
fi

# Run migration
echo "📊 Applying migration..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $MIGRATION_FILE

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration completed successfully!"
    echo ""
    echo "📋 Verifying new tables..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN (
            'technicians', 
            'maintenance_schedules', 
            'work_orders', 
            'maintenance_history',
            'maintenance_recommendations',
            'uptime_events',
            'asset_metrics',
            'asset_kpis',
            'asset_relationships',
            'asset_groups',
            'asset_group_members'
        )
        ORDER BY table_name;
    "
    echo ""
    echo "🎉 All tables created successfully!"
else
    echo ""
    echo "❌ Migration failed!"
    exit 1
fi
