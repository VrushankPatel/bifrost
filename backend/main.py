"""Main FastAPI application for Bifrost backend."""

import os
import json
from typing import Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel

from config import settings
from database import get_db, create_tables
from models import Conversation, Message, UserConfig
from conversation_service import ConversationService, UserConfigService
from llm_connector import llm_connector
from web_search import web_search_service


# Pydantic models for API requests/responses
class ChatRequest(BaseModel):
    conversationId: Optional[str] = None
    query: str
    webSearchEnabled: bool = False
    backend: Dict[str, Any]
    model: Optional[str] = None


class ChatResponse(BaseModel):
    conversationId: str
    message: Dict[str, Any]
    done: bool


class ConversationResponse(BaseModel):
    id: str
    title: str
    timestamp: str
    preview: str
    messages: list


class ConversationsResponse(BaseModel):
    conversations: list[ConversationResponse]


class ConfigResponse(BaseModel):
    backend: Dict[str, Any]
    theme: Dict[str, Any]
    webSearchEnabled: bool
    userId: str
    lastUpdated: str


class HealthResponse(BaseModel):
    status: str
    model_provider: str
    backend_health: Dict[str, Any]


# Initialize FastAPI app
app = FastAPI(
    title="Bifrost Backend",
    description="AI Assistant Backend with Ollama/LM Studio support",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables on startup
@app.on_event("startup")
async def startup_event():
    create_tables()


# Health check endpoint
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Check backend health and model provider status."""
    backend_health = await llm_connector.check_health()
    
    return HealthResponse(
        status="healthy" if backend_health["status"] == "healthy" else "degraded",
        model_provider=settings.model_provider,
        backend_health=backend_health
    )

# Models endpoint
@app.get("/api/models")
async def get_models(provider: Optional[str] = None):
    """Get available models for the specified provider."""
    models = await llm_connector.get_available_models(provider)
    return {"models": models, "provider": provider or settings.model_provider}


# Chat endpoint
@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, db: Session = Depends(get_db)):
    """Process chat messages and return AI responses."""
    try:
        # Provider health and model availability pre-check
        provider = request.backend.get("type", settings.model_provider)
        backend_health = await llm_connector.check_health(provider)
        if backend_health.get("status") != "healthy":
            raise HTTPException(status_code=503, detail=f"{provider} backend not available")

        if request.model:
            models = await llm_connector.get_available_models(provider)
            if request.model not in models:
                raise HTTPException(status_code=400, detail=f"Model '{request.model}' not available for {provider}")
        conversation_service = ConversationService(db)
        
        # Get or create conversation
        if request.conversationId:
            conversation = conversation_service.get_conversation(request.conversationId)
            if not conversation:
                raise HTTPException(status_code=404, detail="Conversation not found")
        else:
            conversation = conversation_service.create_conversation()
        
        # Add user message
        user_message = conversation_service.add_message(
            conversation.id,
            request.query,
            "user"
        )
        
        # Get conversation history
        history = conversation_service.get_conversation_history(conversation.id)
        
        # Prepare prompt with web search context if enabled
        prompt = request.query
        if request.webSearchEnabled:
            search_results = await web_search_service.search_and_embed(request.query)
            if search_results["context"]:
                prompt = f"""Based on the following web search results, please answer the user's question:

{search_results["context"]}

User's question: {request.query}

Please provide a comprehensive answer based on the search results and your knowledge."""
        
        # Generate AI response
        llm_response = await llm_connector.generate_response(
            prompt=prompt,
            conversation_history=history[:-1],  # Exclude the current user message
            model_provider=provider,
            model_override=request.model
        )
        
        # Extract response content based on provider
        if request.backend.get("type") == "lmstudio":
            ai_content = llm_response["choices"][0]["message"]["content"]
        else:  # ollama
            ai_content = llm_response["message"]["content"]
        
        # Add AI message to conversation
        ai_message = conversation_service.add_message(
            conversation.id,
            ai_content,
            "assistant"
        )
        
        return ChatResponse(
            conversationId=conversation.id,
            message={
                "role": "assistant",
                "content": ai_content
            },
            done=True
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")


# Conversation management endpoints
@app.get("/api/conversations", response_model=ConversationsResponse)
async def get_conversations(db: Session = Depends(get_db)):
    """Get all conversations."""
    conversation_service = ConversationService(db)
    conversations = conversation_service.get_all_conversations()
    
    conversation_list = []
    for conv in conversations:
        messages = conversation_service.get_conversation_messages(conv.id)
        conversation_list.append(ConversationResponse(
            id=conv.id,
            title=conv.title,
            timestamp=conv.updated_at.strftime("%Y-%m-%dT%H:%M:%SZ"),
            preview=conv.preview or "",
            messages=[
                {
                    "id": msg.id,
                    "content": msg.content,
                    "role": msg.role,
                    "timestamp": msg.created_at.strftime("%Y-%m-%dT%H:%M:%SZ")
                }
                for msg in messages
            ]
        ))
    
    return ConversationsResponse(conversations=conversation_list)


@app.post("/api/conversations", response_model=ConversationResponse)
async def create_conversation(
    conversation: ConversationResponse,
    db: Session = Depends(get_db)
):
    """Create a new conversation."""
    conversation_service = ConversationService(db)
    
    new_conversation = conversation_service.create_conversation(conversation.title)
    
    return ConversationResponse(
        id=new_conversation.id,
        title=new_conversation.title,
        timestamp=new_conversation.created_at.strftime("%Y-%m-%dT%H:%M:%SZ"),
        preview=new_conversation.preview or "",
        messages=[]
    )


@app.delete("/api/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    db: Session = Depends(get_db)
):
    """Delete a conversation."""
    conversation_service = ConversationService(db)
    
    success = conversation_service.delete_conversation(conversation_id)
    if not success:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    return {"success": True, "message": "Conversation deleted successfully"}


# Configuration endpoints
@app.get("/api/config", response_model=ConfigResponse)
async def get_config(db: Session = Depends(get_db)):
    """Get user configuration."""
    config_service = UserConfigService(db)
    config = config_service.get_config()
    
    return ConfigResponse(
        backend={
            "type": config.backend_type,
            "port": config.backend_port
        },
        theme={
            "accentColor": config.accent_color
        },
        webSearchEnabled=config.web_search_enabled,
        userId=config.user_id,
        lastUpdated=config.updated_at.strftime("%Y-%m-%dT%H:%M:%SZ")
    )


@app.put("/api/config")
async def update_config(
    config_data: ConfigResponse,
    db: Session = Depends(get_db)
):
    """Update user configuration."""
    config_service = UserConfigService(db)
    
    # Convert to dict for update
    update_data = {
        "backend_type": config_data.backend["type"],
        "backend_port": config_data.backend["port"],
        "accent_color": config_data.theme["accentColor"],
        "web_search_enabled": config_data.webSearchEnabled
    }
    
    updated_config = config_service.update_config(config_data.userId, update_data)
    
    return {
        "success": True,
        "config": {
            "backend": {
                "type": updated_config.backend_type,
                "port": updated_config.backend_port
            },
            "theme": {
                "accentColor": updated_config.accent_color
            },
            "webSearchEnabled": updated_config.web_search_enabled,
            "userId": updated_config.user_id,
            "lastUpdated": updated_config.updated_at.strftime("%Y-%m-%dT%H:%M:%SZ")
        },
        "message": "Configuration updated successfully"
    }


# Serve static files (frontend)
# Check if UI build directory exists
ui_build_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "UI", "dist")
if os.path.exists(ui_build_path):
    # Mount static files
    app.mount("/static", StaticFiles(directory=ui_build_path), name="static")
    
    # Serve the frontend application
    @app.get("/")
    async def serve_frontend():
        """Serve the frontend application."""
        return FileResponse(os.path.join(ui_build_path, "index.html"))
    
    @app.get("/{path:path}")
    async def serve_frontend_files(path: str):
        """Serve frontend files and handle SPA routing."""
        # Skip API routes
        if path.startswith(("api/", "health", "chat", "docs")):
            return {"error": "Not found"}
        
        # Try to serve the specific file
        file_path = os.path.join(ui_build_path, path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        
        # For SPA routing, serve index.html for all other routes
        return FileResponse(os.path.join(ui_build_path, "index.html"))
else:
    @app.get("/")
    async def root():
        """Root endpoint when frontend is not built."""
        return {
            "message": "Bifrost Backend is running",
            "frontend": "Please build the frontend with 'npm run build' in the UI directory",
            "docs": "/docs"
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=True
    )
