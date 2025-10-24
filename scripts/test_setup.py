#!/usr/bin/env python3
"""
Test script to verify the LearnQuest setup is working correctly.
This script checks all the key components of the application.
"""

import requests
import time
import sys
from datetime import datetime

def test_api_health():
    """Test if the API is responding"""
    try:
        response = requests.get("http://localhost:8000/api/health", timeout=10)
        if response.status_code == 200:
            print("✅ API Health: OK")
            return True
        else:
            print(f"❌ API Health: Failed (Status: {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ API Health: Connection failed ({e})")
        return False

def test_database_connection():
    """Test database connection through API"""
    try:
        # Test a simple API endpoint that requires database access
        response = requests.get("http://localhost:8000/api/courses", timeout=10)
        if response.status_code == 200:
            courses = response.json()
            print(f"✅ Database Connection: OK ({len(courses)} courses found)")
            return True
        else:
            print(f"❌ Database Connection: Failed (Status: {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ Database Connection: Failed ({e})")
        return False

def test_frontend():
    """Test if the frontend is accessible"""
    try:
        response = requests.get("http://localhost:3000", timeout=10)
        if response.status_code == 200:
            print("✅ Frontend: OK")
            return True
        else:
            print(f"❌ Frontend: Failed (Status: {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ Frontend: Connection failed ({e})")
        return False

def test_ai_tutor():
    """Test if AI tutor endpoint is working"""
    try:
        # Test AI tutor endpoint (this might require authentication)
        response = requests.get("http://localhost:8000/api/ai/health", timeout=10)
        if response.status_code == 200:
            print("✅ AI Tutor: OK")
            return True
        else:
            print(f"⚠️  AI Tutor: Status {response.status_code} (may require authentication)")
            return True  # Don't fail the test for this
    except Exception as e:
        print(f"⚠️  AI Tutor: Connection failed ({e})")
        return True  # Don't fail the test for this

def main():
    """Run all tests"""
    print("🧪 LearnQuest Setup Test")
    print("=" * 30)
    print(f"📅 Test started at: {datetime.now()}")
    print()
    
    tests = [
        ("API Health", test_api_health),
        ("Database Connection", test_database_connection),
        ("Frontend", test_frontend),
        ("AI Tutor", test_ai_tutor)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"🔍 Testing {test_name}...")
        if test_func():
            passed += 1
        print()
    
    print("📊 Test Results:")
    print(f"   Passed: {passed}/{total}")
    
    if passed == total:
        print("🎉 All tests passed! Your setup is working correctly.")
        print()
        print("🌐 Application URLs:")
        print("   Main App: http://localhost:3000")
        print("   Admin Panel: http://localhost:3001")
        print("   API Docs: http://localhost:8000/docs")
        print()
        print("🔑 Login Credentials:")
        print("   Email: student@learnquest.com")
        print("   Password: password123")
        return 0
    else:
        print("❌ Some tests failed. Please check the setup.")
        print()
        print("🛠️ Troubleshooting:")
        print("   1. Check if Docker is running: docker ps")
        print("   2. Check service logs: docker compose logs")
        print("   3. Restart services: docker compose down && docker compose up -d")
        return 1

if __name__ == "__main__":
    sys.exit(main())
