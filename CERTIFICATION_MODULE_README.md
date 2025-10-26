# LearnQuest Certification Module

A comprehensive real-time exam proctoring system with AI-powered monitoring, identity verification, and automated certificate issuance.

## 🚀 Features

### Real-Time Proctoring
- **Face Detection & Monitoring**: YOLOv8-powered real-time face detection
- **Identity Verification**: DeepFace-based user identity verification
- **Audio Monitoring**: Real-time noise and speech detection using librosa and webrtcvad
- **Behavior Scoring**: Automated violation detection and scoring
- **Tab Switching Detection**: Browser-based monitoring for unauthorized tab switches

### Certification Flow
- **Topic Selection**: Choose from 8+ technology topics
- **Difficulty Levels**: Easy, Medium, Hard with different time limits and question counts
- **Proctored Testing**: Full-screen, monitored exam environment
- **Automated Scoring**: Combined test performance and behavior scoring
- **Certificate Issuance**: Automatic certificate generation for passing scores

### Security & Compliance
- **Privacy-First**: No video/audio recording - all processing in-memory
- **Violation Logging**: Comprehensive audit trail in MongoDB
- **Secure Authentication**: JWT-based session management
- **Real-Time Monitoring**: Live proctoring status and violation alerts

## 🏗️ Architecture

### Backend (FastAPI + Python)
```
services/api/src/
├── models/
│   └── proctoring.py          # Pydantic models for proctoring
├── services/
│   ├── proctoring_service.py  # Core AI proctoring logic
│   └── realtime_monitor.py   # Real-time monitoring service
└── routes/
    └── proctoring.py          # FastAPI routes for proctoring
```

### Frontend (React + Tailwind CSS)
```
apps/web-frontend/src/
├── pages/
│   ├── CertificationLanding.jsx      # Landing page
│   ├── CertificationTopics.jsx      # Topic selection
│   ├── CertificationDifficulty.jsx   # Difficulty selection
│   ├── TestEnvironmentSetup.jsx    # Pre-test setup
│   ├── PreTestRequirements.jsx      # Requirements check
│   ├── ProctoredTest.jsx           # Main test interface
│   └── TestResults.jsx             # Results and certificates
└── services/
    └── proctoringAPI.js            # API client
```

### Database (MongoDB)
- **test_sessions**: Test results and violation logs
- **certificates**: Issued certificates and verification codes
- **proctoring_sessions**: Active monitoring sessions

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.9+
- Node.js 18+
- Docker & Docker Compose (optional)
- MongoDB (local or cloud)

### Quick Setup

1. **Clone and Setup**
```bash
git clone <your-repo>
cd LearnQuest-Team4
python setup_proctoring.py
```

2. **Configure Environment**
```bash
# Edit .env files with your configuration
cp env.example .env
# Configure MongoDB URL, JWT secrets, etc.
```

3. **Start Services**

**Option A: Docker (Recommended)**
```bash
docker-compose up -d
```

**Option B: Local Development**
```bash
# Windows
start_learnquest.bat

# Unix/Linux/Mac
./start_learnquest.sh
```

### Manual Setup

1. **Backend Setup**
```bash
cd services/api
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn src.main:app --reload --port 8000
```

2. **Frontend Setup**
```bash
cd apps/web-frontend
npm install
npm run dev
```

3. **Admin Frontend Setup**
```bash
cd apps/admin-frontend
npm install
npm run dev
```

## 📋 API Endpoints

### Proctoring Endpoints
- `POST /api/proctoring/register-face` - Register user face for verification
- `POST /api/proctoring/start-session` - Start proctoring session
- `POST /api/proctoring/stop-session/{session_id}` - Stop proctoring session
- `POST /api/proctoring/process-frame/{session_id}` - Process video frame
- `GET /api/proctoring/session-status/{session_id}` - Get session status
- `GET /api/proctoring/active-sessions` - Get all active sessions

### Certificate Endpoints
- `POST /api/proctoring/save-test-session` - Save test results
- `POST /api/proctoring/issue-certificate` - Issue certificate
- `GET /api/proctoring/certificate/{certificate_id}` - Get certificate
- `GET /api/proctoring/user-certificates/{user_id}` - Get user certificates
- `GET /api/proctoring/verify-certificate/{verification_code}` - Verify certificate

## 🎯 Usage Guide

### For Students

1. **Access Certification**
   - Navigate to `/certification`
   - Select your topic (React.js, Python, etc.)
   - Choose difficulty level (Easy/Medium/Hard)

2. **Pre-Test Setup**
   - Complete identity verification
   - Allow camera and microphone access
   - Ensure full-screen mode

3. **Take Test**
   - Answer questions in monitored environment
   - Maintain proper behavior (face visible, no noise)
   - Complete within time limit

4. **View Results**
   - See detailed score breakdown
   - Download certificate if passed
   - Retake test if needed

### For Administrators

1. **Monitor Sessions**
   - View active proctoring sessions
   - Check violation logs
   - Manage certificates

2. **Configure Settings**
   - Adjust proctoring thresholds
   - Set violation penalties
   - Manage user permissions

## 🔧 Configuration

### Proctoring Settings
```python
# services/api/.env
FACE_DETECTION_THRESHOLD=0.5
NOISE_THRESHOLD_DB=40.0
SPEECH_DETECTION_ENABLED=true
FACE_ABSENCE_TIMEOUT=5
HEAD_TURN_THRESHOLD=0.3
MAX_VIOLATIONS=10
BEHAVIOR_SCORE_WEIGHT=0.4
TEST_SCORE_WEIGHT=0.6
```

### Behavior Scoring
- **Face Absent >5s**: -5 points
- **Head Turned Frequently**: -3 points
- **Multiple Faces**: -10 points
- **Speech from Others**: -5 points
- **Ambient Noise**: -3 points
- **Tab Switching**: -5 points

### Certificate Requirements
- **Final Score**: ≥85%
- **Behavior Score**: ≥70%
- **Max Violations**: ≤10
- **No Severe Violations**: Severity <8

## 🚨 Troubleshooting

### Common Issues

1. **Camera Not Working**
   - Check browser permissions
   - Ensure HTTPS in production
   - Verify camera is not in use by other apps

2. **Audio Issues**
   - Check microphone permissions
   - Verify audio device selection
   - Test audio levels

3. **Model Loading Errors**
   - Ensure sufficient disk space
   - Check internet connection for model downloads
   - Verify Python dependencies

4. **Performance Issues**
   - Reduce video resolution
   - Lower frame rate
   - Close unnecessary applications

### Debug Mode
```bash
# Enable debug logging
export LOG_LEVEL=DEBUG
python services/api/src/main.py
```

## 🔒 Security Considerations

### Privacy Protection
- No video/audio recording or storage
- All processing done in-memory
- Violation logs contain only metadata
- Face encodings stored securely

### Access Control
- JWT-based authentication
- Session-based authorization
- Role-based permissions
- Secure API endpoints

### Data Protection
- Encrypted data transmission
- Secure database connections
- Regular security updates
- Audit trail maintenance

## 📊 Monitoring & Analytics

### Real-Time Metrics
- Active proctoring sessions
- Violation rates by type
- Average behavior scores
- Test completion rates

### Historical Data
- Certificate issuance statistics
- Performance trends
- User engagement metrics
- System reliability data

## 🚀 Deployment

### Production Deployment

1. **Environment Setup**
```bash
# Set production environment variables
export NODE_ENV=production
export MONGO_URL=mongodb://your-production-db
export JWT_SECRET_KEY=your-secure-secret
```

2. **Docker Production**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

3. **Kubernetes Deployment**
```bash
kubectl apply -f infra/k8s/
```

### Scaling Considerations
- **Horizontal Scaling**: Multiple API instances
- **Load Balancing**: Nginx reverse proxy
- **Database**: MongoDB replica sets
- **Monitoring**: Prometheus + Grafana

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

### Code Standards
- Python: PEP 8, Black formatter
- JavaScript: ESLint, Prettier
- Documentation: Comprehensive docstrings
- Testing: Unit and integration tests

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

### Documentation
- [API Documentation](./docs/api-spec.md)
- [Deployment Guide](./docs/deployment.md)
- [Design System](./docs/design-system.md)

### Community
- GitHub Issues for bug reports
- Discussions for feature requests
- Discord for community support

---

**Built with ❤️ for secure, fair, and accessible online certification**
