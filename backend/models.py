"""Database models for Bifrost backend."""

from sqlalchemy import Column, String, Text, DateTime, Boolean, Integer, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
from typing import Optional

Base = declarative_base()


class Conversation(Base):
    """Conversation model for storing chat conversations."""
    
    __tablename__ = "conversations"
    
    id = Column(String(255), primary_key=True)
    title = Column(String(500), nullable=False)
    preview = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship to messages
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")


class Message(Base):
    """Message model for storing individual chat messages."""
    
    __tablename__ = "messages"
    
    id = Column(String(255), primary_key=True)
    conversation_id = Column(String(255), ForeignKey("conversations.id"), nullable=False)
    content = Column(Text, nullable=False)
    role = Column(String(20), nullable=False)  # 'user' or 'assistant'
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship to conversation
    conversation = relationship("Conversation", back_populates="messages")


class UserConfig(Base):
    """User configuration model for storing app settings."""
    
    __tablename__ = "user_configs"
    
    user_id = Column(String(255), primary_key=True, default="default")
    backend_type = Column(String(20), default="ollama")  # 'ollama' or 'lmstudio'
    backend_port = Column(Integer, default=11434)
    accent_color = Column(String(50), default="emerald")
    web_search_enabled = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
