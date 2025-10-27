# Login Issues - Complete Fix Summary

## Common Login Issues and Solutions

### Issue 1: Invalid Credentials Error

**Symptoms:**
- Login fails with "Invalid credentials" error
- User exists in database but password doesn't work

**Root Causes:**
1. Missing `password_hash` field in database
2. Password stored in wrong format (bcrypt vs SHA256)
3. Password verification not working correctly

**Solution:**

The authentication system supports multiple password hash formats:
- **SHA256 hash** (64 characters): Simple SHA256 hash of password
- **bcrypt hash**: Standard bcrypt password hash
- **Fallback hash**: Simple comparison for development

### Issue 2: API Connection Error

**Symptoms:**
- "Network error" or "Connection failed"
- Login button shows "Signing in..." but never completes

**Root Causes:**
1. API server not running
2. Wrong API URL in environment variables
3. CORS issues

**Solution:**

Check API is running:
```bash
# Check if API is running
curl http://localhost:8000/api/health
```

Verify environment variables:
```env
VITE_API_URL=http://localhost:8000
```

### Issue 3: User Not Found

**Symptoms:**
- "User not found" error
- Email exists but login fails

**Solution:**

Create a test user:
```bash
cd scripts
python diagnose_login_issues.py
# Choose option 1 to create test users
```

Or manually:
```python
from scripts.diagnose_login_issues import create_test_users
create_test_users()
```

### Issue 4: Password Field Mismatch

**Symptoms:**
- User exists
- Password verification fails

**Solution:**

The system now checks both fields:
- `password` - primary field
- `password_hash` - fallback field

## Quick Fix Script

Run the diagnostic script to automatically fix login issues:

```bash
cd scripts
python diagnose_login_issues.py
```

Options:
1. **Create test users** - Creates student@learnquest.com and admin@learnquest.com
2. **Fix all passwords** - Updates all existing users to have working passwords
3. **Both** - Creates test users AND fixes existing ones

### Default Test Credentials

After running the script:

**Student Account:**
- Email: `student@learnquest.com`
- Password: `pass123`

**Admin Account:**
- Email: `admin@learnquest.com`
- Password: `admin123`

## Manual Password Fix

If you need to manually fix a user's password:

```python
import hashlib
from pymongo import MongoClient

client = MongoClient("mongodb://db:27017")
db = client.learnquest
users = db.users

password = "pass123"
password_hash = hashlib.sha256(password.encode()).hexdigest()

# Update user
users.update_one(
    {"email": "student@learnquest.com"},
    {"$set": {
        "password": password,
        "password_hash": password_hash
    }}
)
```

## Verification Steps

1. **Check if API is running:**
   ```bash
   curl http://localhost:8000/api/health
   ```
   Should return: `{"status":"ok"}`

2. **Check database connection:**
   ```bash
   cd services/api
   python -c "from src.database import get_collection; users = get_collection('users'); print(users.count_documents({}))"
   ```

3. **Test login endpoint:**
   ```bash
   curl -X POST http://localhost:8000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"student@learnquest.com","password":"pass123"}'
   ```

## Environment Variables

Make sure these are set:

**Frontend (.env file in apps/web-frontend/):**
```env
VITE_API_URL=http://localhost:8000
```

**Backend (.env file in services/api/):**
```env
MONGO_URL=mongodb://db:27017
MONGO_DB=learnquest
JWT_SECRET_KEY=your-secret-key
```

## Authentication Flow

1. User enters email and password
2. Frontend sends POST to `/api/auth/login`
3. Backend checks user exists
4. Backend verifies password using multiple hash formats
5. Backend creates JWT token
6. Frontend stores token in localStorage
7. User is authenticated

## Password Hash Formats Supported

The system supports these hash formats in order of preference:

1. **SHA256** (64 character hex string)
   ```python
   import hashlib
   hash = hashlib.sha256(password.encode()).hexdigest()
   ```

2. **bcrypt**
   ```python
   from passlib.context import CryptContext
   pwd_context = CryptContext(schemes=["bcrypt"])
   hash = pwd_context.hash(password)
   ```

3. **Fallback hash** (development only)
   ```python
   hash = f"fallback_hash_{password[:20]}"
   ```

## Troubleshooting

### Problem: "Invalid credentials" but user exists

**Fix:**
```python
# Update user's password
python -c "
from pymongo import MongoClient
import hashlib
client = MongoClient('mongodb://db:27017')
db = client.learnquest
users = db.users
hash = hashlib.sha256('pass123'.encode()).hexdigest()
users.update_one(
    {'email': 'student@learnquest.com'},
    {'$set': {'password_hash': hash, 'password': 'pass123'}}
)
print('Password fixed!')
"
```

### Problem: API not responding

**Fix:**
```bash
# Start API server
cd services/api
python -m uvicorn src.main:app --reload --port 8000
```

### Problem: CORS errors

**Fix:**
Check `services/api/src/main.py` CORS settings and ensure frontend URL is allowed:
```python
allow_origins=[
    "http://localhost:5173",  # Frontend
    "http://localhost:3000",  # Alternative port
]
```

## Files Involved

- `apps/web-frontend/src/pages/Login.jsx` - Login UI
- `apps/web-frontend/src/contexts/AuthContext.jsx` - Auth state management
- `apps/web-frontend/src/services/api.js` - API calls
- `services/api/src/routes/auth.py` - Login endpoint
- `services/api/src/auth.py` - Password verification

## Testing Login

After fixing passwords, test with:

```bash
# Test with curl
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@learnquest.com","password":"pass123"}'

# Should return:
# {"access_token":"...","token_type":"bearer","user":{...}}
```

Then test in browser at http://localhost:5173/login

## Quick Start Guide

To quickly fix login issues:

```bash
# 1. Navigate to scripts
cd scripts

# 2. Run diagnostic
python diagnose_login_issues.py

# 3. Choose option 3 (Both)

# 4. Login with:
# Email: student@learnquest.com
# Password: pass123
```

## Summary

✅ **Password verification supports multiple formats**
✅ **Diagnostic script can fix common issues**
✅ **Default test users available**
✅ **SHA256 hash format recommended**
✅ **Both `password` and `password_hash` fields checked**

---

If issues persist, check:
1. API server is running
2. Database is running
3. Environment variables are correct
4. User exists in database
5. Browser console for detailed error messages

