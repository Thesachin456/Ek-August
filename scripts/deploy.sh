#!/bin/bash

echo "🚀 Ek-August Chat Deployment Script"
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing server dependencies..."
npm install

echo "📦 Installing client dependencies..."
npm run install-client

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cat > .env << EOF
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/ek-august-chat

# JWT Secret (change in production)
JWT_SECRET=ek-august-chat-secret-key-$(openssl rand -hex 32)

# Client URL
CLIENT_URL=http://localhost:3000

# File Upload
MAX_FILE_SIZE=10485760
EOF
    echo "✅ Created .env file with default configuration"
    echo "⚠️  Please update MONGODB_URI if using a different database"
fi

# Check if client .env file exists
if [ ! -f "client/.env" ]; then
    echo "⚠️  client/.env file not found. Creating from template..."
    cat > client/.env << EOF
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
EOF
    echo "✅ Created client/.env file"
fi

# Build client for production
echo "🏗️  Building client application..."
npm run build

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the application:"
echo "  Development: npm run dev"
echo "  Production:  npm start"
echo ""
echo "Make sure MongoDB is running before starting the application."
echo "Default MongoDB connection: mongodb://localhost:27017/ek-august-chat"
echo ""
echo "Application will be available at:"
echo "  Frontend: http://localhost:3000 (development)"
echo "  Backend:  http://localhost:5000"
echo ""
echo "For deployment on Render:"
echo "1. Push to GitHub repository"
echo "2. Connect repository to Render"
echo "3. Set environment variables"
echo "4. Deploy!"
echo ""
echo "📚 See README.md for detailed documentation"