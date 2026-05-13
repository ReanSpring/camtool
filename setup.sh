#!/bin/bash

# Exit on error
set -e

DOMAIN="camtool.site"
EMAIL="camtool@gmail.com"

echo "🚀 Starting CamTools SSL Setup for $DOMAIN..."

# Check if Docker is installed
if ! [ -x "$(command -v docker)" ]; then
  echo '❌ Error: Docker is not installed. Please install Docker first.' >&2
  exit 1
fi

# Determine docker command
if docker compose version >/dev/null 2>&1; then
  DOCKER_CMD="docker compose"
else
  DOCKER_CMD="docker-compose"
fi

# Create necessary directories
echo "📁 Creating storage and SSL directories..."
mkdir -p server/uploads server/output certbot/conf certbot/www

# Check for .env files
if [ ! -f server/.env ]; then
  echo "📝 Creating default server .env..."
  cp server/.env.example server/.env || echo "PORT=5001" > server/.env
fi

# Initial run to get SSL certificate if it doesn't exist
if [ ! -d "certbot/conf/live/$DOMAIN" ]; then
  echo "🔒 Initial SSL Certificate Request..."
  
  # 1. Start a temporary webserver to handle the challenge
  echo "Starting temporary webserver on port 3000..."
  docker run --rm -d \
    -p 3000:80 \
    -v $(pwd)/certbot/www:/var/www/certbot \
    --name temp_webserver \
    nginx:alpine

  # 2. Run Certbot to get the certificate
  echo "Requesting certificate from Let's Encrypt..."
  docker run --rm \
    -v $(pwd)/certbot/conf:/etc/letsencrypt \
    -v $(pwd)/certbot/www:/var/www/certbot \
    certbot/certbot certonly --webroot -w /var/www/certbot \
    -d $DOMAIN --email $EMAIL --agree-tos --no-eff-email --non-interactive

  # 3. Stop temporary webserver
  docker stop temp_webserver
fi

# Build and start the full stack
echo "🏗️ Building and starting the full stack..."
$DOCKER_CMD up --build -d

echo "✅ Setup complete!"
echo "🌐 Your website is available at http://$DOMAIN:3000 (or https://$DOMAIN:3443)"
echo "🔌 Backend API is running on http://$DOMAIN:3000/api"
