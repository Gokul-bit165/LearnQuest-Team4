#!/usr/bin/env python3
"""
Test authentication functions
"""

import sys
import os
sys.path.append('/app/src')

# Import bcrypt directly to test
import bcrypt

def test_password_verification():
    """Test password verification"""
    password = b"pass123"
    stored_hash = "$2b$12$ikMl8bnplLo79MLQBTlwMOZMwQkhMh9Q5eIt16zjrAp4sR0FgBfZS"
    
    print(f"Testing password verification...")
    print(f"Password: {password}")
    print(f"Stored hash: {stored_hash}")
    
    try:
        result = bcrypt.checkpw(password, stored_hash.encode())
        print(f"Verification result: {result}")
        return result
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    test_password_verification()
