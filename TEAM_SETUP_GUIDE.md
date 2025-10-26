# 🚀 Team Setup Guide - LearnQuest (Updated)

This guide will help your teammates set up and use the LearnQuest application with Google OAuth and AI features working properly.

## 📋 Prerequisites

Before starting, make sure you have:
- [Git](https://git-scm.com/downloads) installed
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- [Node.js](https://nodejs.org/) (version 16 or higher)
- [Python](https://www.python.org/downloads/) (version 3.8 or higher)

## 🔧 Step-by-Step Setup

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone <your-repository-url>
cd LearnQuest

# Or if you already have it, pull the latest changes
git pull origin main
```

### Step 2: Set Up Environment Configuration

**IMPORTANT**: You need to create the `.env` file in the correct location for Docker to work properly.

**Windows (PowerShell):**
```powershell
# Create the .env file in services/api/ directory
New-Item -Path "services/api/.env" -ItemType File -Force

# Add the complete configuration
@"
# Database Configuration
MONGO_URL=mongodb+srv://gokul9942786_db_user:eTMzG8J5Z3hC86C0@cluster0.qvkilbo.mongodb.net/learnquest?retryWrites=true&w=majority&appName=Cluster0
MONGO_DB=learnquest

# Security
JWT_SECRET_KEY=learnquest-jwt-secret-key-2024

# Google OAuth Configuration
# Get these from Google Cloud Console: https://console.cloud.google.com/
# 1. Create a new project or select existing
# 2. Enable Google+ API
# 3. Create OAuth 2.0 credentials (Web application)
# 4. Add authorized redirect URI: http://localhost:3000/login
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/login

# ChromaDB Configuration (for Docker)
CHROMA_HOST=chroma
CHROMA_PORT=8000

# Ollama Configuration (for AI features)
# Make sure Ollama is running on your host machine
OLLAMA_BASE_URL=http://host.docker.internal:11434

# API Configuration
API_URL=http://localhost:8000
VITE_API_URL=http://localhost:8000
"@ | Out-File -FilePath "services/api/.env" -Encoding UTF8
```

**macOS/Linux:**
```bash
# Create the .env file in services/api/ directory
cat > services/api/.env << 'EOF'
# Database Configuration
MONGO_URL=mongodb+srv://gokul9942786_db_user:eTMzG8J5Z3hC86C0@cluster0.qvkilbo.mongodb.net/learnquest?retryWrites=true&w=majority&appName=Cluster0
MONGO_DB=learnquest

# Security
JWT_SECRET_KEY=learnquest-jwt-secret-key-2024

# Google OAuth Configuration
# Get these from Google Cloud Console: https://console.cloud.google.com/
# 1. Create a new project or select existing
# 2. Enable Google+ API
# 3. Create OAuth 2.0 credentials (Web application)
# 4. Add authorized redirect URI: http://localhost:3000/login
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/login

# ChromaDB Configuration (for Docker)
CHROMA_HOST=chroma
CHROMA_PORT=8000

# Ollama Configuration (for AI features)
# Make sure Ollama is running on your host machine
OLLAMA_BASE_URL=http://host.docker.internal:11434

# API Configuration
API_URL=http://localhost:8000
VITE_API_URL=http://localhost:8000
EOF
```

### Step 3: Set Up Google OAuth (Optional but Recommended)

If you want to use Google sign-in:

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Create a new project** or select existing one
3. **Enable Google+ API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. **Create OAuth 2.0 credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URI: `http://localhost:3000/login`
5. **Update your `.env` file** with the credentials:
   ```bash
   # Edit services/api/.env and replace:
   GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-actual-client-secret
   ```

### Step 4: Set Up Ollama (For AI Features)

**Install Ollama:**
- **Windows**: Download from [ollama.ai](https://ollama.ai/download)
- **macOS**: `brew install ollama`
- **Linux**: `curl -fsSL https://ollama.ai/install.sh | sh`

**Start Ollama and pull models:**
```bash
# Start Ollama service
ollama serve

# In another terminal, pull the required model
ollama pull llama3
```

### Step 5: Start the Application

```bash
# Start all services with Docker Compose
docker-compose up --build -d

# Wait for services to start (about 30-60 seconds)
# Check if all services are running
docker-compose ps
```

### Step 6: Verify Setup

1. **Check API Health:**
   ```bash
   # Windows
   Invoke-WebRequest -Uri "http://localhost:8000/" -Method GET
   
   # macOS/Linux
   curl http://localhost:8000/
   ```

2. **Check Google OAuth:**
   ```bash
   # Windows
   Invoke-WebRequest -Uri "http://localhost:8000/api/auth/google/url" -Method GET
   
   # macOS/Linux
   curl http://localhost:8000/api/auth/google/url
   ```

3. **Access the Application:**
   - Open your browser and go to: `http://localhost:3000`
   - You should see the LearnQuest application

## 🛠️ Troubleshooting

### Common Issues and Solutions

#### 1. "env file not found" Error
```bash
# Make sure the .env file exists in the correct location
ls services/api/.env

# If it doesn't exist, recreate it using Step 2 above
```

#### 2. Google OAuth Not Working
```bash
# Check if Google OAuth credentials are set
docker exec learnquest-api-1 env | grep GOOGLE

# If not set, update your services/api/.env file with correct credentials
```

#### 3. AI Tutor Not Working
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# If not running, start Ollama:
ollama serve
ollama pull llama3
```

#### 4. Docker Services Not Starting
```bash
# Check Docker Desktop is running
# Restart Docker Desktop if needed

# Clean up and restart
docker-compose down
docker-compose up --build -d
```

#### 5. Database Connection Issues
```bash
# Test database connection
python -c "
import pymongo
client = pymongo.MongoClient('mongodb+srv://gokul9942786_db_user:eTMzG8J5Z3hC86C0@cluster0.qvkilbo.mongodb.net/learnquest?retryWrites=true&w=majority&appName=Cluster0')
client.admin.command('ping')
print('Database connection successful!')
"
```

## 📱 Application URLs

Once everything is running, you can access:

- **Main Application**: http://localhost:3000
- **Admin Panel**: http://localhost:5174
- **API Documentation**: http://localhost:8000/docs
- **API Health**: http://localhost:8000/
- **ChromaDB**: http://localhost:8001/api/v2/heartbeat

## 🔄 Daily Usage

### Starting the Application
```bash
# Navigate to project directory
cd LearnQuest

# Start services
docker-compose up -d

# Check status
docker-compose ps
```

### Stopping the Application
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (if needed)
docker-compose down -v
```

### Updating the Application
```bash
# Pull latest changes
git pull origin main

# Restart services with rebuild
docker-compose down
docker-compose up --build -d
```

## 🆘 Getting Help

If you encounter issues:

1. **Check service logs:**
   ```bash
   docker-compose logs api    # API logs
   docker-compose logs web   # Frontend logs
   docker-compose logs chroma # ChromaDB logs
   ```

2. **Verify all services are running:**
   ```bash
   docker-compose ps
   ```

3. **Test individual components:**
   ```bash
   # Test API
   curl http://localhost:8000/
   
   # Test Google OAuth
   curl http://localhost:8000/api/auth/google/url
   
   # Test Ollama
   curl http://localhost:11434/api/tags
   
   # Test ChromaDB
   curl http://localhost:8001/api/v2/heartbeat
   ```

## 📊 What's Available

Your team now has access to:

- **6 Comprehensive Courses** with quizzes and lessons
- **AI Tutor** that can answer questions about any course content
- **Google OAuth Sign-in** for easy authentication
- **Real-time Leaderboard** with user rankings
- **Shared Cloud Database** - all team members see the same data
- **Admin Panel** for course management
- **API Documentation** for developers

## 🎯 Next Steps

1. **Explore the courses** and take some quizzes
2. **Test the AI Tutor** with questions about the course content
3. **Try Google sign-in** (if you set up OAuth credentials)
4. **Check the leaderboard** to see user rankings
5. **Create your own account** and start learning!

---

**Need help?** Contact the team lead or check the troubleshooting section above.