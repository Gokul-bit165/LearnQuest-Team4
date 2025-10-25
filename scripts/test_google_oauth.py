#!/usr/bin/env python3
"""
Test script for Google OAuth integration
"""

import os
import sys
import asyncio
import httpx
from pathlib import Path

# Add the API source to the path
api_src_path = str(Path(__file__).parent.parent / "services" / "api" / "src")
sys.path.insert(0, api_src_path)

# Set up environment for imports
os.environ.setdefault('MONGO_URL', 'mongodb://localhost:27017')
os.environ.setdefault('MONGO_DB', 'learnquest')

try:
    from services.google_auth import GoogleAuthService
except ImportError as e:
    print(f"ERROR: Import error: {e}")
    print("Make sure you're running from the project root directory")
    sys.exit(1)

async def test_google_auth():
    """Test Google OAuth functionality"""
    print("Testing Google OAuth Integration...")
    
    # Check environment variables
    print("\n1. Checking environment variables...")
    required_vars = ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_REDIRECT_URI"]
    missing_vars = []
    
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
            print(f"   X {var} not set")
        else:
            print(f"   OK {var} is set")
    
    if missing_vars:
        print(f"\nERROR: Missing required environment variables: {', '.join(missing_vars)}")
        print("Please set these in your .env file or environment")
        return False
    
    # Test Google auth URL generation
    print("\n2. Testing Google auth URL generation...")
    try:
        auth_url = GoogleAuthService.get_google_auth_url()
        print(f"   OK Generated auth URL: {auth_url[:50]}...")
    except Exception as e:
        print(f"   ERROR Failed to generate auth URL: {e}")
        return False
    
    # Test API endpoints (if server is running)
    print("\n3. Testing API endpoints...")
    try:
        async with httpx.AsyncClient() as client:
            # Test Google auth URL endpoint
            response = await client.get("http://localhost:8000/api/auth/google/url")
            if response.status_code == 200:
                print("   OK GET /api/auth/google/url endpoint working")
            else:
                print(f"   ERROR GET /api/auth/google/url failed: {response.status_code}")
                return False
    except httpx.ConnectError:
        print("   WARNING API server not running - skipping endpoint tests")
        print("   Start the server with: cd services/api && python -m uvicorn src.main:app --reload")
    except Exception as e:
        print(f"   ERROR API endpoint test failed: {e}")
        return False
    
    print("\nSUCCESS: Google OAuth integration test completed successfully!")
    print("\nNext steps:")
    print("1. Start your development servers")
    print("2. Navigate to http://localhost:3000/login")
    print("3. Click 'Continue with Google' to test the full flow")
    
    return True

if __name__ == "__main__":
    asyncio.run(test_google_auth())
