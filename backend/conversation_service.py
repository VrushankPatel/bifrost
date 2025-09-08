"""Conversation management service."""

from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from models import Conversation, Message, UserConfig
from datetime import datetime
import uuid


class ConversationService:
    """Service for managing conversations and messages."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_conversation(self, title: str = "New Conversation") -> Conversation:
        """Create a new conversation."""
        conversation = Conversation(
            id=str(uuid.uuid4()),
            title=title,
            preview="New conversation started...",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        self.db.add(conversation)
        self.db.commit()
        self.db.refresh(conversation)
        
        return conversation
    
    def get_conversation(self, conversation_id: str) -> Optional[Conversation]:
        """Get a conversation by ID."""
        return self.db.query(Conversation).filter(Conversation.id == conversation_id).first()
    
    def get_all_conversations(self) -> List[Conversation]:
        """Get all conversations."""
        return self.db.query(Conversation).order_by(Conversation.updated_at.desc()).all()
    
    def delete_conversation(self, conversation_id: str) -> bool:
        """Delete a conversation and all its messages."""
        conversation = self.get_conversation(conversation_id)
        if not conversation:
            return False
        
        self.db.delete(conversation)
        self.db.commit()
        return True
    
    def add_message(
        self, 
        conversation_id: str, 
        content: str, 
        role: str
    ) -> Optional[Message]:
        """Add a message to a conversation."""
        conversation = self.get_conversation(conversation_id)
        if not conversation:
            return None
        
        message = Message(
            id=str(uuid.uuid4()),
            conversation_id=conversation_id,
            content=content,
            role=role,
            created_at=datetime.utcnow()
        )
        
        self.db.add(message)
        
        # Update conversation preview and timestamp
        conversation.preview = content[:100] + "..." if len(content) > 100 else content
        conversation.updated_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(message)
        
        return message
    
    def get_conversation_messages(self, conversation_id: str) -> List[Message]:
        """Get all messages for a conversation."""
        return (
            self.db.query(Message)
            .filter(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.asc())
            .all()
        )
    
    def get_conversation_history(self, conversation_id: str) -> List[Dict[str, Any]]:
        """Get conversation history in the format expected by LLM."""
        messages = self.get_conversation_messages(conversation_id)
        return [
            {
                "role": msg.role,
                "content": msg.content
            }
            for msg in messages
        ]
    
    def update_conversation_title(self, conversation_id: str, title: str) -> bool:
        """Update conversation title."""
        conversation = self.get_conversation(conversation_id)
        if not conversation:
            return False
        
        conversation.title = title
        conversation.updated_at = datetime.utcnow()
        self.db.commit()
        
        return True


class UserConfigService:
    """Service for managing user configuration."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_config(self, user_id: str = "default") -> UserConfig:
        """Get user configuration, creating default if not exists."""
        config = self.db.query(UserConfig).filter(UserConfig.user_id == user_id).first()
        
        if not config:
            config = UserConfig(user_id=user_id)
            self.db.add(config)
            self.db.commit()
            self.db.refresh(config)
        
        return config
    
    def update_config(self, user_id: str, config_data: Dict[str, Any]) -> UserConfig:
        """Update user configuration."""
        config = self.get_config(user_id)
        
        # Update fields
        for key, value in config_data.items():
            if hasattr(config, key):
                setattr(config, key, value)
        
        config.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(config)
        
        return config
