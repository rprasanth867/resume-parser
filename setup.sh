#!/bin/bash

# Resume Parser - Quick Start Script
# This script helps you set up the application quickly

echo "🚀 Resume Parser - Quick Start Setup"
echo "===================================="
echo ""

# Check if Docker is installed
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    echo "✅ Docker and Docker Compose found"
    echo ""
    echo "Choose setup method:"
    echo "1) Docker (Recommended - Easiest)"
    echo "2) Manual Setup"
    read -p "Enter choice (1 or 2): " choice
    
    if [ "$choice" = "1" ]; then
        echo ""
        echo "🐳 Starting with Docker..."
        docker-compose up -d
        echo ""
        echo "✅ Application started!"
        echo ""
        echo "Access the application at:"
        echo "  Frontend: http://localhost:3000"
        echo "  Backend API: http://localhost:5000"
        echo ""
        echo "To stop: docker-compose down"
        exit 0
    fi
fi

# Manual setup
echo ""
echo "📦 Manual Setup"
echo "==============="
echo ""

# Backend setup
echo "Setting up Backend..."
cd backend

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Downloading spaCy model..."
python -m spacy download en_core_web_sm

if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANT: Edit backend/.env and configure your MySQL database"
    echo "   DATABASE_URL=mysql+pymysql://resume_user:resume_pass@localhost:3306/resume_parser"
    echo ""
    read -p "Press Enter after configuring .env file..."
fi

echo "Initializing database..."
export FLASK_APP=run.py
flask db init 2>/dev/null || true
flask db migrate -m "Initial migration" 2>/dev/null || true
flask db upgrade

echo ""
echo "✅ Backend setup complete!"
echo ""

# Frontend setup
cd ../frontend

echo "Setting up Frontend..."

if [ ! -d "node_modules" ]; then
    echo "Installing Node dependencies..."
    npm install
fi

if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
fi

echo ""
echo "✅ Frontend setup complete!"
echo ""

# Instructions
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "To start the application:"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  python run.py"
echo ""
echo "Terminal 2 (Frontend):"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "Then access:"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:5000"
echo ""
echo "📖 For more details, see README.md"
