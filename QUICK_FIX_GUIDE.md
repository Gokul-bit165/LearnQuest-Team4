# Quick Fix Guide - What's Not Working?

## Step 1: Check What's Running

Run the system status checker:

```powershell
python scripts/check_system_status.py
```

This will tell you exactly what's working and what's not.

## Step 2: Fix Common Issues

### Issue: API Not Running

**Symptoms:**
- Login fails
- "Network error" in console
- API calls timeout

**Fix:**
```powershell
# Navigate to API directory
cd services/api

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Start API
uvicorn src.main:app --reload --port 8000
```

Or use the batch file:
```powershell
.\START_EVERYTHING.bat
```

### Issue: Web Frontend Not Running

**Symptoms:**
- Can't access the app
- Browser shows connection refused

**Fix:**
```powershell
cd apps/web-frontend
npm run dev
```

### Issue: Admin Panel Not Running

**Symptoms:**
- Admin panel link doesn't work
- 404 error

**Fix:**
```powershell
cd apps/admin-frontend
npm run dev
```

### Issue: MongoDB Not Running

**Symptoms:**
- Login creates users but fails to authenticate
- Database errors in API logs

**Fix:**

Option 1 - Docker:
```powershell
docker run -d --name mongo -p 27017:27017 mongo:7.0
```

Option 2 - Start via docker-compose:
```powershell
docker-compose up db -d
```

### Issue: Login Credentials Don't Work

**Symptoms:**
- "Invalid credentials" error
- User exists but password doesn't work

**Fix:**
```powershell
cd scripts
python diagnose_login_issues.py
```

Choose option 3 (Both) to create test users and fix passwords.

**Default credentials after fix:**
- Email: `student@learnquest.com`
- Password: `pass123`

### Issue: Camera Not Working in Tests

**Symptoms:**
- Camera doesn't activate
- "Camera not active" message

**Fix:**
This has been fixed in the code. Make sure:
1. Browser has camera permissions
2. HTTPS or localhost (required for camera access)
3. Latest code is loaded (refresh browser cache)

## Step 3: Start Everything

### Quick Start (Recommended)

Use the batch file:
```powershell
.\START_EVERYTHING.bat
```

### Manual Start

1. **Start MongoDB:**
   ```powershell
   docker run -d --name mongo -p 27017:27017 mongo:7.0
   ```

2. **Start API:**
   ```powershell
   cd services/api
   .\venv\Scripts\Activate.ps1
   uvicorn src.main:app --reload --port 8000
   ```

3. **Start Web Frontend (new terminal):**
   ```powershell
   cd apps/web-frontend
   npm run dev
   ```

4. **Start Admin Frontend (new terminal):**
   ```powershell
   cd apps/admin-frontend
   npm run dev
   ```

## Step 4: Verify Everything Works

### Check Services

1. **API Health:**
   ```powershell
   curl http://localhost:8000/api/health
   ```
   Should return: `{"status":"ok"}`

2. **Web App:**
   Open: http://localhost:5173

3. **Admin Panel:**
   Open: http://localhost:5174

### Check Login

1. Go to: http://localhost:5173/login
2. Email: `student@learnquest.com`
3. Password: `pass123`

If login fails, run:
```powershell
cd scripts
python diagnose_login_issues.py
```
(Choose option 3)

## Common Error Messages and Fixes

### "Cannot connect to API"

**Problem:** API not running

**Fix:**
```powershell
cd services/api
uvicorn src.main:app --reload --port 8000
```

### "Invalid credentials"

**Problem:** Password hash mismatch

**Fix:**
```powershell
cd scripts
python diagnose_login_issues.py
```

### "Network error"

**Problem:** CORS or connection issue

**Fix:**
- Check API is running: http://localhost:8000/api/health
- Check browser console for details
- Verify VITE_API_URL in apps/web-frontend/.env

### "Camera not working"

**Problem:** Browser permissions or code issue

**Fix:**
- Allow camera permission in browser
- Refresh page
- Check console for errors

### "Module not found" / "Cannot find module"

**Problem:** Dependencies not installed

**Fix:**
```powershell
cd apps/web-frontend
npm install

cd ../admin-frontend
npm install
```

## Troubleshooting Commands

### Check if services are running:
```powershell
# Check API
curl http://localhost:8000/api/health

# Check MongoDB
mongo --eval "db.version()"

# Check processes
Get-Process | Where-Object {$_.ProcessName -match 'python|node|uvicorn'}
```

### View logs:
```powershell
# API logs (if running in Docker)
docker logs api-container

# MongoDB logs
docker logs mongo
```

### Reset everything:
```powershell
# Stop all services
taskkill /F /IM python.exe
taskkill /F /IM node.exe
taskkill /F /IM uvicorn.exe

# Stop Docker containers
docker stop mongo
docker rm mongo

# Restart
.\START_EVERYTHING.bat
```

## Still Not Working?

1. **Check the system status:**
   ```powershell
   python scripts/check_system_status.py
   ```

2. **Check browser console:**
   - Open browser DevTools (F12)
   - Look for red errors
   - Share error messages

3. **Check terminal output:**
   - Look for error messages
   - Share relevant error logs

4. **Verify environment variables:**
   ```powershell
   # In apps/web-frontend/.env
   VITE_API_URL=http://localhost:8000
   ```

## Quick Reference

| Service | URL | Default Port |
|---------|-----|--------------|
| Web App | http://localhost:5173 | 5173 |
| Admin Panel | http://localhost:5174 | 5174 |
| API | http://localhost:8000 | 8000 |
| MongoDB | localhost | 27017 |

## Test Credentials

After running `diagnose_login_issues.py`:

**Student:**
- Email: student@learnquest.com
- Password: pass123

**Admin:**
- Email: admin@learnquest.com
- Password: admin123

