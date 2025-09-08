# Bifrost Backend

A FastAPI-based backend for the Bifrost AI Assistant, supporting both Ollama and LM Studio with web search capabilities.

## 🚀 Features

- **Unified LLM Support**: Seamless integration with both Ollama and LM Studio
- **Web Search Integration**: DuckDuckGo search with embeddings using Nomic
- **Conversation Management**: SQLite-based persistence for chat history
- **Configuration Management**: Dynamic backend and theme configuration
- **Frontend Serving**: Serves the built React frontend
- **Health Monitoring**: Backend and model provider health checks

## 🛠 Tech Stack

- **Framework**: FastAPI + Uvicorn
- **Database**: SQLite with SQLAlchemy ORM
- **AI Models**: Ollama + LM Studio integration
- **Web Search**: DuckDuckGo Search + Nomic Embeddings
- **Dependency Management**: UV (recommended) or pip

## 📋 Prerequisites

### 1. Install Ollama (Recommended)
```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Windows
# Download from https://ollama.ai/download
```

### 2. Install LM Studio (Alternative)
- Download from [LM Studio](https://lmstudio.ai)
- Install and start the local server

### 3. Install Python Dependencies
```bash
# Using UV (recommended)
uv pip install -r requirements.txt

# Or using pip
pip install -r requirements.txt
```

## 🔧 Setup & Installation

### 1. Clone and Navigate
```bash
cd /path/to/Bifrost/backend
```

### 2. Install Dependencies
```bash
# Using UV (recommended)
uv pip install -r requirements.txt

# Or using pip
pip install -r requirements.txt
```

### 3. Configure Environment
Edit `.env` file to customize settings:
```env
MODEL_PROVIDER=ollama          # or lmstudio
OLLAMA_PORT=11434
LM_STUDIO_PORT=1234
OLLAMA_MODEL=llama3.2
LM_STUDIO_MODEL=llama-3.2-3b-instruct
```

### 4. Start AI Backend
Choose one of the following:

**Option A: Ollama (Recommended)**
```bash
# Start Ollama server
ollama serve

# Pull a model (in another terminal)
ollama pull llama3.2
ollama pull nomic-embed-text  # For embeddings
```

**Option B: LM Studio**
```bash
# Start LM Studio server
lms server start
```

### 5. Start Bifrost Backend
```bash
# Using the startup script
python run.py

# Or directly with uvicorn
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 6. Build and Serve Frontend
```bash
# In another terminal, navigate to UI directory
cd ../UI

# Install dependencies
npm install

# Build the frontend
npm run build
```

## 🌐 API Endpoints

### Chat
- **POST** `/chat` - Process chat messages
- **Request**: `{conversationId?, query, webSearchEnabled, backend}`
- **Response**: `{conversationId, message, done}`

### Conversations
- **GET** `/api/conversations` - Get all conversations
- **POST** `/api/conversations` - Create new conversation
- **DELETE** `/api/conversations/{id}` - Delete conversation

### Configuration
- **GET** `/api/config` - Get user configuration
- **PUT** `/api/config` - Update user configuration

### Health
- **GET** `/health` - Backend and model health status

## 🔍 Web Search Integration

When `webSearchEnabled` is true:
1. Performs DuckDuckGo search for the query
2. Extracts top 10 results
3. Generates embeddings using Nomic model via Ollama
4. Augments the prompt with search context
5. Sends enhanced prompt to the LLM

## 🗄️ Database Schema

### Conversations Table
```sql
CREATE TABLE conversations (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    preview TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Messages Table
```sql
CREATE TABLE messages (
    id VARCHAR(255) PRIMARY KEY,
    conversation_id VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
);
```

### User Configs Table
```sql
CREATE TABLE user_configs (
    user_id VARCHAR(255) PRIMARY KEY,
    backend_type VARCHAR(20) DEFAULT 'ollama',
    backend_port INTEGER DEFAULT 11434,
    accent_color VARCHAR(50) DEFAULT 'emerald',
    web_search_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 Development

### Running in Development Mode
```bash
# Option 1: Use the automated setup
./setup.sh

# Option 2: Manual setup
# Terminal 1: Start AI backend
ollama serve

# Terminal 2: Start Bifrost backend
cd backend
source .venv/bin/activate  # or source venv/bin/activate
python run.py

# Terminal 3: Start frontend dev server (optional)
cd ../UI && npm run dev
```

### Testing the API
```bash
# Health check
curl http://localhost:8000/health

# Test chat
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Hello, how are you?",
    "webSearchEnabled": false,
    "backend": {"type": "ollama", "port": 11434}
  }'
```

## 🐛 Troubleshooting

### Common Issues

**1. Ollama Connection Failed**
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Start Ollama if not running
ollama serve
```

**2. LM Studio Connection Failed**
```bash
# Check if LM Studio is running
curl http://localhost:1234/v1/models

# Start LM Studio server
lms server start
```

**3. Model Not Found**
```bash
# List available models
ollama list

# Pull required model
ollama pull llama3.2
ollama pull nomic-embed-text
```

**4. Database Issues**
```bash
# Delete database to reset
rm bifrost.db

# Restart backend to recreate tables
python run.py
```

**5. Frontend Not Loading**
```bash
# Build frontend
cd ../UI && npm run build

# Check if dist folder exists
ls -la ../UI/dist
```

## 📝 Configuration Options

### Environment Variables
- `MODEL_PROVIDER`: `ollama` or `lmstudio`
- `OLLAMA_PORT`: Ollama server port (default: 11434)
- `LM_STUDIO_PORT`: LM Studio server port (default: 1234)
- `OLLAMA_MODEL`: Ollama model name (default: llama3.2)
- `LM_STUDIO_MODEL`: LM Studio model name
- `WEB_SEARCH_ENABLED`: Enable web search by default
- `MAX_SEARCH_RESULTS`: Maximum search results (default: 10)

### Model Configuration
- **Ollama**: Uses `/api/chat` endpoint with streaming support
- **LM Studio**: Uses `/v1/chat/completions` (OpenAI compatible)
- **Embeddings**: Uses `nomic-embed-text` model via Ollama

## 🔒 Security Notes

- CORS is enabled for all origins (configure for production)
- No authentication implemented (add as needed)
- Database is SQLite (consider PostgreSQL for production)
- Web search results are not filtered (add content filtering if needed)

## 📊 Performance

- **Response Time**: ~2-5 seconds for typical queries
- **Web Search**: +1-3 seconds when enabled
- **Database**: SQLite handles thousands of conversations efficiently
- **Memory**: ~200-500MB depending on model size

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with both Ollama and LM Studio
5. Submit a pull request

## 📄 License

MIT License - see main project README for details.
