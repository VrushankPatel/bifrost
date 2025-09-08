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
sleep 2

# Verify backend port is available and server is listening
if lsof -i :8000 -sTCP:LISTEN >/dev/null 2>&1; then
  START_OK=1
else
  echo "❌ Backend failed to start on port 8000 (address in use or crash)."
  echo "   Tip: Free the port with: kill -9 $(lsof -ti :8000)"
  echo "   Logs above should show the reason (e.g., 'Address already in use')."
  exit 1
fi

echo ""
echo "✅ Bifrost is running!"
echo "🌐 Open http://localhost:8000 in your browser"
echo "📚 API docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user to stop
wait $BACKEND_PID
