"""Unified LLM connector for Ollama and LM Studio."""

import requests
import json
from typing import Dict, Any, Optional, List
from config import settings


class LLMConnector:
    """Unified connector for different LLM backends."""
    
    def __init__(self):
        self.ollama_url = f"http://localhost:{settings.ollama_port}"
        self.lm_studio_url = f"http://localhost:{settings.lm_studio_port}"
    
    async def generate_response(
        self, 
        prompt: str, 
        conversation_history: Optional[list] = None,
        model_provider: Optional[str] = None,
        model_override: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate response using the specified model provider."""
        
        provider = model_provider or settings.model_provider
        
        if provider == "ollama":
            return await self._generate_with_ollama(prompt, conversation_history, model_override)
        elif provider == "lmstudio":
            return await self._generate_with_lm_studio(prompt, conversation_history, model_override)
        else:
            raise ValueError(f"Unsupported model provider: {provider}")
    
    async def _generate_with_ollama(
        self, 
        prompt: str, 
        conversation_history: Optional[list] = None,
        model_override: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate response using Ollama API."""
        
        # Build messages for chat format
        messages = []
        if conversation_history:
            messages.extend(conversation_history)
        messages.append({"role": "user", "content": prompt})
        
        payload = {
            "model": model_override or settings.ollama_model,
            "messages": messages,
            "stream": False
        }
        
        try:
            # Try chat endpoint first (Ollama >= 0.1.26)
            response = requests.post(
                f"{self.ollama_url}/api/chat",
                json=payload,
                timeout=60
            )
            if response.status_code == 404:
                # Fallback for older Ollama: use /api/generate with a concatenated prompt
                concat_prompt = self._build_prompt_from_messages(messages)
                gen_payload = {
                    "model": payload["model"],
                    "prompt": concat_prompt,
                    "stream": False
                }
                gen_resp = requests.post(
                    f"{self.ollama_url}/api/generate",
                    json=gen_payload,
                    timeout=60
                )
                gen_resp.raise_for_status()
                gen_json = gen_resp.json()
                # Normalize to chat-like response
                return {
                    "message": {
                        "role": "assistant",
                        "content": gen_json.get("response", "")
                    },
                    "done": gen_json.get("done", True)
                }
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"Ollama API error: {str(e)}")
    
    async def _generate_with_lm_studio(
        self, 
        prompt: str, 
        conversation_history: Optional[list] = None,
        model_override: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate response using LM Studio API (OpenAI compatible)."""
        
        # Build messages for OpenAI format
        messages = []
        if conversation_history:
            messages.extend(conversation_history)
        messages.append({"role": "user", "content": prompt})
        
        payload = {
            "model": model_override or settings.lm_studio_model,
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 2000,
            "stream": False
        }
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": "Bearer lm-studio"
        }
        
        try:
            response = requests.post(
                f"{self.lm_studio_url}/v1/chat/completions",
                json=payload,
                headers=headers,
                timeout=60
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"LM Studio API error: {str(e)}")
    
    async def check_health(self, model_provider: Optional[str] = None) -> Dict[str, Any]:
        """Check health of the specified model provider."""
        
        provider = model_provider or settings.model_provider
        
        if provider == "ollama":
            return await self._check_ollama_health()
        elif provider == "lmstudio":
            return await self._check_lm_studio_health()
        else:
            return {"status": "error", "message": f"Unknown provider: {provider}"}
    
    async def get_available_models(self, model_provider: Optional[str] = None) -> List[str]:
        """Get list of available models for the specified provider."""
        
        provider = model_provider or settings.model_provider
        
        if provider == "ollama":
            return await self._get_ollama_models()
        elif provider == "lmstudio":
            return await self._get_lm_studio_models()
        else:
            return []
    
    async def _get_ollama_models(self) -> List[str]:
        """Get available Ollama models."""
        try:
            response = requests.get(f"{self.ollama_url}/api/tags", timeout=5)
            response.raise_for_status()
            data = response.json()
            return [model["name"] for model in data.get("models", [])]
        except requests.exceptions.RequestException:
            return []
    
    async def _get_lm_studio_models(self) -> List[str]:
        """Get available LM Studio models."""
        try:
            response = requests.get(f"{self.lm_studio_url}/v1/models", timeout=5)
            response.raise_for_status()
            data = response.json()
            return [model["id"] for model in data.get("data", [])]
        except requests.exceptions.RequestException:
            return []
    
    async def _check_ollama_health(self) -> Dict[str, Any]:
        """Check Ollama health."""
        try:
            response = requests.get(f"{self.ollama_url}/api/tags", timeout=5)
            response.raise_for_status()
            return {"status": "healthy", "provider": "ollama"}
        except requests.exceptions.RequestException:
            return {"status": "unhealthy", "provider": "ollama"}

    def _build_prompt_from_messages(self, messages: list) -> str:
        """Concatenate chat messages into a single prompt for /api/generate fallback."""
        parts = []
        for msg in messages:
            role = msg.get("role", "user").capitalize()
            content = msg.get("content", "")
            parts.append(f"{role}: {content}")
        parts.append("Assistant:")
        return "\n\n".join(parts)
    
    async def _check_lm_studio_health(self) -> Dict[str, Any]:
        """Check LM Studio health."""
        try:
            response = requests.get(f"{self.lm_studio_url}/v1/models", timeout=5)
            response.raise_for_status()
            return {"status": "healthy", "provider": "lmstudio"}
        except requests.exceptions.RequestException:
            return {"status": "unhealthy", "provider": "lmstudio"}


# Global connector instance
llm_connector = LLMConnector()
