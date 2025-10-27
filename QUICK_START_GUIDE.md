# Quick Start Guide - LearnQuest Team 4

## 🚀 Quick Access

### For Users (Students)
- **Main App:** http://localhost:5173
- **Login:** Use any user credentials from the database
- **Features:**
  - Browse and enroll in courses
  - Practice coding problems
  - Chat with AI coach
  - Take quizzes and get feedback
  - Complete certifications
  - View leaderboard

### For Admins
- **Admin Panel:** http://localhost:5174
- **Login:** Use admin account (role: "admin")
- **Access via Main App:** Click "Go to Admin Panel" button (visible only to admins)

## 📋 Common Tasks

### Starting the Application

#### Option 1: Using Docker (Recommended)
```bash
cd LearnQuest-Team4
docker-compose up
```

#### Option 2: Local Development
```bash
# Start API (from root directory)
cd services/api
python -m venv venv
./venv/Scripts/Activate.ps1  # On Windows
pip install -r requirements.txt
uvicorn src.main:app --reload --port 8000

# Start Web Frontend (new terminal)
cd apps/web-frontend
npm install
$env:VITE_API_URL='http://localhost:8000'
npm run dev

# Start Admin Frontend (new terminal)
cd apps/admin-frontend
npm install
npm run dev
```

### Access URLs
- **Web App:** http://localhost:5173
- **Admin Panel:** http://localhost:5174
- **API:** http://localhost:8000

## 🎓 Learning Flow

### As a Student
1. **Explore Courses**
   - Click "Courses" in sidebar
   - Browse available courses
   - Click on a course to see details

2. **Enroll and Learn**
   - Enroll in a course
   - Complete modules and lessons
   - Take quizzes to test understanding

3. **Practice Coding**
   - Go to "Practice" in sidebar
   - Solve coding problems
   - Get instant feedback

4. **Get Help**
   - Use "AI Coach" for personalized help
   - Ask questions and get explanations

5. **Earn Certifications**
   - Click "Certifications" in sidebar
   - Choose either:
     - **Course Certifications:** Industry-recognized certificates
     - **Proctored Tests:** Advanced skills validation
   - Complete tests and download certificates

6. **Track Progress**
   - View "Dashboard" for stats
   - Check "Leaderboard" for rankings

## 🛠️ Admin Tasks

### Managing Certifications
1. **Access Admin Panel**
   - Login with admin credentials
   - URL: http://localhost:5174

2. **Create Certification**
   - Click "Certifications" in sidebar
   - Click "Create New Certification"
   - Fill in details:
     - Title and Description
     - Difficulty (Easy, Medium, Tough)
     - Duration in minutes
     - Pass percentage
   - Save

3. **Add Questions**
   - Click "Manage Questions" on any certification
   - Add questions from available pool
   - Reorder and save

4. **Edit Certification**
   - Click "Edit" on any certification
   - Update fields and save

5. **Delete Certification**
   - Click "Delete" (only if no attempts exist)

### Other Admin Tasks
- **User Management:** Create, edit, delete users
- **Course Management:** Create and edit courses
- **Practice Zone:** Manage coding problems
- **Proctoring:** Review proctored test sessions

## 🔧 Troubleshooting

### Admin Panel Not Loading
1. Check if API is running: http://localhost:8000/api/health
2. Verify admin frontend is running: http://localhost:5174
3. Check browser console for errors
4. Verify authentication token in localStorage

### API Connection Issues
1. Ensure MongoDB is running
2. Check API logs for errors
3. Verify CORS settings in main.py
4. Check environment variables

### Certification Not Showing
1. Verify certification exists in database
2. Check if user has proper role
3. Refresh admin panel
4. Check API response in Network tab

## 📊 Key Features

### Unified Certification System
- **Single Entry Point:** "Certifications" in sidebar
- **Two Types Available:**
  - Course-based certifications
  - Proctored certifications
- **Complete Flow:** From topic selection to certificate download

### Admin Panel
- **Full CRUD Operations:** Create, Read, Update, Delete
- **Question Management:** Add/remove questions from certifications
- **User Management:** Complete user administration
- **Analytics:** View system metrics

### Student Features
- **Interactive Learning:** Courses with multimedia content
- **Coding Practice:** Real-time code execution
- **AI Tutor:** Get instant help and explanations
- **Gamification:** XP, streaks, and leaderboards
- **Certifications:** Earn industry-recognized certificates

## 🔐 Authentication

### Default Admin Account
- **Username:** admin (or check database)
- **Password:** (check seed scripts or database)
- **Role:** admin

### Creating Admin User
```bash
# Using Python script
cd scripts
python create_user.py --name "Admin" --email "admin@learnquest.com" --password "secure_password" --role admin

# Or use API directly (after starting API)
POST http://localhost:8000/api/auth/register
{
  "name": "Admin",
  "email": "admin@learnquest.com",
  "password": "secure_password",
  "role": "admin"
}
```

## 📱 Quick Actions

### Navigate to Certifications
1. Click "Certifications" in sidebar
2. Choose certification type
3. Follow on-screen instructions

### Access Admin Panel
1. Login to main app as admin
2. Look for "Go to Admin Panel" button
3. Or directly access http://localhost:5174

### Create Test Data
```bash
# Seed sample courses
python scripts/seed_database.py

# Populate realistic users
python scripts/populate_realistic_users.py

# Add practice problems
python scripts/seed_practice_problems.py
```

## 🎯 Success Indicators

### Application is Running Correctly When:
- ✅ All services start without errors
- ✅ Can login to web app
- ✅ Can access admin panel
- ✅ Certifications page loads
- ✅ Can create/edit certifications in admin panel
- ✅ Can start certification tests
- ✅ API responds at http://localhost:8000/api/health

## 📞 Support

- Check `ADMIN_PANEL_FIXES_SUMMARY.md` for detailed fixes
- Check `README.md` for general information
- Check `docs/` folder for detailed documentation
- Review console logs for troubleshooting

---

**Note:** Make sure MongoDB is running before starting the API. Use Docker Compose for easiest setup.

