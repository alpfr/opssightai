#!/bin/bash

# OpsSightAI Sample Data Generator
# Usage: ./generate-sample-data.sh [--days=N] [--assets=N]

set -e

echo "🚀 OpsSightAI Sample Data Generator"
echo "===================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if database is running
if ! docker ps | grep -q opssightai-timescaledb; then
    echo "⚠️  Database is not running. Starting Docker services..."
    docker-compose up -d
    echo "⏳ Waiting for database to be ready..."
    sleep 10
fi

# Check if backend dependencies are installed
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend
    npm install
    cd ..
fi

# Run the data generator
echo "📊 Generating sample data..."
cd backend
node ../scripts/generate-sample-data.js "$@"
cd ..

echo ""
echo "✅ Done! You can now access the application at http://localhost:4001"
