#!/bin/bash

# Quick deployment script (assumes Node.js 20+ is already installed)

set -e

echo "Quick Deploy - DevPulse AI"
echo "=========================="

cd ~/app

echo "→ Pulling latest code..."
git fetch origin
git reset --hard origin/main

echo "→ Installing dependencies..."
npm ci --legacy-peer-deps

echo "→ Building application..."
npm run build

echo "→ Restarting with PM2..."
pm2 restart devpulse-ai || pm2 start npm --name "devpulse-ai" -- start

echo "✓ Deployment complete!"
pm2 logs devpulse-ai --lines 20
