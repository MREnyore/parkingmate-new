#!/bin/bash

# Azure Web App Startup Script for ParkingMate

echo "Starting ParkingMate API..."

# Navigate to the API directory
cd /home/site/wwwroot/apps/api || exit 1

# Check if the dist folder exists
if [ ! -d "dist" ]; then
    echo "Error: dist folder not found at $(pwd)/dist"
    echo "Contents of $(pwd):"
    ls -la
    exit 1
fi

# Check if index.js exists
if [ ! -f "dist/index.js" ]; then
    echo "Error: dist/index.js not found"
    echo "Contents of dist/:"
    ls -la dist/
    exit 1
fi

# Start the Node.js application
echo "Starting Fastify API server..."
echo "Working directory: $(pwd)"
echo "Node version: $(node --version)"
node dist/index.js
