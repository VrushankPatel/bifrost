"""Configuration management for Bifrost backend."""

from pydantic_settings import BaseSettings
from typing import Literal


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Model Configuration
    model_provider: Literal["ollama", "lmstudio"] = "ollama"
    ollama_port: int = 11434
    lm_studio_port: int = 1234
    ollama_model: str = "llama3.2"
    lm_studio_model: str = "llama-3.2-3b-instruct"
    
    # Database
    database_url: str = "sqlite:///./bifrost.db"
    
    # Web Search
    web_search_enabled: bool = True
    max_search_results: int = 10
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    
    model_config = {"protected_namespaces": ()}


# Global settings instance
settings = Settings()
