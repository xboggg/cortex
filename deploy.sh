#!/bin/bash
# Cortex Deployment Script
# Run this on the server to deploy Cortex

set -e

DEPLOY_DIR="/var/www/cortex"
REPO_URL="git@github.com:xboggg/cortex.git"

echo "=== Cortex Deployment ==="

# Create directory if it doesn't exist
if [ ! -d "$DEPLOY_DIR" ]; then
    echo "Creating deployment directory..."
    mkdir -p "$DEPLOY_DIR"
fi

cd "$DEPLOY_DIR"

# If .git exists, pull; otherwise, clone
if [ -d ".git" ]; then
    echo "Pulling latest changes..."
    git pull origin main
else
    echo "Cloning repository..."
    git clone "$REPO_URL" .
fi

# Install frontend dependencies and build
echo "Installing frontend dependencies..."
npm install

echo "Building frontend..."
npm run build

# Setup server directory
mkdir -p server

# Make API executable
chmod +x server/api.py

# Install systemd service
echo "Installing systemd service..."
cp server/cortex-api.service /etc/systemd/system/cortex-api.service
systemctl daemon-reload
systemctl enable cortex-api
systemctl restart cortex-api

# Configure Nginx
echo "Configuring Nginx..."
cat > /etc/nginx/sites-available/cortex << 'EOF'
server {
    listen 8080;
    server_name cortex.internal;

    # Serve static frontend
    location / {
        root /var/www/cortex/dist;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to Python backend
    location /api/ {
        proxy_pass http://127.0.0.1:3500;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Proxy Netdata requests
    location /netdata/ {
        proxy_pass http://127.0.0.1:19999/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF

# Enable site if not already enabled
if [ ! -L /etc/nginx/sites-enabled/cortex ]; then
    ln -s /etc/nginx/sites-available/cortex /etc/nginx/sites-enabled/cortex
fi

# Test and reload Nginx
nginx -t && systemctl reload nginx

echo ""
echo "=== Deployment Complete ==="
echo "Cortex is now running!"
echo ""
echo "Access points:"
echo "  - Dashboard: http://$(hostname -I | awk '{print $1}'):8080"
echo "  - Netdata:   http://$(hostname -I | awk '{print $1}'):19999"
echo "  - API:       http://$(hostname -I | awk '{print $1}'):3500"
echo ""
echo "Services:"
echo "  - cortex-api: $(systemctl is-active cortex-api)"
echo "  - netdata:    $(systemctl is-active netdata)"
echo "  - nginx:      $(systemctl is-active nginx)"
