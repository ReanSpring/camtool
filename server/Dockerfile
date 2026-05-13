# Use Node.js as the base image
FROM node:20-slim

# Install system dependencies: Python, LibreOffice, and libraries for canvas/sharp
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    libreoffice \
    libvips-dev \
    build-essential \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy package files and install Node dependencies
COPY package*.json ./
RUN npm install

# Copy Python requirements and install them
COPY requirements.txt ./
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy the rest of the server code
COPY . .

# Create necessary directories
RUN mkdir -p uploads output profiles

# Expose the server port
EXPOSE 5001

# Start the server
CMD ["node", "index.js"]
