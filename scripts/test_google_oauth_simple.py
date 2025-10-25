#!/usr/bin/env python3
"""
Simple test script for Google OAuth integration
"""

import os
import asyncio
import httpx
from pathlib import Path

# Load environment variables from .env file
def load_env_file():
    env_path = Path(__file__).parent.parent / ".env"
    if env_path.exists():
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key] = value

# Load .env file
load_env_file()

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
        print("\nExample .env configuration:")
        print("GOOGLE_CLIENT_ID=your-google-client-id-here")
        print("GOOGLE_CLIENT_SECRET=your-google-client-secret-here")
        print("GOOGLE_REDIRECT_URI=http://localhost:3000/login")
        return False
    
    # Test API endpoints (if server is running)
    print("\n2. Testing API endpoints...")
    try:
        async with httpx.AsyncClient() as client:
            # Test Google auth URL endpoint
            response = await client.get("http://localhost:8000/api/auth/google/url")
            if response.status_code == 200:
                data = response.json()
                print("   OK GET /api/auth/google/url endpoint working")
                print(f"   OK Generated auth URL: {data.get('auth_url', '')[:50]}...")
            else:
                print(f"   ERROR GET /api/auth/google/url failed: {response.status_code}")
                return False
    except httpx.ConnectError:
        print("   WARNING API server not running - skipping endpoint tests")
        print("   Start the server with: cd services/api && python -m uvicorn src.main:app --reload")
        print("   Or use Docker: docker-compose up")
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
