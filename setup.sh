#!/bin/bash

# Bifrost Setup Script
# This script sets up the complete Bifrost AI Assistant stack

set -e

echo "🚀 Bifrost AI Assistant Setup"
echo "=============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "README.md" ] || [ ! -d "UI" ] || [ ! -d "backend" ]; then
    print_error "Please run this script from the Bifrost root directory"
    exit 1
fi

print_status "Starting Bifrost setup..."

# Step 1: Check for required tools
print_status "Checking system requirements..."

# Check for Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check for Python
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

# Check for Ollama (optional)
if ! command -v ollama &> /dev/null; then
    print_warning "Ollama is not installed. You can install it later with:"
    echo "  macOS: brew install ollama"
    echo "  Linux: curl -fsSL https://ollama.ai/install.sh | sh"
    echo "  Windows: Download from https://ollama.ai/download"
    echo ""
fi

print_success "System requirements check completed"

# Step 2: Setup Backend
print_status "Setting up backend..."

cd backend

# Install Python dependencies
if command -v uv &> /dev/null; then
    print_status "Installing Python dependencies with UV..."
    # Create virtual environment if it doesn't exist
    if [ ! -d ".venv" ] && [ ! -d "venv" ]; then
        print_status "Creating virtual environment..."
        uv venv
    fi
    # Activate virtual environment and install dependencies
    if [ -d ".venv" ]; then
        source .venv/bin/activate
    else
        source venv/bin/activate
    fi
    uv pip install -r requirements.txt
else
    print_status "Installing Python dependencies with pip..."
    # Create virtual environment if it doesn't exist
    if [ ! -d "venv" ]; then
        print_status "Creating virtual environment..."
        python3 -m venv venv
    fi
    # Activate virtual environment and install dependencies
    source venv/bin/activate
    pip install -r requirements.txt
fi

print_success "Backend dependencies installed"

# Step 3: Setup Frontend
print_status "Setting up frontend..."

cd ../UI

# Install Node.js dependencies
print_status "Installing Node.js dependencies..."
npm install

# Build frontend
print_status "Building frontend..."
npm run build

print_success "Frontend built successfully"

# Step 4: Create startup scripts
print_status "Creating startup scripts..."

cd ..

# Create start script
cat > start.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting Bifrost AI Assistant"
echo "================================"

# Check if Ollama is running
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "⚠️  Ollama is not running. Starting Ollama..."
    echo "   Please run 'ollama serve' in another terminal"
    echo "   Or install Ollama: https://ollama.ai"
    echo ""
fi

# Start backend
echo "🔧 Starting backend server..."
cd backend

# Activate virtual environment if it exists
if [ -d ".venv" ]; then
    source .venv/bin/activate
elif [ -d "venv" ]; then
    source venv/bin/activate
fi

python run.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

echo ""
echo "✅ Bifrost is running!"
echo "🌐 Open http://localhost:8000 in your browser"
echo "📚 API docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user to stop
wait $BACKEND_PID
EOF

chmod +x start.sh

print_success "Startup script created: ./start.sh"

# Step 5: Final instructions
echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Install and start Ollama (if not already done):"
echo "   ollama serve"
echo "   ollama pull llama3.2"
echo "   ollama pull nomic-embed-text"
echo ""
echo "2. Start Bifrost:"
echo "   ./start.sh"
echo ""
echo "3. Or start manually:"
echo "   cd backend"
echo "   source .venv/bin/activate  # if using UV virtual environment"
echo "   # or source venv/bin/activate  # if using pip virtual environment"
echo "   python run.py"
echo ""
echo "4. Open http://localhost:8000 in your browser"
echo ""
echo "🔧 Configuration:"
echo "   - Backend config: backend/.env"
echo "   - Frontend config: UI/src/hooks/useAppConfig.ts"
echo ""
echo "📚 Documentation:"
echo "   - Main README: README.md"
echo "   - Backend README: backend/README.md"
echo "   - API docs: http://localhost:8000/docs (when running)"
echo ""
print_success "Bifrost setup completed! 🎉"
