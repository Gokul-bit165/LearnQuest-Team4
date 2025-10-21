#!/usr/bin/env python3
"""
Test code execution with the fixed server
"""

import requests
import json

API_BASE_URL = "http://localhost:8000"

# Login
print("🔐 Logging in...")
login_response = requests.post(f"{API_BASE_URL}/api/auth/login", json={
    "email": "test@example.com",
    "password": "password123"
})

if login_response.status_code != 200:
    print(f"❌ Login failed: {login_response.text}")
    exit(1)

token = login_response.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}
print("✅ Login successful")

# Test code execution with the exact code from the image
print("\n🧪 Testing code execution...")

# The code from the image: n=int(input()); if n==1: print("gokul")
test_code = """n=int(input())
if n==1:
    print("gokul")"""

# Test with string format (this should work now)
print("📤 Testing with STRING format...")
payload = {
    "card_id": "4888c725-733d-4139-940c-ab83fca6f88b",
    "user_answer": test_code
}

response = requests.post(
    f"{API_BASE_URL}/api/lessons/check-answer",
    json=payload,
    headers=headers
)

result = response.json()
print(f"📊 Response:")
print(f"  Status: {response.status_code}")
print(f"  Correct: {result.get('correct')}")
print(f"  Explanation: {result.get('explanation')}")
print(f"  Correct Answer: {result.get('correct_answer')}")

if result.get('correct') or "Passed" in str(result.get('correct_answer', '')):
    print("\n✅ SUCCESS: Code execution is working!")
    print("✅ The server is now using the updated code!")
else:
    print("\n❌ Still having issues with code execution")

# Test with dict format to see if it works now
print("\n📤 Testing with DICT format...")
payload_dict = {
    "card_id": "4888c725-733d-4139-940c-ab83fca6f88b",
    "user_answer": {
        "value": test_code,
        "mode": "run",
        "language_id": 71
    }
}

response_dict = requests.post(
    f"{API_BASE_URL}/api/lessons/check-answer",
    json=payload_dict,
    headers=headers
)

result_dict = response_dict.json()
print(f"📊 Dict Response:")
print(f"  Status: {response_dict.status_code}")
print(f"  Correct: {result_dict.get('correct')}")
print(f"  Explanation: {result_dict.get('explanation')}")
print(f"  Correct Answer: {result_dict.get('correct_answer')}")

if "[UPDATED]" in str(result_dict.get('explanation', '')):
    print("✅ The updated backend code is working!")
else:
    print("❌ The backend is still using old code")
