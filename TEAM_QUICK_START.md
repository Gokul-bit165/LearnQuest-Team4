# 🚀 Quick Start Guide for Team Members

## Windows Users

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd LearnQuest
   ```

2. **Run the setup script:**
   ```powershell
   .\scripts\team_setup.ps1
   ```

3. **That's it!** The script will:
   - Set up the cloud database connection
   - Start all Docker services
   - Open the application in your browser

## macOS/Linux Users

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd LearnQuest
   ```

2. **Run the setup script:**
   ```bash
   ./scripts/team_setup.sh
   ```

3. **That's it!** The script will:
   - Set up the cloud database connection
   - Start all Docker services
   - Open the application in your browser (macOS only)

## Manual Setup (Alternative)

If the scripts don't work, follow the manual steps:

1. **Create the .env file:**
   ```bash
   # Create services/api/.env with this content:
   MONGO_URL=mongodb+srv://gokul9942786_db_user:eTMzG8J5Z3hC86C0@cluster0.qvkilbo.mongodb.net/learnquest?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET_KEY=your-shared-jwt-secret-key
   ```

2. **Start the services:**
   ```bash
   docker compose up -d
   ```

3. **Open the application:**
   - Go to: http://localhost:3000
   - Login with: `student@learnquest.com` / `password123`

## What You'll Get

- ✅ **6 Comprehensive Courses** with quizzes and lessons
- ✅ **AI Tutor** that answers questions about course content
- ✅ **Real-time Leaderboard** with user rankings
- ✅ **Shared Cloud Database** - all team members see the same data
- ✅ **Admin Panel** for course management

## Troubleshooting

If something goes wrong:

1. **Check if Docker is running:**
   ```bash
   docker ps
   ```

2. **Check service logs:**
   ```bash
   docker compose logs api
   docker compose logs web
   ```

3. **Restart services:**
   ```bash
   docker compose down
   docker compose up -d
   ```

## Need Help?

- Check the full guide: `TEAM_SETUP_GUIDE.md`
- Contact the team lead
- Check the troubleshooting section in the full guide

---

**Ready to start learning?** 🎓
