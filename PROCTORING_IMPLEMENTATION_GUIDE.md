# AI Proctoring Implementation Guide

## Overview
Real-time webcam monitoring with GPU-accelerated AI detection for:
- Head pose (looking away)
- Prohibited objects (phone, book)
- Multiple people

## ✅ Completed Components

### 1. Backend AI Detector (`services/api/src/proctoring_detector.py`)
- MediaPipe Face Mesh for head pose estimation
- YOLOv8 for object/person detection
- GPU-accelerated processing
- Violation threshold system
- Base64 frame encoding

**Key Features:**
- `ProctoringDetector` class with `process_frame()` method
- Returns violations, stats, annotated frames
- Consecutive violation detection (5 frames threshold)
- Configurable thresholds (HEAD_YAW_THRESHOLD=25°, HEAD_PITCH_THRESHOLD=15°)

### 2. Backend API Routes (`services/api/src/routes/proctoring.py`)
- **WebSocket** `/api/proctoring/ws/{attempt_id}` - Real-time frame processing
- **GET** `/api/proctoring/session/{attempt_id}` - Get session details
- **GET** `/api/proctoring/violations/{attempt_id}` - Get all violations
- **GET** `/api/proctoring/admin/sessions` - Admin: All sessions
- **GET** `/api/proctoring/admin/violations` - Admin: All violations
- **POST** `/api/proctoring/session/{attempt_id}/flag` - Flag for review
- **GET** `/api/proctoring/stats/{attempt_id}` - Get proctoring statistics

**Database Collections:**
- `proctoring_sessions` - Session metadata, violation counts
- `proctoring_violations` - Individual violations with timestamps
- Links to `cert_attempts` for user info

### 3. Frontend Webcam Component (`apps/web-frontend/src/components/WebcamProctoring.jsx`)
- Real-time webcam capture
- WebSocket frame streaming
- Red border on violations
- Live violation warnings
- Head pose stats display
- Recent violations list
- Auto-start/stop lifecycle

**Key Features:**
- 640x480 video capture
- 1 second frame interval
- Base64 JPEG encoding
- Visual feedback (green/yellow/red borders)
- Permission handling

## 🔧 Required Integrations

### 4. Update CodingTestInterface

**File:** `apps/web-frontend/src/pages/CodingTestInterface.jsx`

Add import:
```javascript
import WebcamProctoring from '../components/WebcamProctoring';
```

Add state for violations:
```javascript
const [proctoringViolations, setProctoringViolations] = useState([]);

const handleViolation = (violations) => {
  setProctoringViolations(prev => [...violations, ...prev]);
  // Show toast notification
  violations.forEach(v => {
    toast.error(v.message, { duration: 3000 });
  });
};
```

Add component to layout (in left panel, below problem description):
```jsx
{/* After Test Cases section */}
<div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700">
  <h3 className="text-lg font-bold text-purple-400 mb-3">
    🎥 Proctoring Monitor
  </h3>
  <WebcamProctoring 
    attemptId={attemptId}
    onViolation={handleViolation}
  />
</div>
```

### 5. Create Test Results Page

**File:** `apps/web-frontend/src/pages/TestResults.jsx`

```jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { certTestsAPI } from '../services/api';
import { AlertTriangle, CheckCircle, XCircle, Eye } from 'lucide-react';

export const TestResults = () => {
  const { attemptId } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [proctoring, setProctoring] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, [attemptId]);

  const loadResults = async () => {
    try {
      // Get attempt results
      const attemptData = await certTestsAPI.getAttempt(attemptId);
      setAttempt(attemptData);

      // Get proctoring data
      const proctoringData = await certTestsAPI.getProctoringSession(attemptId);
      setProctoring(proctoringData);
    } catch (error) {
      console.error('Failed to load results:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Test Results</h1>

        {/* Score Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-gray-600 text-sm">Score</div>
              <div className="text-3xl font-bold text-blue-600">
                {attempt?.score || 0}%
              </div>
            </div>
            <div>
              <div className="text-gray-600 text-sm">Questions</div>
              <div className="text-2xl font-semibold">
                {attempt?.total_questions || 0}
              </div>
            </div>
            <div>
              <div className="text-gray-600 text-sm">Status</div>
              <div className={`text-lg font-semibold ${
                attempt?.status === 'passed' ? 'text-green-600' : 'text-red-600'
              }`}>
                {attempt?.status?.toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Proctoring Report */}
        {proctoring && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Proctoring Report
            </h2>

            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 rounded p-3">
                <div className="text-gray-600 text-sm">Total Violations</div>
                <div className="text-2xl font-bold text-red-600">
                  {proctoring.session?.total_violations || 0}
                </div>
              </div>
              <div className="bg-gray-50 rounded p-3">
                <div className="text-gray-600 text-sm">Looking Away</div>
                <div className="text-xl font-semibold">
                  {proctoring.session?.violation_counts?.looking_away || 0}
                </div>
              </div>
              <div className="bg-gray-50 rounded p-3">
                <div className="text-gray-600 text-sm">Phone Detected</div>
                <div className="text-xl font-semibold">
                  {proctoring.session?.violation_counts?.phone_detected || 0}
                </div>
              </div>
              <div className="bg-gray-50 rounded p-3">
                <div className="text-gray-600 text-sm">Multiple People</div>
                <div className="text-xl font-semibold">
                  {proctoring.session?.violation_counts?.multiple_people || 0}
                </div>
              </div>
            </div>

            {/* Violation Timeline */}
            <h3 className="text-lg font-semibold mb-3">Violation History</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {proctoring.violations?.map((v, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                  <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                    v.severity === 'high' ? 'text-red-600' : 'text-yellow-600'
                  }`} />
                  <div className="flex-1">
                    <div className="font-medium">{v.message}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(v.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    v.severity === 'high' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {v.severity.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Question Results */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Question Results</h2>
          {/* Add question-by-question results here */}
        </div>
      </div>
    </div>
  );
};
```

### 6. Create Admin Proctoring Dashboard

**File:** `apps/admin-frontend/src/pages/ProctoringMonitor.jsx`

```jsx
import React, { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import { Eye, AlertTriangle, Users, Flag } from 'lucide-react';

export const ProctoringMonitor = () => {
  const [sessions, setSessions] = useState([]);
  const [violations, setViolations] = useState([]);
  const [filter, setFilter] = useState('all'); // all, flagged, active
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [filter]);

  const loadData = async () => {
    try {
      const sessionsData = await adminAPI.getProctoringSessions();
      const violationsData = await adminAPI.getProctoringViolations({ limit: 50 });
      
      setSessions(sessionsData.sessions || []);
      setViolations(violationsData.violations || []);
    } catch (error) {
      console.error('Failed to load proctoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  const flagSession = async (attemptId, reason) => {
    try {
      await adminAPI.flagProctoringSession(attemptId, { reason });
      toast.success('Session flagged for review');
      loadData();
    } catch (error) {
      toast.error('Failed to flag session');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Proctoring Monitor</h1>
        <p className="text-gray-600">Real-time monitoring and violation tracking</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <div className="text-2xl font-bold">{sessions.length}</div>
              <div className="text-sm text-gray-600">Total Sessions</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <Eye className="w-8 h-8 text-green-600" />
            <div>
              <div className="text-2xl font-bold">
                {sessions.filter(s => s.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600">Active Now</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
            <div>
              <div className="text-2xl font-bold">{violations.length}</div>
              <div className="text-sm text-gray-600">Recent Violations</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <Flag className="w-8 h-8 text-red-600" />
            <div>
              <div className="text-2xl font-bold">
                {sessions.filter(s => s.flagged).length}
              </div>
              <div className="text-sm text-gray-600">Flagged</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Proctoring Sessions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">User</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Cert ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Started</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Violations</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sessions.map((session) => (
                <tr key={session._id} className={session.flagged ? 'bg-red-50' : ''}>
                  <td className="px-4 py-3 text-sm">{session.user_email || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm">{session.cert_id || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(session.started_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      session.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {session.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${
                      session.total_violations > 5 ? 'text-red-600' : 'text-gray-800'
                    }`}>
                      {session.total_violations || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => flagSession(session.attempt_id, 'High violations')}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Flag
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
```

## 🐍 Python Dependencies

### Update `services/api/requirements.txt`:

```txt
# Existing dependencies...

# AI Proctoring
opencv-python==4.8.1.78
mediapipe==0.10.8
ultralytics==8.1.20
torch==2.1.2+cu118  # GPU support
torchvision==0.16.2+cu118
```

### Update `services/api/Dockerfile`:

```dockerfile
FROM python:3.10-slim

# Install system dependencies for OpenCV and GPU
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    wget \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements
COPY requirements.txt .

# Install Python packages
RUN pip install --no-cache-dir -r requirements.txt

# Download YOLO model
RUN python -c "from ultralytics import YOLO; YOLO('yolov8n.pt')"

# Copy application
COPY . .

# Expose port
EXPOSE 8000

# Run with GPU support
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Update `docker-compose.yml`:

```yaml
services:
  api:
    build: ./services/api
    ports:
      - "8000:8000"
    environment:
      - CUDA_VISIBLE_DEVICES=0
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    volumes:
      - ./services/api:/app
    depends_on:
      - mongodb
```

## 🔌 Register Routes

### Update `services/api/src/main.py`:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routers
from .routes import problems, auth, certifications
from .routes import cert_tests_runtime, cert_tests_admin
from .routes import proctoring  # ADD THIS

app = FastAPI(title="LearnQuest API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(problems.router)
app.include_router(auth.router)
app.include_router(certifications.router)
app.include_router(cert_tests_runtime.router)
app.include_router(cert_tests_admin.router)
app.include_router(proctoring.router)  # ADD THIS
```

## 📝 API Client Updates

### Update `apps/web-frontend/src/services/api.js`:

```javascript
export const certTestsAPI = {
  // Existing methods...

  // Proctoring methods
  getProctoringSession: async (attemptId) => {
    const response = await api.get(`/proctoring/session/${attemptId}`);
    return response.data;
  },

  getProctoringStats: async (attemptId) => {
    const response = await api.get(`/proctoring/stats/${attemptId}`);
    return response.data;
  },
};
```

### Update `apps/admin-frontend/src/services/api.js`:

```javascript
export const adminAPI = {
  // Existing methods...

  // Proctoring methods
  getProctoringSessions: async () => {
    const response = await api.get('/proctoring/admin/sessions');
    return response.data;
  },

  getProctoringViolations: async (params) => {
    const response = await api.get('/proctoring/admin/violations', { params });
    return response.data;
  },

  flagProctoringSession: async (attemptId, data) => {
    const response = await api.post(`/proctoring/session/${attemptId}/flag`, data);
    return response.data;
  },
};
```

## 🚀 Deployment Steps

### 1. Install Python Dependencies

```bash
cd services/api
pip install opencv-python==4.8.1.78 mediapipe==0.10.8 ultralytics==8.1.20
```

### 2. Test GPU Access

```python
import torch
print(f"CUDA Available: {torch.cuda.is_available()}")
print(f"GPU: {torch.cuda.get_device_name(0)}")
```

### 3. Download YOLO Model

```python
from ultralytics import YOLO
model = YOLO('yolov8n.pt')  # Auto-downloads
```

### 4. Update Routes

```bash
# Register proctoring router in main.py
# Already shown above
```

### 5. Rebuild Docker

```bash
docker compose build api
docker compose up -d
```

### 6. Test WebSocket

Open browser console:
```javascript
const ws = new WebSocket('ws://localhost:8000/api/proctoring/ws/test123');
ws.onopen = () => console.log('Connected');
ws.onmessage = (e) => console.log(JSON.parse(e.data));
```

## 🧪 Testing Checklist

- [ ] Webcam permission granted
- [ ] Video preview shows in interface
- [ ] WebSocket connects successfully
- [ ] Frames sent every 1 second
- [ ] Border turns red on violation
- [ ] Warning messages appear
- [ ] Violations saved to database
- [ ] Results page shows violation history
- [ ] Admin dashboard displays sessions
- [ ] Admin can flag sessions

## 📊 Database Schema

### `proctoring_sessions`
```json
{
  "_id": "ObjectId",
  "attempt_id": "string",
  "started_at": "datetime",
  "ended_at": "datetime",
  "status": "active|completed",
  "total_violations": 0,
  "violation_counts": {
    "looking_away": 0,
    "phone_detected": 0,
    "multiple_people": 0,
    "no_face": 0,
    "prohibited_object": 0
  },
  "flagged": false,
  "flag_reason": "string",
  "flagged_by": "email",
  "flagged_at": "datetime"
}
```

### `proctoring_violations`
```json
{
  "_id": "ObjectId",
  "attempt_id": "string",
  "session_id": "string",
  "type": "looking_away|phone_detected|multiple_people|no_face|prohibited_object",
  "severity": "low|medium|high",
  "message": "string",
  "timestamp": "datetime",
  "metadata": {
    "yaw": 0.0,
    "pitch": 0.0,
    "person_count": 0
  }
}
```

## 🎯 Next Steps

1. **Immediate:**
   - Add proctoring router to `main.py`
   - Update requirements.txt
   - Rebuild API container

2. **Frontend Integration:**
   - Add `WebcamProctoring` to `CodingTestInterface`
   - Create `TestResults.jsx` page
   - Create `ProctoringMonitor.jsx` admin page
   - Update API clients

3. **Testing:**
   - Test with GPU
   - Test violations detection
   - Test WebSocket stability
   - Test database writes

4. **Optional Enhancements:**
   - Audio detection (speech recognition)
   - Screen recording
   - Eye gaze tracking
   - Automated flagging rules
   - Email alerts to admins

## 🔧 Troubleshooting

### "CUDA not available"
```bash
# Check NVIDIA driver
nvidia-smi

# Install CUDA toolkit
# Follow: https://developer.nvidia.com/cuda-downloads
```

### "ModuleNotFoundError: mediapipe"
```bash
pip install mediapipe==0.10.8
```

### "WebSocket connection failed"
```bash
# Check if port 8000 is open
netstat -an | findstr :8000

# Check CORS settings in main.py
```

### "Camera permission denied"
- Check browser settings (chrome://settings/content/camera)
- Use HTTPS for production
- Test with different browser

## 📚 References

- MediaPipe Face Mesh: https://google.github.io/mediapipe/solutions/face_mesh.html
- YOLOv8 Documentation: https://docs.ultralytics.com/
- WebSocket API: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
- CUDA Installation: https://docs.nvidia.com/cuda/cuda-installation-guide-microsoft-windows/
