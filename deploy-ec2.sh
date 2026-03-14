#!/bin/bash

# DevPulse AI - EC2 Deployment Script
# This script upgrades Node.js and deploys the latest version

set -e

echo "================================"
echo "DevPulse AI Deployment Script"
echo "================================"

# Step 1: Upgrade Node.js to version 20
echo ""
echo "Step 1: Checking Node.js version..."
CURRENT_NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)

if [ "$CURRENT_NODE_VERSION" -lt 20 ]; then
    echo "Current Node.js version: $(node -v)"
    echo "Upgrading to Node.js 20.x LTS..."

    # Install Node Version Manager (nvm) if not already installed
    if [ ! -d "$HOME/.nvm" ]; then
        echo "Installing NVM..."
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    else
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    fi

    # Install and use Node.js 20
    nvm install 20
    nvm use 20
    nvm alias default 20

    echo "Node.js upgraded to: $(node -v)"
else
    echo "Node.js version is sufficient: $(node -v)"
fi

# Step 2: Navigate to app directory
echo ""
echo "Step 2: Navigating to app directory..."
cd ~/app

# Step 3: Pull latest code from GitHub
echo ""
echo "Step 3: Pulling latest code from GitHub..."
git fetch origin
git reset --hard origin/main
echo "Latest code pulled successfully!"

# Step 4: Install dependencies
echo ""
echo "Step 4: Installing dependencies..."
npm ci --legacy-peer-deps

# Step 5: Build the application
echo ""
echo "Step 5: Building Next.js application..."
npm run build

# Step 6: Restart the application with PM2
echo ""
echo "Step 6: Restarting application..."

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
fi

# Stop existing process if running
pm2 delete devpulse-ai 2>/dev/null || true

# Start the application
pm2 start npm --name "devpulse-ai" -- start
pm2 save
pm2 startup

echo ""
echo "================================"
echo "Deployment Complete!"
echo "================================"
echo ""
echo "Application is running on port 3000"
echo "Access it at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3000"
echo ""
echo "Useful PM2 commands:"
echo "  pm2 logs devpulse-ai  - View logs"
echo "  pm2 restart devpulse-ai  - Restart app"
echo "  pm2 stop devpulse-ai  - Stop app"
echo ""
