# 🌐 Team Cloud Database Setup Guide

This guide will help you set up a shared cloud database so your entire team can work together on LearnQuest.

## 🚀 Quick Start (5 minutes)

### For Team Lead (Person setting up the database):

1. **Set up MongoDB Atlas (FREE):**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create free account
   - Create project "LearnQuest"
   - Create free cluster (M0 Sandbox)
   - Create database user: `learnquest_user`
   - Add network access: `0.0.0.0/0` (for development)
   - Get connection string

2. **Configure your project:**
   ```bash
   # Update .env file with your Atlas connection string
   nano .env
   ```

3. **Start services:**
   ```bash
   docker-compose up
   ```

4. **Share credentials with team:**
   - Send connection string to team
   - Share JWT secret key
   - Share any other environment variables

### For Team Members:

1. **Get credentials from team lead**

2. **Update your .env file:**
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit with team credentials
   nano .env
   ```

3. **Start services:**
   ```bash
   docker-compose up
   ```

4. **Verify connection:**
   ```bash
   curl http://localhost:8000/api/health
   ```

## 📋 Detailed Setup Instructions

### Step 1: MongoDB Atlas Setup

1. **Create Account:**
   - Visit [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Click "Try Free"
   - Sign up with email or Google

2. **Create Project:**
   - Click "New Project"
   - Name: "LearnQuest"
   - Click "Create Project"

3. **Create Cluster:**
   - Click "Build a Database"
   - Choose "M0 Sandbox" (FREE)
   - Provider: AWS
   - Region: Choose closest to your team
   - Cluster Name: "learnquest-cluster"
   - Click "Create Cluster"

4. **Create Database User:**
   - Go to "Database Access" → "Add New Database User"
   - Authentication Method: "Password"
   - Username: `learnquest_user`
   - Password: Generate strong password (save it!)
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

5. **Configure Network Access:**
   - Go to "Network Access" → "Add IP Address"
   - For development: Add `0.0.0.0/0` (allow from anywhere)
   - For production: Add specific IP addresses
   - Click "Confirm"

6. **Get Connection String:**
   - Go to "Clusters" → "Connect"
   - Choose "Connect your application"
   - Driver: "Python"
   - Version: "3.6 or later"
   - Copy the connection string

### Step 2: Configure Your Project

1. **Update .env file:**
   ```env
   # Replace with your Atlas connection string
   MONGO_URL=mongodb+srv://learnquest_user:YOUR_PASSWORD@learnquest-cluster.xxxxx.mongodb.net/
   MONGO_DB=learnquest
   
   # Use a strong secret for production
   JWT_SECRET_KEY=your-super-secret-jwt-key-change-in-production
   
   # Keep these as they are
   CHROMA_HOST=chroma
   CHROMA_PORT=8000
   OLLAMA_BASE_URL=http://host.docker.internal:11434
   ```

2. **Test the connection:**
   ```bash
   # Start services
   docker-compose up
   
   # Check if API is working
   curl http://localhost:8000/api/health
   
   # Check if database is connected
   curl http://localhost:8000/api/users/leaderboard
   ```

### Step 3: Share with Team

1. **Create team credentials file:**
   ```bash
   # Create a secure file with credentials
   cat > team_credentials.txt << EOF
   MONGO_URL=mongodb+srv://learnquest_user:YOUR_PASSWORD@learnquest-cluster.xxxxx.mongodb.net/
   MONGO_DB=learnquest
   JWT_SECRET_KEY=your-super-secret-jwt-key-change-in-production
   EOF
   ```

2. **Share securely:**
   - Send via Slack/Teams private message
   - Use encrypted file sharing
   - Never commit to git

3. **Team members setup:**
   ```bash
   # Each team member should:
   cp .env.example .env
   # Then update .env with the shared credentials
   ```

## 🔧 Alternative Cloud Database Options

### Option 2: Railway (Easy Setup)
1. Go to [Railway](https://railway.app)
2. Create account
3. Create new project
4. Add MongoDB service
5. Get connection string
6. Update .env file

### Option 3: MongoDB Atlas + Docker (Advanced)
For teams that want more control:

1. **Use MongoDB Atlas with Docker:**
   ```yaml
   # docker-compose.override.yml
   version: '3.8'
   services:
     api:
       environment:
         - MONGO_URL=${MONGO_URL}
         - MONGO_DB=${MONGO_DB}
       env_file:
         - .env
   ```

2. **Remove local MongoDB:**
   ```yaml
   # Comment out the db service in docker-compose.yml
   # db:
   #   image: mongo:7.0
   #   ports:
   #     - "27017:27017"
   ```

## 🛠️ Troubleshooting

### Connection Issues:
```bash
# Check if services are running
docker-compose ps

# Check API logs
docker-compose logs api

# Test database connection
docker exec learnquest-api-1 python -c "
from src.database import get_collection
users = get_collection('users')
print('Users count:', users.count_documents({}))
"
```

### Common Issues:

1. **"Authentication failed":**
   - Check username/password in connection string
   - Verify database user has correct permissions

2. **"Network access denied":**
   - Add your IP to Atlas network access
   - Use `0.0.0.0/0` for development (not recommended for production)

3. **"Connection timeout":**
   - Check if Atlas cluster is running
   - Verify connection string format

### Reset Everything:
```bash
# Stop all services
docker-compose down -v

# Remove all containers and volumes
docker system prune -a

# Start fresh
docker-compose up
```

## 🔒 Security Best Practices

1. **Never commit credentials to git:**
   ```bash
   # Add to .gitignore
   echo ".env" >> .gitignore
   echo "team_credentials.txt" >> .gitignore
   ```

2. **Use strong passwords:**
   - Generate random passwords for database users
   - Use strong JWT secrets
   - Rotate credentials regularly

3. **Limit network access:**
   - For production: Add specific IP addresses
   - For development: Use `0.0.0.0/0` temporarily

4. **Environment variables:**
   - Use different credentials for dev/staging/production
   - Never use production credentials in development

## 📊 Monitoring and Maintenance

### Check Database Status:
```bash
# Check connection
curl http://localhost:8000/api/health

# Check user count
curl http://localhost:8000/api/users/leaderboard
```

### Backup Strategy:
```bash
# Export current database
python scripts/export_database.py

# This creates a backup zip file
# Share with team if needed
```

### Team Sync:
```bash
# When team members need latest data
python scripts/import_database.py database_export_YYYYMMDD_HHMMSS.zip
```

## 🎯 Benefits of Cloud Database

✅ **Real-time collaboration** - Everyone sees the same data
✅ **No setup required** - New team members just need credentials
✅ **Automatic backups** - Atlas handles backups
✅ **Scalable** - Can handle more users as team grows
✅ **Secure** - Professional-grade security
✅ **Free tier** - No cost for small teams

## 🆘 Need Help?

1. **Check logs:** `docker-compose logs`
2. **Restart services:** `docker-compose restart`
3. **Reset everything:** `docker-compose down -v && docker-compose up`
4. **Ask team lead** for latest database export
5. **Check MongoDB Atlas** dashboard for connection status

## 📞 Support

- **MongoDB Atlas Docs:** https://docs.atlas.mongodb.com/
- **Docker Compose Docs:** https://docs.docker.com/compose/
- **LearnQuest Issues:** Create GitHub issue for project-specific problems

---

**🎉 You're all set! Your team can now work together on the same database!**
