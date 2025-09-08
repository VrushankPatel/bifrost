# Bifrost - Professional AI Assistant

A beautiful, modern ChatGPT-like interface built with React, TypeScript, and Tailwind CSS. Features dark/light mode, configurable backends (Ollama/LM Studio), conversation management, theming system, and a stunning glassmorphism design.

## 🚀 Features

- **Beautiful UI**: Modern, responsive design with glassmorphism effects and smooth animations
- **Dark/Light Mode**: Persistent theme switching with localStorage
- **Multiple Backends**: Support for Ollama and LM Studio with automatic fallback
- **Conversation Management**: Full CRUD operations for chat conversations
- **Theming System**: 6 accent color themes (Emerald, Blue, Purple, Amber, Rose, Indigo)
- **Web Search Toggle**: Enable/disable web search for queries with inline toggle
- **Configuration Management**: Backend and theme settings with cloud sync + local cache
- **Real-time Chat**: Smooth message bubbles with typing indicators
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + ShadCN UI + Custom Design System
- **State Management**: React Hooks + Custom Hooks
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Storage**: localStorage + Backend API integration

### Backend
- **Framework**: FastAPI + Uvicorn
- **Database**: SQLite + SQLAlchemy ORM
- **AI Integration**: Ollama + LM Studio
- **Web Search**: DuckDuckGo Search + Nomic Embeddings
- **Dependency Management**: UV (recommended) or pip

## 🔧 Installation & Setup

### Quick Start (Full Stack)

1. **Clone the repository:**
```bash
git clone <your-repo-url>
cd Bifrost
```

2. **Install AI Backend (Choose one):**

**Option A: Ollama (Recommended)**
```bash
# Install Ollama
brew install ollama  # macOS
# or curl -fsSL https://ollama.ai/install.sh | sh  # Linux

# Start Ollama server
ollama serve

# Pull required models (in another terminal)
ollama pull llama3.2
ollama pull nomic-embed-text
```

**Option B: LM Studio**
```bash
# Download from https://lmstudio.ai
# Install and start local server
lms server start
```

3. **Setup Backend:**
```bash
cd backend
uv pip install -r requirements.txt  # or pip install -r requirements.txt
python run.py
```

**Or use the automated setup:**
```bash
./setup.sh
```

4. **Setup Frontend:**
```bash
cd ../UI
npm install
npm run build
```

5. **Access the application:**
- Open http://localhost:8000 in your browser
- The backend serves both API and frontend

### Frontend Only Setup

1. **Clone and install dependencies:**
```bash
git clone <your-repo-url>
cd Bifrost/UI
npm install
```

2. **Start development server:**
```bash
npm run dev
```

3. **Build for production:**
```bash
npm run build
```

## 🎯 Backend Integration

Bifrost is designed to work with local AI backends and requires specific API endpoints for full functionality. The frontend automatically falls back to localStorage when the backend is unavailable.

### Critical Backend Implementation Requirements

**IMPORTANT**: The following API endpoints are REQUIRED for full functionality. The frontend expects these exact response formats and will gracefully degrade to localStorage if unavailable.

### Required Backend APIs

#### 1. Chat Completion Endpoint
**Purpose**: Process user messages and return AI responses

- **Ollama**: `POST http://localhost:11434/api/chat`
- **LM Studio**: `POST http://localhost:1234/v1/chat/completions`

**Request Payload:**
```json
{
  "conversationId": "string (optional for new conversations)",
  "query": "User's message text",
  "webSearchEnabled": true,
  "backend": {
    "type": "ollama",
    "port": 11434
  }
}
```

**Expected Response Format:**

**For Ollama:**
```json
{
  "conversationId": "conv_123",
  "message": {
    "role": "assistant",
    "content": "AI response here"
  },
  "done": true
}
```

**For LM Studio (OpenAI compatible):**
```json
{
  "conversationId": "conv_123",
  "choices": [{
    "message": {
      "role": "assistant", 
      "content": "AI response here"
    }
  }]
}
```

#### 2. Conversation Management APIs

**Get All Conversations**
- **Endpoint**: `GET /api/conversations`
- **Response**:
```json
{
  "conversations": [
    {
      "id": "conv_123",
      "title": "Neural Architecture Design",
      "timestamp": "2 hours ago",
      "preview": "Discussing optimal transformer architectures...",
      "messages": [
        {
          "id": "msg_456",
          "content": "Hello!",
          "role": "user",
          "timestamp": "2024-01-15T10:30:00Z"
        }
      ]
    }
  ]
}
```

**Create New Conversation**
- **Endpoint**: `POST /api/conversations`
- **Request**:
```json
{
  "id": "conv_123",
  "title": "New Conversation",
  "timestamp": "Just now",
  "preview": "New conversation started...",
  "messages": []
}
```
- **Response**: Same as request with server-generated ID

**Delete Conversation**
- **Endpoint**: `DELETE /api/conversations/{conversationId}`
- **Response**:
```json
{
  "success": true,
  "message": "Conversation deleted successfully"
}
```

#### 3. Configuration Management APIs

**Get User Configuration**
- **Endpoint**: `GET /api/config`
- **Headers**: `Authorization: Bearer <token>` (if authentication implemented)
- **Response**:
```json
{
  "backend": {
    "type": "ollama",
    "port": 11434
  },
  "theme": {
    "accentColor": "emerald"
  },
  "webSearchEnabled": false,
  "userId": "user-123",
  "lastUpdated": "2024-01-15T10:30:00Z"
}
```

**Update User Configuration**
- **Endpoint**: `PUT /api/config`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>` (if authentication implemented)
- **Request**: Same format as GET response
- **Request Example**:
```json
{
  "backend": {
    "type": "lmstudio",
    "port": 1234
  },
  "theme": {
    "accentColor": "blue"
  },
  "webSearchEnabled": true,
  "userId": "user-123",
  "timestamp": "2024-01-15T10:35:00Z"
}
```
- **Response**: 
```json
{
  "success": true,
  "config": {
    "backend": {
      "type": "lmstudio", 
      "port": 1234
    },
    "theme": {
      "accentColor": "blue"
    },
    "webSearchEnabled": true,
    "userId": "user-123",
    "lastUpdated": "2024-01-15T10:35:00Z"
  },
  "message": "Configuration updated successfully"
}
```

### Configuration Management Implementation Guide

#### 1. Database Schema for User Configurations

```sql
CREATE TABLE user_configs (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL UNIQUE,
  backend_type ENUM('ollama', 'lmstudio') DEFAULT 'ollama',
  backend_port INT DEFAULT 11434,
  accent_color VARCHAR(50) DEFAULT 'emerald',
  web_search_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id)
);
```

#### 2. Backend API Implementation Requirements

**GET /api/config Implementation:**
```javascript
// Express.js example
app.get('/api/config', async (req, res) => {
  try {
    const userId = req.user?.id || 'anonymous'; // From auth middleware
    
    const config = await db.query(
      'SELECT * FROM user_configs WHERE user_id = ?', 
      [userId]
    );
    
    if (!config) {
      // Return default configuration
      return res.json({
        backend: { type: 'ollama', port: 11434 },
        theme: { accentColor: 'emerald' },
        webSearchEnabled: false,
        userId: userId,
        lastUpdated: new Date().toISOString()
      });
    }
    
    res.json({
      backend: {
        type: config.backend_type,
        port: config.backend_port
      },
      theme: {
        accentColor: config.accent_color
      },
      webSearchEnabled: config.web_search_enabled,
      userId: config.user_id,
      lastUpdated: config.updated_at
    });
  } catch (error) {
    console.error('Config fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch configuration' });
  }
});
```

**PUT /api/config Implementation:**
```javascript
app.put('/api/config', async (req, res) => {
  try {
    const userId = req.user?.id || 'anonymous';
    const { backend, theme, webSearchEnabled } = req.body;
    
    // Validate input
    if (!backend?.type || !['ollama', 'lmstudio'].includes(backend.type)) {
      return res.status(400).json({ error: 'Invalid backend type' });
    }
    
    if (!theme?.accentColor || !['emerald', 'blue', 'purple', 'amber', 'rose', 'indigo'].includes(theme.accentColor)) {
      return res.status(400).json({ error: 'Invalid accent color' });
    }
    
    // Upsert configuration
    await db.query(`
      INSERT INTO user_configs (user_id, backend_type, backend_port, accent_color, web_search_enabled)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        backend_type = VALUES(backend_type),
        backend_port = VALUES(backend_port),
        accent_color = VALUES(accent_color),
        web_search_enabled = VALUES(web_search_enabled),
        updated_at = CURRENT_TIMESTAMP
    `, [userId, backend.type, backend.port, theme.accentColor, webSearchEnabled]);
    
    const updatedConfig = {
      backend,
      theme,
      webSearchEnabled,
      userId,
      lastUpdated: new Date().toISOString()
    };
    
    res.json({
      success: true,
      config: updatedConfig,
      message: 'Configuration updated successfully'
    });
    
  } catch (error) {
    console.error('Config update error:', error);
    res.status(500).json({ error: 'Failed to update configuration' });
  }
});
```

#### 3. Frontend Integration Points

The frontend automatically handles:
- **Immediate UI Updates**: Theme changes apply instantly to DOM
- **Optimistic Updates**: UI updates before backend confirmation
- **Graceful Degradation**: Falls back to localStorage if backend unavailable
- **Error Handling**: Shows appropriate toast notifications
- **Retry Logic**: Automatically retries failed requests

#### 4. Configuration Payload Structure

When users change settings, the frontend sends this payload:
```json
{
  "backend": {
    "type": "ollama|lmstudio",
    "port": 11434
  },
  "theme": {
    "accentColor": "emerald|blue|purple|amber|rose|indigo"
  },
  "webSearchEnabled": true|false,
  "userId": "user-123",
  "timestamp": "2024-01-15T10:35:00Z"
}
```

#### 5. Error Handling Requirements

**Backend must handle these error cases:**
- Invalid backend type (return 400)
- Invalid accent color (return 400) 
- Invalid port number (return 400)
- Database connection errors (return 500)
- Missing user authentication (return 401)
- Rate limiting (return 429)

**Expected error response format:**
```json
{
  "error": "Invalid backend type",
  "code": "INVALID_BACKEND_TYPE",
  "timestamp": "2024-01-15T10:35:00Z"
}
```

#### 6. Testing the Configuration API

**Test GET /api/config:**
```bash
curl -X GET http://localhost:3000/api/config \
  -H "Content-Type: application/json"
```

**Test PUT /api/config:**
```bash
curl -X PUT http://localhost:3000/api/config \
  -H "Content-Type: application/json" \
  -d '{
    "backend": {"type": "ollama", "port": 11434},
    "theme": {"accentColor": "blue"},
    "webSearchEnabled": true
  }'
```

### Backend Implementation Guide

#### For Ollama Integration:
1. Install Ollama: https://ollama.ai
2. Pull a model: `ollama pull llama2`
3. Start server: `ollama serve` (default port 11434)
4. Implement the required API endpoints above
5. Handle conversation persistence in your database
6. Implement web search integration when `webSearchEnabled: true`

#### For LM Studio Integration:
1. Download LM Studio: https://lmstudio.ai
2. Load a model in LM Studio
3. Start local server (default port 1234)
4. Create a wrapper API that implements the required endpoints
5. Convert between OpenAI format and Bifrost format

### Web Search Integration
When `webSearchEnabled: true` in the payload:
- Backend should perform web search before generating response
- Include search results in the context
- Cite sources in the response if applicable
- Popular options: Tavily API, SerpAPI, or custom web scraping

### Database Schema Recommendations

**Conversations Table:**
```sql
CREATE TABLE conversations (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  title VARCHAR(500) NOT NULL,
  preview TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Messages Table:**
```sql
CREATE TABLE messages (
  id VARCHAR(255) PRIMARY KEY,
  conversation_id VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  role ENUM('user', 'assistant') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);
```

**User Configurations Table:**
```sql
CREATE TABLE user_configs (
  user_id VARCHAR(255) PRIMARY KEY,
  backend_type ENUM('ollama', 'lmstudio') DEFAULT 'ollama',
  backend_port INT DEFAULT 11434,
  accent_color VARCHAR(50) DEFAULT 'emerald',
  web_search_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 🎨 Configuration & Theming

### Theme System
Bifrost includes a comprehensive theming system with 6 accent colors:

- **Emerald** (Default): Professional green theme
- **Blue**: Classic blue theme  
- **Purple**: Modern purple theme
- **Amber**: Warm amber theme
- **Rose**: Elegant rose theme
- **Indigo**: Deep indigo theme

### Configuration Storage
- **Primary**: Backend API (`/api/config`)
- **Fallback**: localStorage (`appConfig` key)
- **Legacy Support**: `backendConfig` key for backward compatibility

### Configuration Structure
```typescript
interface AppConfig {
  backend: {
    type: 'ollama' | 'lmstudio';
    port: number;
  };
  theme: {
    accentColor: 'emerald' | 'blue' | 'purple' | 'amber' | 'rose' | 'indigo';
  };
  webSearchEnabled: boolean;
}
```

## 🔗 API Integration Flow

### Frontend → Backend Communication:

1. **User sends message**:
   - Frontend creates payload with conversation context
   - Includes web search preference and backend config
   - Sends to appropriate backend endpoint

2. **Configuration sync**:
   - Settings saved to backend first
   - Cached in localStorage for offline access
   - Automatic fallback when backend unavailable

3. **Conversation management**:
   - CRUD operations sync with backend
   - Local state management for real-time UI updates
   - Optimistic updates with error handling

4. **Error handling**:
   - Graceful degradation when backend unavailable
   - Toast notifications for user feedback
   - Automatic retry mechanisms

### Error Handling:
The frontend expects standard HTTP status codes:
- `200`: Success
- `400`: Bad Request (invalid payload)
- `401`: Unauthorized (if auth implemented)
- `404`: Not Found (conversation/config not found)
- `500`: Server Error

## 🚀 Deployment

### Frontend Deployment

**Vercel/Netlify:**
1. Connect your repository
2. Build command: `npm run build`
3. Output directory: `dist`
4. Environment variables: None required (all config via UI)

**Docker:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 8080
CMD ["npm", "run", "preview"]
```

### Backend Deployment Considerations

1. **CORS Configuration**: Enable CORS for your frontend domain
2. **Rate Limiting**: Implement rate limiting for API endpoints
3. **Authentication**: Add user authentication if needed
4. **Database**: Set up persistent storage for conversations and configs
5. **Monitoring**: Add logging and monitoring for API endpoints
6. **Caching**: Implement Redis/Memcached for configuration caching

## 🔧 Development

### Project Structure
```
src/
├── components/          # React components
│   ├── ui/             # ShadCN UI components
│   ├── AppShell.tsx    # Main app layout
│   ├── ChatWindow.tsx  # Chat interface
│   ├── ChatInput.tsx   # Message input with web search toggle
│   ├── ConversationList.tsx # Sidebar with conversations
│   ├── ConfigPanel.tsx # Settings panel
│   └── ...
├── hooks/              # Custom React hooks
│   ├── useConversations.ts # Conversation management
│   ├── useAppConfig.ts     # Configuration management
│   └── use-toast.ts        # Toast notifications
├── types/              # TypeScript type definitions
├── lib/                # Utility functions
└── pages/              # Route components
```

### Key Hooks

**useConversations**: Manages conversation state and API calls
```typescript
const {
  conversations,
  activeConversation,
  createConversation,
  deleteConversation,
  switchConversation,
  addMessageToConversation
} = useConversations();
```

**useAppConfig**: Manages app configuration and theming
```typescript
const {
  config,
  updateTheme,
  updateBackend,
  toggleWebSearch
} = useAppConfig();
```

### Adding New Features

1. **New API Endpoint**: Update types in `src/types/index.ts`
2. **New Hook**: Create in `src/hooks/` following existing patterns
3. **New Component**: Add to `src/components/` with proper TypeScript
4. **New Theme**: Add color values to `src/index.css` accent themes
5. **Update Documentation**: Always update this README

### Code Style Guidelines
- Use TypeScript for all new code
- Follow existing component patterns
- Use semantic color tokens instead of hardcoded colors
- Implement proper error handling and loading states
- Add proper accessibility attributes
- Use Framer Motion for animations consistently

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes following the code style guidelines
4. Test thoroughly with both backend available and unavailable
5. Update documentation as needed
6. Submit a pull request

## 📝 License

MIT License - feel free to use this in your projects!

## 🔍 Troubleshooting

### Common Issues

**Backend Connection Failed**:
- Check if Ollama/LM Studio is running
- Verify port configuration in settings
- Check CORS settings on backend
- Review browser console for detailed errors

**Conversations Not Saving**:
- Verify backend `/api/conversations` endpoints
- Check database connectivity
- Review server logs for errors
- Ensure proper request/response formats

**Theme Not Applying**:
- Clear localStorage and refresh
- Check browser console for CSS errors
- Verify accent color value in configuration
- Ensure proper CSS custom property updates

**Web Search Not Working**:
- Verify backend implements web search integration
- Check API key configuration for search service
- Review search service rate limits
- Ensure proper error handling in backend

### Debug Mode
Enable debug logging by setting localStorage:
```javascript
localStorage.setItem('debug', 'true');
```

This will log all API calls, configuration changes, and state updates to the browser console.

---

**Note**: This is a frontend application that requires a compatible backend implementation. The frontend gracefully handles backend unavailability by falling back to localStorage for basic functionality.