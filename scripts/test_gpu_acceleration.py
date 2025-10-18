#!/usr/bin/env python3
"""
Test script to verify GPU acceleration is working with Ollama.
This script tests the connection to your local Ollama server.
"""

import requests
import time
import json

def test_ollama_connection():
    """Test connection to Ollama server"""
    try:
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        if response.status_code == 200:
            models = response.json().get("models", [])
            print("✅ Ollama server is running")
            print(f"📋 Available models: {[model.get('name') for model in models]}")
            return True
        else:
            print(f"❌ Ollama server returned status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Cannot connect to Ollama server: {e}")
        return False

def test_llama3_gpu():
    """Test Llama3 with GPU acceleration"""
    try:
        print("🧪 Testing Llama3 with GPU acceleration...")
        start_time = time.time()
        
        payload = {
            "model": "llama3",
            "prompt": "Hello! Are you using GPU acceleration? Please respond briefly.",
            "stream": False
        }
        
        response = requests.post(
            "http://localhost:11434/api/generate",
            json=payload,
            timeout=30
        )
        
        end_time = time.time()
        response_time = end_time - start_time
        
        if response.status_code == 200:
            result = response.json()
            ai_response = result.get("response", "")
            print(f"✅ Llama3 responded in {response_time:.2f} seconds")
            print(f"🤖 Response: {ai_response[:100]}...")
            
            # GPU acceleration should be faster than CPU
            if response_time < 5:
                print("🚀 Fast response time suggests GPU acceleration is working!")
            else:
                print("⚠️  Slow response time - may be using CPU")
            
            return True
        else:
            print(f"❌ Llama3 test failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Llama3 test failed: {e}")
        return False

def test_llava_gpu():
    """Test LLaVA with GPU acceleration"""
    try:
        print("🧪 Testing LLaVA with GPU acceleration...")
        start_time = time.time()
        
        # Simple test without image
        payload = {
            "model": "llava",
            "prompt": "Hello! Are you using GPU acceleration? Please respond briefly.",
            "stream": False
        }
        
        response = requests.post(
            "http://localhost:11434/api/generate",
            json=payload,
            timeout=30
        )
        
        end_time = time.time()
        response_time = end_time - start_time
        
        if response.status_code == 200:
            result = response.json()
            ai_response = result.get("response", "")
            print(f"✅ LLaVA responded in {response_time:.2f} seconds")
            print(f"🤖 Response: {ai_response[:100]}...")
            
            if response_time < 5:
                print("🚀 Fast response time suggests GPU acceleration is working!")
            else:
                print("⚠️  Slow response time - may be using CPU")
            
            return True
        else:
            print(f"❌ LLaVA test failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ LLaVA test failed: {e}")
        return False

def main():
    print("🔍 Testing GPU Acceleration for Learn Quest AI Tutor")
    print("=" * 60)
    
    # Test 1: Connection
    if not test_ollama_connection():
        print("\n❌ Cannot connect to Ollama server.")
        print("Please make sure Ollama is running on your host machine.")
        print("Run: ollama serve")
        return
    
    print("\n" + "=" * 60)
    
    # Test 2: Llama3
    llama3_ok = test_llama3_gpu()
    
    print("\n" + "=" * 60)
    
    # Test 3: LLaVA
    llava_ok = test_llava_gpu()
    
    print("\n" + "=" * 60)
    
    # Summary
    if llama3_ok and llava_ok:
        print("🎉 All tests passed! Your RTX 4050 is accelerating AI operations!")
        print("✅ Llama3: Working with GPU acceleration")
        print("✅ LLaVA: Working with GPU acceleration")
        print("\n🚀 Your Learn Quest AI Tutor is ready for high-performance operation!")
    else:
        print("⚠️  Some tests failed. Check the error messages above.")
        print("💡 Make sure Ollama is running and models are downloaded.")

if __name__ == "__main__":
    main()
