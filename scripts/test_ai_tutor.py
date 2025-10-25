#!/usr/bin/env python3
"""
Test script for AI Tutor functionality
"""

import requests
import json
import time

def test_ai_tutor():
    """Test the AI tutor endpoint"""
    print("🧪 Testing AI Tutor...")
    
    # Test data
    test_question = {
        "question": "What is Python programming?",
        "course_id": "python-for-beginners"
    }
    
    try:
        # Test the AI explain endpoint (public test endpoint)
        response = requests.post(
            "http://localhost:8000/api/ai/test-explain",
            json=test_question,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ AI Tutor is working!")
            print(f"Explanation: {result.get('explanation', 'No explanation')[:200]}...")
            print(f"Confidence: {result.get('confidence', 'N/A')}")
            return True
        else:
            print(f"❌ AI Tutor failed: {response.status_code}")
            print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing AI Tutor: {str(e)}")
        return False

def test_quiz_generation():
    """Test the quiz generation endpoint"""
    print("\n🧪 Testing Quiz Generation...")
    
    # Test data
    test_request = {
        "topic": "Python basics",
        "difficulty": "beginner",
        "num_questions": 3
    }
    
    try:
        # Test the quiz generation endpoint (public test endpoint)
        response = requests.post(
            "http://localhost:8000/api/ai-quiz/test-generate",
            json=test_request,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Quiz Generation is working!")
            print(f"Generated {len(result.get('questions', []))} questions")
            return True
        else:
            print(f"❌ Quiz Generation failed: {response.status_code}")
            print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing Quiz: {str(e)}")
        return False

def main():
    print("🚀 LearnQuest AI Services Test")
    print("=" * 40)
    
    # Wait for services to be ready
    print("⏳ Waiting for services to be ready...")
    time.sleep(5)
    
    # Test AI Tutor
    ai_success = test_ai_tutor()
    
    # Test Quiz
    quiz_success = test_quiz_generation()
    
    print("\n📊 Test Results:")
    print(f"AI Tutor: {'✅ Working' if ai_success else '❌ Failed'}")
    print(f"Quiz: {'✅ Working' if quiz_success else '❌ Failed'}")
    
    if ai_success and quiz_success:
        print("\n🎉 All AI services are working correctly!")
    else:
        print("\n⚠️  Some AI services need attention.")

if __name__ == "__main__":
    main()
