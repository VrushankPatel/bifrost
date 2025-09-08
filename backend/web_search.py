"""Web search integration using DuckDuckGo and embeddings."""

import asyncio
from typing import List, Dict, Any
from duckduckgo_search import DDGS
import requests
from config import settings


class WebSearchService:
    """Service for web search and result processing."""
    
    def __init__(self):
        self.max_results = settings.max_search_results
        self.ollama_url = f"http://localhost:{settings.ollama_port}"
    
    async def search(self, query: str) -> List[Dict[str, Any]]:
        """Search the web for the given query."""
        try:
            with DDGS() as ddgs:
                results = []
                for result in ddgs.text(query, max_results=self.max_results):
                    results.append({
                        "title": result.get("title", ""),
                        "body": result.get("body", ""),
                        "href": result.get("href", ""),
                        "snippet": result.get("body", "")[:200] + "..." if len(result.get("body", "")) > 200 else result.get("body", "")
                    })
                return results
        except Exception as e:
            print(f"Web search error: {e}")
            return []
    
    async def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Get embeddings for texts using Ollama's embedding model."""
        try:
            # Use nomic-embed-text model for embeddings
            payload = {
                "model": "nomic-embed-text",
                "prompt": texts
            }
            
            response = requests.post(
                f"{self.ollama_url}/api/embeddings",
                json=payload,
                timeout=30
            )
            response.raise_for_status()
            
            result = response.json()
            return result.get("embeddings", [])
        except Exception as e:
            print(f"Embedding error: {e}")
            return []
    
    async def search_and_embed(self, query: str) -> Dict[str, Any]:
        """Search the web and get embeddings for the results."""
        # Perform web search
        search_results = await self.search(query)
        
        if not search_results:
            return {
                "query": query,
                "results": [],
                "embeddings": [],
                "context": ""
            }
        
        # Extract text snippets for embedding
        texts = [result["snippet"] for result in search_results]
        
        # Get embeddings
        embeddings = await self.get_embeddings(texts)
        
        # Create context from search results
        context = self._create_context(search_results)
        
        return {
            "query": query,
            "results": search_results,
            "embeddings": embeddings,
            "context": context
        }
    
    def _create_context(self, results: List[Dict[str, Any]]) -> str:
        """Create context string from search results."""
        context_parts = []
        for i, result in enumerate(results, 1):
            context_parts.append(
                f"[{i}] {result['title']}\n"
                f"URL: {result['href']}\n"
                f"Content: {result['snippet']}\n"
            )
        
        return "\n".join(context_parts)


# Global web search service instance
web_search_service = WebSearchService()
