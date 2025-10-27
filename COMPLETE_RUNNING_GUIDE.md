# 🚀 Complete LearnQuest Running Guide - From First to Last

## **Prerequisites Check**

Before starting, make sure you have:
- ✅ Docker Desktop installed and running
- ✅ Git installed
- ✅ Node.js 18+ installed
- ✅ Python 3.9+ installed

---

## **STEP-BY-STEP COMMANDS**

### **STEP 1: Clone and Navigate to Repository**

```bash
# Clone the repository (if not already cloned)
git clone https://github.com/Jhananishri-B/learnquest-o.git
cd learnquest-o
```

---

### **STEP 2: Configure Environment**

```powershell
# Create .env file for API (if it doesn't exist)
if (-not (Test-Path "services/api/.env")) {
    @"
MONGO_URL=your-mongodb-connection-string
JWT_SECRET_KEY=your-shared-jwt-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
CHROMA_HOST=chroma
CHROMA_PORT=8000
OLLAMA_BASE_URL=http://host.docker.internal:11434
"@ | Out-File -FilePath "services/api/.env" -Encoding utf8
}
```

---

### **STEP 3: Start All Services with Docker**

```powershell
# Start all services
docker-compose up -d

# Wait for services to start (give it 15-30 seconds)
Start-Sleep -Seconds 20

# Check if all services are running
docker-compose ps
```

---

### **STEP 4: Verify Services are Running**

```powershell
# Check API health
curl http://localhost:8000/api/health

# Check if services are accessible
Write-Host "Checking services..."
curl http://localhost:3000 | Select-Object -First 1
curl http://localhost:8000 | Select-Object -First 1
```

---

### **STEP 5: Access Your Application**

Open these URLs in your browser:

1. **Main Application**: http://localhost:3000
2. **Certification Module**: http://localhost:3000/certification
3. **Admin Dashboard**: http://localhost:5174
4. **API Documentation**: http://localhost:8000/docs
5. **API Health Check**: http://localhost:8000/api/health

---

## **ALTERNATIVE: Run Services Manually (Without Docker)**

### **Terminal 1: Start API Backend**

```powershell
# Navigate to API directory
cd services/api

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Start the API server
uvicorn src.main:app --reload --port 8000
```

### **Terminal 2: Start Web Frontend**

```powershell
# Navigate to web frontend directory
cd apps/web-frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

### **Terminal 3: Start Admin Frontend (Optional)**

```powershell
# Navigate to admin frontend directory
cd apps/admin-frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

---

## **TESTING THE APPLICATION**

### **1. Test Login**

```
URL: http://localhost:3000/login
Demo Credentials:
- Email: student@learnquest.com
- Password: pass123
```

### **2. Test Certification Module**

```
1. Login to your account
2. Click "Certification" in the sidebar (left menu)
3. Click "Start Certification"
4. Select a topic (e.g., "React.js")
5. Choose difficulty (Easy/Medium/Hard)
6. Complete setup (allow camera/mic)
7. Take the test
8. View results and certificate
```

---

## **STOPPING THE SERVICES**

### **Stop Docker Services:**
```powershell
docker-compose down
```

### **Stop Individual Services (if running manually):**
```powershell
# Press Ctrl+C in each terminal window
```

---

## **TROUBLESHOOTING**

### **Problem: Services won't start**
```powershell
# Check Docker is running
docker ps

# Restart Docker Desktop if needed
docker-compose down
docker-compose up -d
```

### **Problem: Can't access applications**
```powershell
# Check which ports are in use
netstat -ano | findstr :3000
netstat -ano | findstr :8000
netstat -ano | findstr :5174

# Kill process if port is blocked (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### **Problem: Camera not working**
1. Make sure you're using Chrome or Edge
2. Check browser permissions (click lock icon in address bar)
3. Allow camera and microphone access
4. Make sure you're on localhost (not 127.0.0.1)

### **Problem: API errors**
```powershell
# Check API logs
docker logs learnquest-team4-api-1

# Restart API
docker restart learnquest-team4-api-1
```

---

## **QUICK REFERENCE**

### **Start Everything:**
```powershell
cd learnquest-o
docker-compose up -d
Start-Sleep -Seconds 20
# Open http://localhost:3000
```

### **Stop Everything:**
```powershell
docker-compose down
```

### **Restart Everything:**
```powershell
docker-compose restart
```

### **View Logs:**
```powershell
# All logs
docker-compose logs

# Specific service logs
docker logs learnquest-team4-api-1
docker logs learnquest-team4-web-1
```

### **Rebuild After Changes:**
```powershell
docker-compose down
docker-compose build
docker-compose up -d
```

---

## **WHAT'S RUNNING:**

✅ **Web Frontend** - Port 3000 (Main App)
✅ **Admin Frontend** - Port 5174
✅ **API Server** - Port 8000
✅ **Judge0** - Port 2358 (Code Execution)
✅ **ChromaDB** - Port 8001 (Vector Database)
✅ **PostgreSQL** - Port 5432 (Judge0 Database)
✅ **Redis** - Port 6379 (Caching)

---

## **ACCESS POINTS:**

🌐 **Main Application:** http://localhost:3000
📜 **Certification:** http://localhost:3000/certification
👥 **Admin:** http://localhost:5174
📚 **API Docs:** http://localhost:8000/docs
❤️ **API Health:** http://localhost:8000/api/health

---

## **COMPLETE WORKFLOW:**

```powershell
# 1. Start Docker Desktop
# 2. Open PowerShell in the project directory

# 3. Start all services
docker-compose up -d

# 4. Wait for services to start
Start-Sleep -Seconds 20

# 5. Check status
docker-compose ps

# 6. Open your browser
Start-Process "http://localhost:3000"

# 7. Login and explore!
# Username: student@learnquest.com
# Password: pass123

# 8. Click "Certification" in sidebar to test new feature!

# When done, stop services:
docker-compose down
```

---

**Your complete LearnQuest application is now running! 🎉**

**View at:** http://localhost:3000/certification


