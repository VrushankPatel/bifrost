#!/usr/bin/env python3
"""Startup script for Bifrost backend."""

import uvicorn
from config import settings

if __name__ == "__main__":
    print("🚀 Starting Bifrost Backend...")
    print(f"📡 Model Provider: {settings.model_provider}")
    print(f"🌐 Server: http://{settings.host}:{settings.port}")
    print(f"📚 API Docs: http://{settings.host}:{settings.port}/docs")
    print("=" * 50)
    
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=True,
        log_level="info"
    )
