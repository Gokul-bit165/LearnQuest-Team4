# What To Do Next - Step by Step Guide

## Follow These Steps in Order

### Step 1: Check System Status

```powershell
python scripts/check_system_status.py
```

This will show you exactly what's working and what's not.

### Step 2: Fix Login Issues

```powershell
.\FIX_LOGIN.bat
```

Or manually:
```powershell
cd scripts
python diagnose_login_issues.py
# Choose option 3
```

After this, you can login with:
- Email: `student@learnquest.com`
- Password: `pass123`

### Step 3: Start All Services

**Option A - One Click:**
```powershell
.\START_EVERYTHING.bat
```

**Option B - Manual:**
```powershell
# Terminal 1 - MongoDB
docker run -d --name mongo -p 27017:27017 mongo:7.0

# Terminal 2 - API
cd services/api
.\venv\Scripts\Activate.ps1
uvicorn src.main:app --reload --port 8000

# Terminal 3 - Web Frontend
cd apps/web-frontend
npm run dev

# Terminal 4 - Admin Frontend
cd apps/admin-frontend
npm run dev
```

### Step 4: Verify Everything

Open in browser:
- Web App: http://localhost:5173
- Admin: http://localhost:5174

Try to login with `student@learnquest.com` / `pass123`

### Step 5: If Something Still Fails

Tell me:
1. What exactly isn't working?
2. What error message do you see?
3. What did the system status checker say?

## Quick Commands Reference

```powershell
# Check what's running
python scripts/check_system_status.py

# Fix login
.\FIX_LOGIN.bat

# Start everything
.\START_EVERYTHING.bat

# Check API
curl http://localhost:8000/api/health
```

## Next Steps After Everything Starts

1. ✅ Login with test credentials
2. ✅ Browse courses
3. ✅ Take a quiz
4. ✅ Try certifications
5. ✅ Access admin panel (if you're an admin)

## Need Help?

If something still isn't working, tell me:
- Which step failed?
- What error message appeared?
- What does the system status checker say?

I'll help you fix it!

