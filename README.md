# CamTools - Online Utility Tools

CamTools is a modern, responsive web application that provides simple and secure online utility tools. The first tool available is a high-quality Word to PDF converter.

## Features

- **Word to PDF Converter**: Support for `.doc` and `.docx` files.
- **Modern UI**: Built with React and Tailwind CSS, featuring a clean card-style layout.
- **Responsive Design**: Works perfectly on mobile, tablet, and desktop.
- **Dark Mode**: Supports system preferences and manual toggle.
- **Secure**: Files are processed and deleted immediately after conversion.
- **Drag-and-Drop**: Easy file upload with progress tracking.
- **Fast Performance**: Optimized for speed and smooth transitions.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Framer Motion, Lucide React.
- **Backend**: Node.js, Express, Multer, LibreOffice-convert.

## Installation

### Prerequisites

- Node.js (v16 or higher)
- LibreOffice (Required for Word to PDF conversion)
  - **Mac**: `brew install --cask libreoffice`
  - **Ubuntu/Debian**: `sudo apt install libreoffice`
  - **Windows**: Download and install from [libreoffice.org](https://www.libreoffice.org/)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd camtool
   ```

2. **Frontend Setup**
   ```bash
   cd client
   npm install
   npm run dev
   ```

3. **Backend Setup**
   ```bash
   cd ../server
   npm install
   node index.js
   ```

## Deployment

### Easy Setup (Docker)

The easiest way to deploy CamTools is using Docker. This ensures all system dependencies (Python, LibreOffice, Node.js) are correctly installed.

1. **Prerequisites**: [Install Docker](https://docs.docker.com/get-docker/) and Docker Compose.
2. **Run Setup**:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```
3. **Access**:
   - Frontend: `http://localhost`
   - Backend API: `http://localhost/api`

### Frontend (Vercel)

1. Push your code to GitHub.
2. Connect your repository to Vercel.
3. Set the build command to `npm run build` and output directory to `dist`.
4. Add environment variables if necessary.

### Backend (Render)

1. Create a new Web Service on Render.
2. Use the `server` directory as the root.
3. Set the build command to `npm install`.
4. Set the start command to `node index.js`.
5. **Crucial**: You must add a LibreOffice buildpack or use a Docker container that includes LibreOffice. Render supports Docker out of the box.

## License

© 2026 CamTools. All rights reserved.
