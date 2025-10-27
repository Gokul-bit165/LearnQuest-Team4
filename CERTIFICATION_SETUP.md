# Certification Proctoring System - Setup Guide

## What's Been Implemented

A complete certification system with AI-powered proctoring has been added to your LearnQuest platform.

### ✅ Features Implemented

1. **Proctoring Backend** (`services/api/src/services/proctoring.py`)
   - YOLOv8 for object detection (phones, people)
   - MediaPipe for face detection
   - Behavior scoring system
   - Automatic violation detection

2. **API Endpoints**
   - `/api/ai/proctor` - Image processing for violations
   - `/api/ai/proctor/audio` - Audio anomaly detection
   - `/api/certifications/start` - Start test
   - `/api/certifications/submit` - Submit answers
   - Admin endpoints for reviewing attempts

3. **Frontend Components**
   - `ProctoringMonitor.jsx` - Webcam/mic monitoring
   - `CertificationTest.jsx` - Full-screen test interface
   - `CertificationTestPage.jsx` - Test page with consent
   - `CertificationsListPage.jsx` - List available certifications

4. **Security Features**
   - Tab switch detection
   - Full-screen enforcement
   - Copy/paste prevention
   - Multiple people detection
   - Phone detection
   - Audio anomaly detection

5. **Admin Panel**
   - View all attempts
   - Review proctoring logs
   - Override behavior scores
   - Export for auditing

## Installation

### 1. Install Backend Dependencies

```bash
cd services/api
pip install mediapipe==0.10.8 opencv-python-headless==4.8.1.78 ultralytics==8.0.196
```

Dependencies are already in `requirements.txt` - just install them.

### 2. Start Backend

```bash
cd services/api
python -m uvicorn src.main:app --reload --port 8000
```

Models will load automatically on startup (first time may take a minute).

### 3. Start Frontend

```bash
cd apps/web-frontend
npm install  # if needed
npm run dev
```

### 4. Create Certifications (Admin Panel)

Visit http://localhost:5174 and create certifications with questions.

## Usage

### For Users

1. Navigate to "Certifications" in sidebar
2. Select a certification to start
3. Accept consent for camera/mic access
4. Take the full-screen proctored test
5. View results and download certificate (if passed)

### For Admins

1. Go to Admin Panel
2. Create certifications via "Certifications" page
3. Add questions to each certification
4. Review test attempts in "Proctoring" section
5. Override scores if needed

## How It Works

### Proctoring Flow

1. **User starts test** → Consent modal shown
2. **Media access granted** → Camera/mic activated
3. **Test begins** → Full-screen mode enforced
4. **Monitoring active** → Frames captured every 10s
5. **AI analysis** → YOLOv8 + MediaPipe process images
6. **Violations logged** → Behavior score updated
7. **Test submitted** → Final score calculated
8. **Certificate generated** → If passed

### Detection Types

- **Face not detected** → -15 points
- **Phone detected** → -25 points  
- **Multiple people** → -30 points
- **Tab switched** → -10 points
- **Audio anomalies** → -5 to -20 points

### Score Calculation

```
Final = (Test Score × 0.7) + (Behavior Score × 0.3)
Pass = Final Score >= 85%
```

## Testing

### Create Test Certification

1. Admin Panel → Certifications
2. Create new certification with:
   - Title, description
   - Difficulty level
   - Duration (minutes)
   - Pass percentage
   - Select questions

### Take Test

1. Go to Certifications page
2. Click "Start Test"
3. Grant permissions
4. Take test
5. Submit when done

## Troubleshooting

### Models Not Loading
```bash
# Check logs for errors
# Verify internet connection (first-time model download)
# Ensure sufficient disk space
```

### Camera Not Working
- Check browser permissions
- Try different browser
- Verify device availability

### Performance Issues
- Reduce capture interval in `ProctoringMonitor.jsx`
- Use GPU if available
- Optimize image quality

## Files Created

### Backend
- `services/api/src/services/proctoring.py` - Proctoring service
- `services/api/src/routes/proctoring.py` - Proctoring API
- `services/api/src/routes/admin/proctoring.py` - Admin routes

### Frontend
- `apps/web-frontend/src/components/certification/ProctoringMonitor.jsx`
- `apps/web-frontend/src/components/certification/CertificationTest.jsx`
- `apps/web-frontend/src/components/certification/index.css`
- `apps/web-frontend/src/pages/CertificationTestPage.jsx`
- `apps/web-frontend/src/pages/CertificationsListPage.jsx`

### Documentation
- `docs/CERTIFICATION_PROCTORING.md` - Full documentation
- `CERTIFICATION_SETUP.md` - This file

## Next Steps

1. **Test the system** - Create a certification and take a test
2. **Review logs** - Check admin panel for proctoring data
3. **Adjust thresholds** - Fine-tune behavior penalties
4. **Add more questions** - Populate certification database
5. **Train models** - Optional: train custom detection models

## Customization

### Change Scoring Weights
Edit `services/api/src/routes/certifications.py`:
```python
final_score = int((test_score * 0.7) + (behavior_score * 0.3))
```

### Adjust Penalties
Edit `services/api/src/services/proctoring.py`:
```python
penalties = {
    'phone_detected': 25,  # Change values
    ...
}
```

### Modify Capture Interval
Edit `apps/web-frontend/src/components/certification/ProctoringMonitor.jsx`:
```javascript
setInterval(..., 10000);  // 10 seconds
```

## Docker Deployment

The system works with Docker. Update `docker-compose.yml` if needed:

```yaml
services:
  api:
    build: ./services/api
    # Add GPU support if available
    environment:
      - GPU_ENABLED=true
```

## Production Considerations

1. **HTTPS required** - Media access needs secure context
2. **Data retention** - Configure retention policy
3. **Privacy policy** - Update consent modal
4. **Performance** - Monitor server load
5. **Backup** - Regular database backups
6. **Monitoring** - Set up logging/alerts

## Support

- See `docs/CERTIFICATION_PROCTORING.md` for detailed docs
- Check backend logs for errors
- Review proctoring service code for customization

## License

Same as parent LearnQuest project.

