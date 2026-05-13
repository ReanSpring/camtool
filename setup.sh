#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting CamTools Easy Setup..."

# Check if Docker is installed
if ! [ -x "$(command -v docker)" ]; then
  echo '❌ Error: Docker is not installed. Please install Docker first.' >&2
  exit 1
fi

# Create necessary directories if they don't exist
echo "📁 Creating local storage directories..."
mkdir -p server/uploads server/output

# Check for .env files
if [ ! -f server/.env ]; then
  echo "📝 Creating default server .env..."
  cp server/.env.example server/.env || echo "PORT=5001" > server/.env
fi

# Build and start the containers
echo "Building and starting containers (this may take a few minutes)..."
docker-compose up --build -d

echo "✅ Setup complete!"
echo "🌐 Frontend is running on http://localhost"
echo "🔌 Backend API is running on http://localhost/api"
echo "💡 Use 'docker-compose logs -f' to see the output."
