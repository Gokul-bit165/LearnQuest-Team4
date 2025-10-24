# 🎯 Team Onboarding - LearnQuest Cloud Database

Welcome to the LearnQuest team! This document provides everything your teammates need to get started with the shared cloud database setup.

## 🚀 Quick Start (Choose Your Platform)

### Windows Users
```powershell
# 1. Clone the repository
git clone <your-repository-url>
cd LearnQuest

# 2. Run the automated setup
.\scripts\team_setup.ps1

# 3. That's it! The application will open automatically
```

### macOS/Linux Users
```bash
# 1. Clone the repository
git clone <your-repository-url>
cd LearnQuest

# 2. Run the automated setup
./scripts/team_setup.sh

# 3. Open http://localhost:3000 in your browser
```

## 📋 What You'll Get

### 🎓 **6 Comprehensive Courses**
- **Python for Beginners** - Master Python basics
- **Practical Machine Learning** - ML with Pandas, NumPy, Scikit-learn, YOLO, BERT
- **Python Intermediate** - Advanced Python features and OOP
- **C Programming Basics** - C syntax and logic
- **Data Structures for Beginners** - Arrays, lists, trees, algorithms
- **Intermediate DSA with Python** - Advanced data structures and algorithms

### 🤖 **AI Tutor Features**
- Ask questions about any course content
- Get detailed explanations with examples
- Supports text and image questions
- Powered by advanced AI models

### 📊 **Real-time Features**
- **Leaderboard** with user rankings and XP
- **Progress Tracking** across all courses
- **Quiz System** with immediate feedback
- **Shared Database** - all team members see the same data

## 🔑 Login Credentials

**Sample Account (for testing):**
- **Email:** `student@learnquest.com`
- **Password:** `password123`

**Create Your Own Account:**
- Register with your own email
- All progress will be saved to the shared cloud database

## 🌐 Application URLs

Once setup is complete, you can access:

- **Main Application:** http://localhost:3000
- **Admin Panel:** http://localhost:3001
- **API Documentation:** http://localhost:8000/docs
- **API Health Check:** http://localhost:8000/api/health

## 🛠️ Daily Usage Commands

### Starting the Application
```bash
cd LearnQuest
docker compose up -d
```

### Stopping the Application
```bash
docker compose down
```

### Checking Status
```bash
docker compose ps
```

### Viewing Logs
```bash
docker compose logs api    # API logs
docker compose logs web   # Frontend logs
```

## 🧪 Testing Your Setup

Run the setup test to verify everything is working:

```bash
python scripts/test_setup.py
```

This will check:
- ✅ API health
- ✅ Database connection
- ✅ Frontend accessibility
- ✅ AI Tutor functionality

## 🆘 Troubleshooting

### Common Issues

#### 1. Docker Not Running
```bash
# Check Docker status
docker ps

# Start Docker Desktop if needed
```

#### 2. Services Not Starting
```bash
# Check logs
docker compose logs

# Restart services
docker compose down
docker compose up -d
```

#### 3. Database Connection Issues
```bash
# Test database connection
python -c "
import pymongo
client = pymongo.MongoClient('mongodb+srv://gokul9942786_db_user:eTMzG8J5Z3hC86C0@cluster0.qvkilbo.mongodb.net/learnquest?retryWrites=true&w=majority&appName=Cluster0')
client.admin.command('ping')
print('Database connection successful!')
"
```

#### 4. Frontend Not Loading
- Check if port 3000 is available
- Try accessing http://localhost:3000 directly
- Check browser console for errors

## 📚 Learning Path Recommendations

### For Beginners
1. Start with **Python for Beginners**
2. Take the quizzes to test your knowledge
3. Use the AI Tutor for questions
4. Check your progress on the leaderboard

### For Intermediate Users
1. Try **Python Intermediate** or **Data Structures**
2. Explore **Practical Machine Learning**
3. Challenge yourself with advanced topics
4. Compete on the leaderboard

### For Advanced Users
1. Dive into **Intermediate DSA with Python**
2. Explore **C Programming Basics**
3. Test the AI Tutor with complex questions
4. Help teammates by sharing knowledge

## 🎯 Team Collaboration Features

### Shared Database
- All team members access the same cloud database
- Progress is synchronized across all devices
- Leaderboard shows real team rankings

### AI Tutor
- Ask questions about any course content
- Get personalized explanations
- Share insights with teammates

### Admin Panel
- Course management capabilities
- User progress monitoring
- Content updates

## 📱 Mobile Access

The application is web-based and works on:
- Desktop browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers
- Tablet devices

## 🔄 Updates and Maintenance

### Getting Updates
```bash
git pull origin main
docker compose down
docker compose up -d
```

### Database Backups
- Database is automatically backed up by MongoDB Atlas
- No manual backup required
- Data is safely stored in the cloud

## 🎉 Success Checklist

After setup, you should be able to:

- [ ] Access the application at http://localhost:3000
- [ ] Login with the provided credentials
- [ ] See 6 courses in the courses page
- [ ] Ask the AI Tutor questions about course content
- [ ] View the leaderboard with user rankings
- [ ] Take quizzes and see your progress
- [ ] Create your own account

## 🆘 Getting Help

If you encounter any issues:

1. **Check the troubleshooting section above**
2. **Run the setup test:** `python scripts/test_setup.py`
3. **Check service logs:** `docker compose logs`
4. **Contact the team lead**
5. **Check the full setup guide:** `TEAM_SETUP_GUIDE.md`

## 🎓 Ready to Start Learning?

1. **Open the application:** http://localhost:3000
2. **Login with:** `student@learnquest.com` / `password123`
3. **Explore the courses** and start learning
4. **Test the AI Tutor** with questions
5. **Check the leaderboard** and compete with teammates

---

**Welcome to the team! Happy learning!** 🚀
