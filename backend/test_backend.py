#!/usr/bin/env python3
"""Test script for Bifrost backend."""

import requests
import json
import time

def test_backend():
    """Test the backend API endpoints."""
    base_url = "http://localhost:8000"
    
    print("🧪 Testing Bifrost Backend...")
    print("=" * 50)
    
    # Test 1: Health Check
    print("1. Testing health endpoint...")
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            health_data = response.json()
            print(f"   ✅ Health check passed: {health_data['status']}")
            print(f"   📡 Model provider: {health_data['model_provider']}")
        else:
            print(f"   ❌ Health check failed: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Health check error: {e}")
    
    # Test 2: Get Configuration
    print("\n2. Testing config endpoint...")
    try:
        response = requests.get(f"{base_url}/api/config", timeout=5)
        if response.status_code == 200:
            config_data = response.json()
            print(f"   ✅ Config retrieved successfully")
            print(f"   🔧 Backend: {config_data['backend']['type']} on port {config_data['backend']['port']}")
        else:
            print(f"   ❌ Config retrieval failed: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Config error: {e}")
    
    # Test 3: Get Conversations
    print("\n3. Testing conversations endpoint...")
    try:
        response = requests.get(f"{base_url}/api/conversations", timeout=5)
        if response.status_code == 200:
            conv_data = response.json()
            print(f"   ✅ Conversations retrieved: {len(conv_data['conversations'])} found")
        else:
            print(f"   ❌ Conversations retrieval failed: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Conversations error: {e}")
    
    # Test 4: Chat Test (if AI backend is available)
    print("\n4. Testing chat endpoint...")
    try:
        chat_payload = {
            "query": "Hello, this is a test message. Please respond with a simple greeting.",
            "webSearchEnabled": False,
            "backend": {
                "type": "ollama",
                "port": 11434
            }
        }
        
        response = requests.post(
            f"{base_url}/chat",
            json=chat_payload,
            timeout=30
        )
        
        if response.status_code == 200:
            chat_data = response.json()
            print(f"   ✅ Chat test passed")
            print(f"   💬 Response: {chat_data['message']['content'][:100]}...")
        else:
            print(f"   ❌ Chat test failed: {response.status_code}")
            print(f"   📝 Response: {response.text}")
    except Exception as e:
        print(f"   ❌ Chat error: {e}")
        print("   💡 Make sure Ollama or LM Studio is running!")
    
    print("\n" + "=" * 50)
    print("🏁 Backend testing completed!")
    print("\n💡 If any tests failed, check:")
    print("   - Backend is running: python run.py")
    print("   - AI backend is running: ollama serve or lms server start")
    print("   - Models are installed: ollama pull llama3.2")

if __name__ == "__main__":
    test_backend()
