# 🚀 LearnQuest Certification Module - Complete Setup Guide

## 📋 Overview

This guide will help you set up the complete LearnQuest platform with the new **Real-Time Exam Proctoring Module** for certifications. The system includes AI-powered monitoring, identity verification, and automated certificate issuance.

## 🎯 What You'll Get

- **Complete Certification Flow**: Landing page → Topic selection → Difficulty → Setup → Proctored test → Results
- **AI-Powered Proctoring**: Real-time face detection, audio monitoring, behavior scoring
- **Professional UI**: Modern, responsive design matching your provided mockups
- **Secure Architecture**: Privacy-first approach with no video/audio storage
- **Full Integration**: Seamlessly integrated with existing LearnQuest platform

## 🛠️ Prerequisites

### Required Software
- **Python 3.9+** (for backend AI processing)
- **Node.js 18+** (for frontend applications)
- **Docker & Docker Compose** (recommended for easy setup)
- **MongoDB** (local or cloud - Atlas recommended)

### System Requirements
- **RAM**: 8GB+ (16GB recommended for AI models)
- **Storage**: 10GB+ free space
- **GPU**: Optional but recommended for faster AI processing
- **Webcam & Microphone**: Required for proctoring features

## 🚀 Quick Start (Recommended)

### Step 1: Clone and Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd LearnQuest-Team4

# Run the automated setup script
python setup_proctoring.py
```

### Step 2: Configure Environment
```bash
# The setup script creates .env files, but you should customize them
# Edit the following files with your specific configuration:

# Root .env file
nano .env

# API .env file  
nano services/api/.env
```

**Key configurations to update:**
```bash
# MongoDB Configuration
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/learnquest
MONGO_DB=learnquest

# JWT Secret (CHANGE THIS!)
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this-in-production

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Step 3: Start with Docker (Easiest)
```bash
# Build and start all services
docker-compose up -d

# Check if everything is running
docker-compose ps

# View logs if needed
docker-compose logs -f
```

### Step 4: Access the Application
- **Main Application**: http://localhost:3000
- **Certification Module**: http://localhost:3000/certification
- **Admin Dashboard**: http://localhost:5174
- **API Documentation**: http://localhost:8000/docs

## 🔧 Manual Setup (Alternative)

If you prefer to run services individually:

### Backend Setup
```bash
cd services/api

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Unix/Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the API server
uvicorn src.main:app --reload --port 8000
```

### Frontend Setup
```bash
# Terminal 1 - Web Frontend
cd apps/web-frontend
npm install
npm run dev

# Terminal 2 - Admin Frontend  
cd apps/admin-frontend
npm install
npm run dev
```

## 📱 Using the Certification Module

### For Students

1. **Navigate to Certification**
   ```
   http://localhost:3000/certification
   ```

2. **Select Topic**
   - Choose from 8+ technology topics (React.js, Python, etc.)
   - Each topic has professional icons and descriptions

3. **Choose Difficulty**
   - **Easy**: 20 questions, 30 minutes, 70% to pass
   - **Medium**: 30 questions, 45 minutes, 75% to pass  
   - **Hard**: 40 questions, 60 minutes, 85% to pass

4. **Complete Setup**
   - Enter your full name for identity verification
   - Allow camera and microphone access
   - Ensure you're in a quiet, well-lit environment

5. **Take Proctored Test**
   - Full-screen mode with real-time monitoring
   - AI-powered face detection and audio monitoring
   - Behavior scoring based on violations
   - Live proctoring status display

6. **View Results**
   - Detailed score breakdown (Test + Behavior)
   - Violation logs and explanations
   - Certificate download if passed (≥85% final score)

### For Administrators

1. **Monitor Active Sessions**
   ```
   GET /api/proctoring/active-sessions
   ```

2. **View Violation Logs**
   ```
   GET /api/proctoring/test-sessions/{user_id}
   ```

3. **Manage Certificates**
   ```
   GET /api/proctoring/user-certificates/{user_id}
   GET /api/proctoring/verify-certificate/{code}
   ```

## 🔍 Testing the System

### 1. Test Basic Functionality
```bash
# Check API health
curl http://localhost:8000/api/health

# Test proctoring endpoints
curl http://localhost:8000/api/proctoring/active-sessions
```

### 2. Test Certification Flow
1. Go to http://localhost:3000/certification
2. Select "React.js" topic
3. Choose "Easy" difficulty
4. Complete the setup process
5. Take a sample test
6. Verify results and certificate generation

### 3. Test Proctoring Features
- **Face Detection**: Move your face in/out of frame
- **Audio Monitoring**: Make noise or speak
- **Tab Switching**: Try switching tabs during test
- **Violation Logging**: Check violation logs in database

## 🐛 Troubleshooting

### Common Issues

**1. Camera/Microphone Not Working**
```bash
# Check browser permissions
# Ensure HTTPS in production
# Verify devices aren't in use by other apps
```

**2. AI Models Not Loading**
```bash
# Check internet connection
# Verify sufficient disk space
# Check Python dependencies
pip install ultralytics deepface opencv-python
```

**3. MongoDB Connection Issues**
```bash
# Check connection string
# Verify network access
# Check authentication credentials
```

**4. Docker Issues**
```bash
# Restart Docker Desktop
# Check port conflicts
# Clear Docker cache
docker system prune -a
```

### Debug Mode
```bash
# Enable debug logging
export LOG_LEVEL=DEBUG
python services/api/src/main.py
```

### Performance Optimization
```bash
# Reduce video resolution for better performance
# Close unnecessary applications
# Use GPU acceleration if available
```

## 📊 Monitoring & Maintenance

### Health Checks
```bash
# API Health
curl http://localhost:8000/api/health

# Service Status
docker-compose ps

# Log Monitoring
docker-compose logs -f api
```

### Database Maintenance
```bash
# Backup database
mongodump --uri="your-mongodb-uri"

# Clean up old sessions
# (Implement cleanup scripts as needed)
```

### Performance Monitoring
- Monitor CPU usage during proctoring
- Check memory usage for AI models
- Track violation rates and patterns
- Monitor certificate issuance rates

## 🔒 Security Considerations

### Production Deployment
1. **Change Default Secrets**
   ```bash
   # Generate secure JWT secret
   openssl rand -hex 32
   ```

2. **Enable HTTPS**
   ```bash
   # Use reverse proxy (Nginx)
   # Configure SSL certificates
   ```

3. **Database Security**
   ```bash
   # Use MongoDB Atlas
   # Enable IP whitelisting
   # Use strong authentication
   ```

4. **Environment Variables**
   ```bash
   # Never commit .env files
   # Use secure secret management
   # Rotate secrets regularly
   ```

## 📈 Scaling & Production

### Horizontal Scaling
```yaml
# docker-compose.prod.yml
services:
  api:
    deploy:
      replicas: 3
  web:
    deploy:
      replicas: 2
```

### Load Balancing
```nginx
# nginx.conf
upstream api {
    server api1:8000;
    server api2:8000;
    server api3:8000;
}
```

### Database Scaling
- Use MongoDB replica sets
- Implement connection pooling
- Monitor query performance

## 🎓 Team Onboarding

### For New Team Members

1. **Read Documentation**
   - [CERTIFICATION_MODULE_README.md](./CERTIFICATION_MODULE_README.md)
   - [API Documentation](./docs/api-spec.md)
   - [Design System](./docs/design-system.md)

2. **Set Up Development Environment**
   ```bash
   python setup_proctoring.py
   ```

3. **Run Test Suite**
   ```bash
   # Backend tests
   cd services/api
   python -m pytest

   # Frontend tests
   cd apps/web-frontend
   npm test
   ```

4. **Explore the Codebase**
   - Start with the certification flow
   - Understand the proctoring architecture
   - Review API endpoints

### Development Workflow
1. Create feature branch
2. Make changes with tests
3. Test locally
4. Submit pull request
5. Code review and merge

## 📞 Support & Resources

### Documentation
- [Complete API Reference](./docs/api-spec.md)
- [Deployment Guide](./docs/deployment.md)
- [Design System](./docs/design-system.md)
- [Google OAuth Setup](./docs/GOOGLE_OAUTH_SETUP.md)

### Community
- GitHub Issues for bug reports
- Discussions for feature requests
- Discord for real-time support

### Professional Support
- Custom implementation services
- Training and consultation
- Enterprise deployment support

---

## 🎉 Congratulations!

You now have a complete, production-ready certification system with:

✅ **Real-time AI proctoring**  
✅ **Professional UI/UX**  
✅ **Secure architecture**  
✅ **Automated certificate issuance**  
✅ **Comprehensive monitoring**  
✅ **Scalable deployment**  

**Ready to certify the world! 🌍**

For any questions or issues, refer to the troubleshooting section or create a GitHub issue.
