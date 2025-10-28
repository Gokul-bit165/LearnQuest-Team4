# Admin Panel Quick Start Guide

## Issue: Admin Panel Not Running

### Quick Fix

Run this command:

```powershell
.\START_ADMIN.bat
```

Or manually:

```powershell
cd apps/admin-frontend
npm install
npm run dev
```

Then open: http://localhost:5174

## Common Issues

### Issue 1: "Cannot GET /"

**Problem:** Admin panel not starting properly

**Fix:**
```powershell
cd apps/admin-frontend
npm run dev
```

### Issue 2: "Module not found"

**Problem:** Dependencies not installed

**Fix:**
```powershell
cd apps/admin-frontend
npm install
npm run dev
```

### Issue 3: "Port 5174 already in use"

**Problem:** Another process is using the port

**Fix:**
```powershell
# Find the process
netstat -ano | findstr :5174

# Kill the process (replace PID with the number from above)
taskkill /PID [PID] /F

# Then start admin panel
cd apps/admin-frontend
npm run dev
```

### Issue 4: "Connection refused" to API

**Problem:** API not running

**Fix:**
First start the API:
```powershell
cd services/api
.\venv\Scripts\Activate.ps1
uvicorn src.main:app --reload --port 8000
```

Then start admin panel in another terminal:
```powershell
cd apps/admin-frontend
npm run dev
```

## Accessing Admin Panel

### Option 1: Direct URL

1. Start admin panel: `.\START_ADMIN.bat`
2. Open: http://localhost:5174

### Option 2: From Main App

1. Login to main app as admin user
2. Click "Go to Admin Panel" button
3. Admin panel opens in new tab with token

### Default Admin Credentials

If you've run the login fix script:
- Email: `admin@learnquest.com`
- Password: `admin123`

## Checking if It's Working

1. Open browser console (F12)
2. Look for errors in red
3. Check Network tab for API calls
4. Verify API is running: http://localhost:8000/api/health

## Structure

Admin Panel Files:
```
apps/admin-frontend/
├── src/
│   ├── App.jsx              # Main app routes
│   ├── pages/               # Admin pages
│   │   ├── Dashboard.jsx
│   │   ├── Users.jsx
│   │   ├── Courses.jsx
│   │   ├── Certifications.jsx
│   │   └── Problems.jsx
│   └── services/
│       └── api.js           # API client
```

## Troubleshooting

### Check if Admin Panel is Running

```powershell
# Check if port 5174 is in use
netstat -ano | findstr :5174

# Should show something like:
# TCP    0.0.0.0:5174           0.0.0.0:0              LISTENING       [PID]
```

### Check Browser Console

1. Open http://localhost:5174
2. Press F12 (Developer Tools)
3. Look at Console tab
4. Share any red error messages

### Common Errors

**"Failed to fetch"**
- API server not running
- Start API: `cd services/api && uvicorn src.main:app --reload --port 8000`

**"401 Unauthorized"**
- Admin token missing or expired
- Re-login from main app

**"Cannot GET /api/admin/..."**
- API endpoint not found
- Check API routes in `services/api/src/routes/admin/`

## Files Modified

I've fixed these issues:

1. **CertificationQuestions.jsx** - Fixed API URLs
2. **API endpoints** - Fixed malformed URLs
3. **Layout** - Added missing imports

All fixed issues are documented in `ADMIN_PANEL_FIXES_SUMMARY.md`

## Next Steps

1. Run `.\START_ADMIN.bat`
2. Open http://localhost:5174
3. Should see admin dashboard

If still not working, share the error from browser console (F12).

