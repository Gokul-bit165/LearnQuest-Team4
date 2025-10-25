#!/usr/bin/env python3
"""
Simple test for AI services using existing endpoints
"""

import requests
import json

def test_ai_health():
    """Test AI health endpoint"""
    print("🧪 Testing AI Health...")
    try:
        response = requests.get("http://localhost:8000/api/ai/health")
        if response.status_code == 200:
            result = response.json()
            print("✅ AI Health: OK")
            print(f"ChromaDB: {result.get('chromadb', {}).get('connected', False)}")
            print(f"Ollama: {result.get('ollama', {}).get('connected', False)}")
            return True
        else:
            print(f"❌ AI Health failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def test_quiz_health():
    """Test Quiz health endpoint"""
    print("\n🧪 Testing Quiz Health...")
    try:
        response = requests.get("http://localhost:8000/api/ai-quiz/health")
        if response.status_code == 200:
            result = response.json()
            print("✅ Quiz Health: OK")
            print(f"Ollama Available: {result.get('ollama_available', False)}")
            return True
        else:
            print(f"❌ Quiz Health failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def test_ollama_direct():
    """Test Ollama directly"""
    print("\n🧪 Testing Ollama Direct...")
    try:
        response = requests.get("http://localhost:11434/api/tags")
        if response.status_code == 200:
            result = response.json()
            models = [model['name'] for model in result.get('models', [])]
            print("✅ Ollama Direct: OK")
            print(f"Available Models: {models}")
            return True
        else:
            print(f"❌ Ollama Direct failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def test_chromadb_direct():
    """Test ChromaDB directly"""
    print("\n🧪 Testing ChromaDB Direct...")
    try:
        response = requests.get("http://localhost:8001/api/v1/version")
        if response.status_code == 200:
            result = response.json()
            print("✅ ChromaDB Direct: OK")
            print(f"Version: {result}")
            return True
        else:
            print(f"❌ ChromaDB Direct failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def main():
    print("🚀 LearnQuest AI Services Simple Test")
    print("=" * 50)
    
    # Test all components
    ai_health = test_ai_health()
    quiz_health = test_quiz_health()
    ollama_direct = test_ollama_direct()
    chromadb_direct = test_chromadb_direct()
    
    print("\n📊 Test Results:")
    print(f"AI Health: {'✅ OK' if ai_health else '❌ Failed'}")
    print(f"Quiz Health: {'✅ OK' if quiz_health else '❌ Failed'}")
    print(f"Ollama Direct: {'✅ OK' if ollama_direct else '❌ Failed'}")
    print(f"ChromaDB Direct: {'✅ OK' if chromadb_direct else '❌ Failed'}")
    
    if all([ai_health, quiz_health, ollama_direct, chromadb_direct]):
        print("\n🎉 All AI services are working correctly!")
        print("\n💡 Your AI tutor and quiz features should work in the web application!")
    else:
        print("\n⚠️  Some services need attention.")

if __name__ == "__main__":
    main()
