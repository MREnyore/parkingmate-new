#!/bin/bash

# Azure Web App Startup Script for ParkingMate

echo "Starting ParkingMate API..."

# Navigate to the root directory
cd /home/site/wwwroot

# Install dependencies if node_modules doesn't exist
# (node_modules is excluded from deployment as per rsync logs)
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies with pnpm..."
    npm install -g pnpm@9.15.0
    pnpm install --frozen-lockfile --prod
fi

# Navigate to the API directory
cd /home/site/wwwroot/apps/api

# Check if the dist folder exists
if [ ! -d "dist" ]; then
    echo "Error: dist folder not found. Build may have failed."
    exit 1
fi

# Start the Node.js application
echo "Starting Node.js application..."
node dist/index.js
