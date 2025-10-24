# 🚀 Team Setup Guide - LearnQuest Cloud Database

This guide will help your teammates set up and use the LearnQuest application with the shared cloud database.

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

### Step 2: Set Up Cloud Database Connection

Create the environment file for the API service:

**Windows (PowerShell):**
```powershell
# Create the .env file
New-Item -Path "services/api/.env" -ItemType File -Force

# Add the cloud database connection
@"
MONGO_URL=mongodb+srv://gokul9942786_db_user:eTMzG8J5Z3hC86C0@cluster0.qvkilbo.mongodb.net/learnquest?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET_KEY=your-shared-jwt-secret-key
"@ | Out-File -FilePath "services/api/.env" -Encoding UTF8
```

**macOS/Linux:**
```bash
# Create the .env file
cat > services/api/.env << EOF
MONGO_URL=mongodb+srv://gokul9942786_db_user:eTMzG8J5Z3hC86C0@cluster0.qvkilbo.mongodb.net/learnquest?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET_KEY=your-shared-jwt-secret-key
EOF
```

### Step 3: Start the Application

```bash
# Start all services with Docker Compose
docker compose up -d

# Wait for services to start (about 30-60 seconds)
# Check if all services are running
docker compose ps
```

### Step 4: Verify Setup

1. **Check API Health:**
   ```bash
   # Windows
   Invoke-WebRequest -Uri "http://localhost:8000/api/health" -Method GET
   
   # macOS/Linux
   curl http://localhost:8000/api/health
   ```

2. **Access the Application:**
   - Open your browser and go to: `http://localhost:3000`
   - You should see the LearnQuest application

### Step 5: Test Features

1. **Login with Sample Account:**
   - Email: `student@learnquest.com`
   - Password: `password123`

2. **Test AI Tutor:**
   - Go to the Tutor page
   - Ask questions about Python, Machine Learning, or Data Structures
   - The AI should respond with detailed explanations

3. **Check Leaderboard:**
   - Go to the Leaderboard page
   - You should see real user rankings with XP and progress

4. **Browse Courses:**
   - Go to the Courses page
   - You should see 6 available courses:
     - Python for Beginners
     - Practical Machine Learning
     - Python Intermediate
     - C Programming Basics
     - Data Structures for Beginners
     - Intermediate DSA with Python

## 🛠️ Troubleshooting

### Common Issues and Solutions

#### 1. Docker Services Not Starting
```bash
# Check Docker Desktop is running
# Restart Docker Desktop if needed

# Clean up and restart
docker compose down
docker compose up -d
```

#### 2. API Connection Issues
```bash
# Check if .env file exists and has correct content
cat services/api/.env

# Restart API service
docker compose restart api
```

#### 3. Frontend Not Loading
```bash
# Check if web service is running
docker compose logs web

# Restart web service
docker compose restart web
```

#### 4. Database Connection Issues
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
- **Admin Panel**: http://localhost:3001
- **API Documentation**: http://localhost:8000/docs
- **API Health**: http://localhost:8000/api/health

## 🔄 Daily Usage

### Starting the Application
```bash
# Navigate to project directory
cd LearnQuest

# Start services
docker compose up -d

# Check status
docker compose ps
```

### Stopping the Application
```bash
# Stop all services
docker compose down

# Stop and remove volumes (if needed)
docker compose down -v
```

### Updating the Application
```bash
# Pull latest changes
git pull origin main

# Restart services
docker compose down
docker compose up -d
```

## 🆘 Getting Help

If you encounter issues:

1. **Check service logs:**
   ```bash
   docker compose logs api    # API logs
   docker compose logs web   # Frontend logs
   ```

2. **Verify all services are running:**
   ```bash
   docker compose ps
   ```

3. **Test database connection:**
   ```bash
   python -c "
   import pymongo
   client = pymongo.MongoClient('mongodb+srv://gokul9942786_db_user:eTMzG8J5Z3hC86C0@cluster0.qvkilbo.mongodb.net/learnquest?retryWrites=true&w=majority&appName=Cluster0')
   print('Connected to database!')
   "
   ```

## 📊 What's Available

Your team now has access to:

- **6 Comprehensive Courses** with quizzes and lessons
- **AI Tutor** that can answer questions about any course content
- **Real-time Leaderboard** with user rankings
- **Shared Cloud Database** - all team members see the same data
- **Admin Panel** for course management
- **API Documentation** for developers

## 🎯 Next Steps

1. **Explore the courses** and take some quizzes
2. **Test the AI Tutor** with questions about the course content
3. **Check the leaderboard** to see user rankings
4. **Create your own account** and start learning!

---

**Need help?** Contact the team lead or check the troubleshooting section above.
