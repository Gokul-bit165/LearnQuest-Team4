# Running LearnQuest with Docker

This guide shows you how to run all the changes using Docker.

## 🐳 Quick Start

```bash
# Start all services
docker-compose up --build

# Or in detached mode
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## 📦 What's Running

| Service | URL | Description |
|---------|-----|-------------|
| **Web Frontend** | http://localhost:3000 | User-facing application with certification features |
| **Admin Panel** | http://localhost:5174 | Admin panel with enhanced question management |
| **API** | http://localhost:8000 | Backend API |
| **Database** | mongodb://localhost:27017 | MongoDB |
| **ChromaDB** | http://localhost:8001 | Vector database |
| **Judge0** | http://localhost:2358 | Code execution service |

## 🎯 Access Your Changes

### 1. Web Frontend (Certification Features)
Navigate to: **http://localhost:3000/certification**

**Test:**
- ✅ Click "Start Certification"
- ✅ Select a topic → navigates to difficulty selection
- ✅ Choose Easy/Medium/Tough
- ✅ Test tab switching prevention (Ctrl+Tab)
- ✅ Download certificate with your name

### 2. Admin Panel (Question Management)
Navigate to: **http://localhost:5174/certification**

**Test:**
- ✅ View enhanced question management UI
- ✅ Upload JSON files (python_easy.json, dsa_medium.json, etc.)
- ✅ See uploaded question banks
- ✅ Randomize questions from multiple files
- ✅ Preview and save randomized questions

## 📝 Create Sample Question Files

Create these files to test the file upload feature:

### 1. Create `python_easy.json`:
```json
[
  {
    "title": "What is Python primarily used for?",
    "options": [
      "A. Web development only",
      "B. Data science and machine learning",
      "C. Database management only",
      "D. Network security"
    ],
    "correct_answer": 1,
    "difficulty": "Easy",
    "topic_name": "Python Fundamentals"
  },
  {
    "title": "Which of the following is NOT a Python data type?",
    "options": [
      "A. List",
      "B. Dictionary",
      "C. Array",
      "D. Tuple"
    ],
    "correct_answer": 2,
    "difficulty": "Easy",
    "topic_name": "Python Fundamentals"
  }
]
```

### 2. Create `dsa_medium.json`:
```json
[
  {
    "title": "What is the time complexity of binary search?",
    "options": [
      "A. O(n)",
      "B. O(log n)",
      "C. O(n log n)",
      "D. O(1)"
    ],
    "correct_answer": 1,
    "difficulty": "Medium",
    "topic_name": "DSA - Searching"
  },
  {
    "title": "Which data structure follows LIFO principle?",
    "options": [
      "A. Queue",
      "B. Stack",
      "C. LinkedList",
      "D. Tree"
    ],
    "correct_answer": 1,
    "difficulty": "Medium",
    "topic_name": "DSA - Data Structures"
  }
]
```

## 🚀 Commands

### Start Services
```bash
docker-compose up --build
```

### Stop Services
```bash
docker-compose down
```

### Rebuild (After Code Changes)
```bash
docker-compose up --build --force-recreate
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f web
docker-compose logs -f admin-frontend
docker-compose logs -f api
```

### Restart a Service
```bash
docker-compose restart web
docker-compose restart admin-frontend
docker-compose restart api
```

### Clean Everything
```bash
# Stop and remove containers, networks, volumes
docker-compose down -v

# Remove all images
docker-compose down --rmi all
```

## 🔧 Environment Variables

### Required for API (`.env` file in `services/api/`):
```env
MONGO_URL=mongodb://db:27017/learnquest
JWT_SECRET_KEY=your-secret-key-here
MONGO_DB=learnquest
```

## 📋 Testing Checklist

### Web Frontend (http://localhost:3000)
- [ ] Navigate to `/certification`
- [ ] Click topic → navigates properly
- [ ] Select difficulty level
- [ ] Test setup page loads
- [ ] Start test (fullscreen mode)
- [ ] Try Ctrl+Tab - blocked with error message
- [ ] Try right-click - disabled
- [ ] Complete test
- [ ] Download certificate - includes your name

### Admin Panel (http://localhost:5174)
- [ ] Navigate to `/certification`
- [ ] Click settings icon on any certification
- [ ] Enhanced UI loads
- [ ] Upload JSON file (will fail without backend, but UI works)
- [ ] View question banks section
- [ ] Randomize questions section visible

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Check what's using the port
netstat -ano | findstr :3000
netstat -ano | findstr :5174
netstat -ano | findstr :8000

# Kill the process (Windows)
taskkill /PID <process_id> /F
```

### Container Not Starting
```bash
# Check logs
docker-compose logs [service-name]

# Rebuild
docker-compose up --build --force-recreate [service-name]
```

### Database Connection Issues
```bash
# Restart database
docker-compose restart db

# Check MongoDB is running
docker-compose logs db
```

### Changes Not Reflecting
```bash
# Rebuild containers
docker-compose up --build --force-recreate

# Or restart specific service
docker-compose restart web
```

## 🎯 Key Features in Docker

### 1. Certification Navigation Fixed
- Topic selection → Difficulty → Setup → Test flow works

### 2. Enhanced Admin Question Management
- File upload UI ready
- Question bank display
- Randomization controls

### 3. Tab Switching Prevention
- Ctrl+Tab blocked
- Alt+Tab blocked
- Right-click disabled
- Fullscreen enforced

### 4. Certificate Download
- User name included
- Professional design
- PNG format

## 📊 Service Status

Check running containers:
```bash
docker-compose ps
```

Expected output:
```
NAME                IMAGE                          STATUS
learnquest-web      apps/web-frontend:latest      Up
learnquest-admin    node:20-alpine                Up
learnquest-api      learnquest-api:latest         Up
learnquest-db       mongo:7.0                     Up
```

## 💡 Pro Tips

1. **Hot Reload**: Admin panel has volume mount, changes reflect immediately
2. **Web frontend**: Needs rebuild after code changes
3. **API**: Restart API container to test new endpoints
4. **Database**: Data persists in `mongo_data` volume

## 🔗 Backend Endpoints Needed

For full functionality, implement these:

```
POST /api/admin/certifications/{cert_id}/upload-questions
POST /api/admin/certifications/{cert_id}/randomize-questions
GET  /api/admin/certifications/{cert_id}/question-banks
POST /api/ai/proctor
POST /api/certifications/event
POST /api/certifications/submit
```

See `CERTIFICATION_IMPLEMENTATION.md` for details.

## ✨ Summary

You can now run everything with:
```bash
docker-compose up --build
```

Access:
- Web: http://localhost:3000
- Admin: http://localhost:5174  
- API: http://localhost:8000

Enjoy testing the certification features! 🎉

