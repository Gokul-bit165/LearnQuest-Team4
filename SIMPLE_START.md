# 🚀 LearnQuest - Simple Start Guide

## Quick Start (For You to Run)

Since you're running Windows, here's the easiest way to start everything:

### **Option 1: Use Docker (Recommended)**

Just run this command in PowerShell:
```powershell
cd LearnQuest-Team4
docker-compose up -d
```

Then open your browser to:
- **Main App**: http://localhost:3000
- **Certification**: http://localhost:3000/certification

### **Option 2: Run Services Separately**

**Terminal 1 - Docker Services (Background):**
```powershell
cd LearnQuest-Team4
docker-compose up -d
```

**Terminal 2 - Web Frontend:**
```powershell
cd LearnQuest-Team4/LearnQuest-Team4/apps/web-frontend
npm install
npm run dev
```

**Terminal 3 - Admin Frontend:**
```powershell  
cd LearnQuest-Team4/LearnQuest-Team4/apps/admin-frontend
npm install
npm run dev
```

Then open your browser to:
- **Main App**: http://localhost:5173
- **Admin**: http://localhost:5174
- **API**: http://localhost:8000

## Current Status

✅ **API Server**: Running on port 8000
✅ **Judge0**: Running on port 2358  
✅ **ChromaDB**: Running on port 8001
✅ **PostgreSQL**: Running for Judge0
✅ **Redis**: Running for caching

## Access the Application

### Main LearnQuest App:
```
http://localhost:3000
```

### Certification Module:
```
http://localhost:3000/certification
```

If you see a blank page, it means the web container needs to be updated with the new certification pages. Here's how to fix it:

### Fix for Blank Certification Page:

```powershell
# Navigate to the project
cd "D:\AI WORKSHOP\TASK\LearnQuest-Team4\LearnQuest-Team4"

# Stop and remove the web container
docker stop learnquest-team4-web-1
docker rm learnquest-team4-web-1

# Rebuild the web container with new files
docker-compose build web

# Start it again
docker-compose up web -d
```

Or just run the web frontend locally in dev mode:

```powershell
cd "D:\AI WORKSHOP\TASK\LearnQuest-Team4\LearnQuest-Team4\apps\web-frontend"
npm run dev
```

Then access: **http://localhost:5173/certification**

## Features Available

✅ **Certification Landing Page** - Professional UI matching your design
✅ **Topic Selection** - 8 technology topics (React.js, Python, etc.)
✅ **Difficulty Selection** - Easy/Medium/Hard with detailed specs
✅ **Test Environment Setup** - Camera preview and identity verification
✅ **Pre-Test Requirements** - Comprehensive requirement checking
✅ **Proctored Test** - Full-screen monitoring with live status
✅ **Test Results** - Detailed scoring and certificate issuance
✅ **Backend API** - Complete proctoring routes and services

## Need Help?

1. **Check Docker**: `docker ps` - Should show running containers
2. **Check API**: `curl http://localhost:8000/api/health` - Should return `{"status":"ok"}`
3. **Check Web**: Visit http://localhost:3000 or http://localhost:5173

## Next Steps

1. ✅ Open your browser to http://localhost:3000
2. ✅ Navigate to /certification
3. ✅ Select a topic and difficulty
4. ✅ Experience the proctored test flow
5. ✅ View results and certificates

Your application is running and ready to use!


