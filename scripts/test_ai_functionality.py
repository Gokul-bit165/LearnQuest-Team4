#!/usr/bin/env python3
"""
Test AI functionality by creating a user and testing authenticated endpoints
"""

import requests
import json

def create_test_user():
    """Create a test user"""
    print("👤 Creating test user...")
    try:
        # Register a test user
        user_data = {
            "name": "Test User",
            "email": "test@example.com",
            "password": "testpass123"
        }
        
        response = requests.post(
            "http://localhost:8000/api/auth/register",
            json=user_data
        )
        
        if response.status_code == 200:
            print("✅ Test user created")
            return True
        elif response.status_code == 400 and "already exists" in response.text:
            print("✅ Test user already exists")
            return True
        else:
            print(f"❌ User creation failed: {response.status_code}")
            print(f"Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error creating user: {str(e)}")
        return False

def login_test_user():
    """Login test user and get token"""
    print("🔐 Logging in test user...")
    try:
        login_data = {
            "email": "test@example.com",
            "password": "testpass123"
        }
        
        response = requests.post(
            "http://localhost:8000/api/auth/login",
            json=login_data
        )
        
        if response.status_code == 200:
            result = response.json()
            token = result.get('access_token')
            print("✅ Login successful")
            return token
        else:
            print(f"❌ Login failed: {response.status_code}")
            print(f"Error: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error logging in: {str(e)}")
        return None

def test_ai_explain(token):
    """Test AI explain endpoint"""
    print("\n🧪 Testing AI Explain...")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        explain_data = {
            "question": "What is Python programming?",
            "course_id": "python-for-beginners"
        }
        
        response = requests.post(
            "http://localhost:8000/api/ai/explain",
            json=explain_data,
            headers=headers
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ AI Explain: Working!")
            print(f"Explanation: {result.get('explanation', 'No explanation')[:100]}...")
            return True
        else:
            print(f"❌ AI Explain failed: {response.status_code}")
            print(f"Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error testing AI explain: {str(e)}")
        return False

def test_quiz_generate(token):
    """Test Quiz generation endpoint"""
    print("\n🧪 Testing Quiz Generation...")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        quiz_data = {
            "course_id": "python-for-beginners",
            "difficulty": "easy",
            "num_questions": 2
        }
        
        response = requests.post(
            "http://localhost:8000/api/ai-quiz/generate",
            json=quiz_data,
            headers=headers
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Quiz Generation: Working!")
            print(f"Generated {len(result.get('questions', []))} questions")
            return True
        else:
            print(f"❌ Quiz Generation failed: {response.status_code}")
            print(f"Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error testing quiz: {str(e)}")
        return False

def main():
    print("🚀 LearnQuest AI Functionality Test")
    print("=" * 50)
    
    # Create user
    if not create_test_user():
        print("❌ Cannot proceed without test user")
        return
    
    # Login and get token
    token = login_test_user()
    if not token:
        print("❌ Cannot proceed without authentication token")
        return
    
    # Test AI functionality
    ai_working = test_ai_explain(token)
    quiz_working = test_quiz_generate(token)
    
    print("\n📊 Final Results:")
    print(f"AI Tutor: {'✅ Working' if ai_working else '❌ Failed'}")
    print(f"Quiz Generation: {'✅ Working' if quiz_working else '❌ Failed'}")
    
    if ai_working and quiz_working:
        print("\n🎉 AI Tutor and Quiz are working correctly!")
        print("💡 You can now use these features in your web application!")
    else:
        print("\n⚠️  Some AI features need attention.")

if __name__ == "__main__":
    main()
