#!/bin/bash

# Sermon Slicer - Production Deployment Script
# This script builds and deploys the application using Docker Compose

set -e  # Exit on error

echo "🚀 Starting Sermon Slicer deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create .env file with required environment variables."
    echo "See .env.example for template."
    exit 1
fi

# Check if OPENAI_API_KEY is set
if ! grep -q "OPENAI_API_KEY=sk-" .env; then
    echo "⚠️  Warning: OPENAI_API_KEY not properly configured in .env"
    echo "Please ensure your OpenAI API key is set correctly."
fi

echo "📦 Building frontend..."
cd client
npm run build
cd ..

echo "🐳 Building and starting Docker container..."
docker-compose up -d --build

echo "⏳ Waiting for application to start..."
sleep 5

# Check if container is healthy
if docker-compose ps | grep -q "healthy"; then
    echo "✅ Deployment successful!"
    echo "📊 Application is running at http://localhost:7001"
    echo ""
    echo "View logs: docker-compose logs -f"
    echo "Stop app: docker-compose down"
else
    echo "⚠️  Container started but health check pending..."
    echo "Check status: docker-compose ps"
    echo "View logs: docker-compose logs"
fi
