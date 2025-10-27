# Certification System - File Structure

## Overview
This document shows where all certification proctoring files are located and how they integrate with the existing LearnQuest system.

## File Structure

### Backend (services/)

```
services/api/src/
├── services/
│   └── proctoring.py                    ← AI proctoring service (YOLOv8 + MediaPipe)
├── routes/
│   ├── certifications.py                 ← Existing certifications API (enhanced)
│   ├── proctoring.py                     ← NEW: Proctoring API endpoints
│   └── admin/
│       ├── __init__.py                   ← Updated to include proctoring routes
│       ├── certifications.py             ← Existing admin certifications
│       └── proctoring.py                 ← NEW: Admin proctoring review routes
├── models/
│   └── certification.py                   ← Existing certification models
└── main.py                               ← Updated: Added proctoring router & lifespan
```

**Backend API Endpoints:**
- `/api/certifications/start` - Start test attempt
- `/api/certifications/submit` - Submit test
- `/api/certifications/event` - Log events
- `/api/ai/proctor` - Process images for violations
- `/api/ai/proctor/audio` - Process audio events
- `/api/admin/proctoring/attempts` - List all attempts
- `/api/admin/proctoring/attempts/{id}/proctoring-logs` - Get logs
- `/api/admin/proctoring/attempts/{id}/violations` - Get violations
- `/api/admin/proctoring/attempts/{id}/review` - Override scores

### Frontend - User App (apps/web-frontend/)

```
apps/web-frontend/src/
├── components/
│   └── certification/
│       ├── ProctoringMonitor.jsx         ← NEW: Camera/mic monitoring
│       ├── CertificationTest.jsx          ← NEW: Full-screen test interface
│       ├── index.css                      ← NEW: Styles for proctoring
│       ├── CertificationLanding.jsx      ← Existing
│       ├── TopicSelection.jsx             ← Existing
│       └── ... (other existing components)
├── pages/
│   ├── CertificationsListPage.jsx        ← NEW: Browse certifications
│   ├── CertificationTestPage.jsx         ← NEW: Test page with consent
│   ├── CertificationPage.jsx             ← Existing (legacy)
│   └── ... (other pages)
├── components/
│   └── Sidebar.jsx                       ← Updated: Added Certifications link
└── App.jsx                               ← Updated: Added test route
```

### Frontend - Admin App (apps/admin-frontend/)

```
apps/admin-frontend/src/
├── pages/
│   ├── ProctoringReview.jsx             ← NEW: Review proctoring attempts
│   ├── Certifications.jsx                ← Existing
│   ├── CertificationQuestions.jsx       ← Existing
│   └── ... (other pages)
├── components/
│   └── Layout.jsx                         ← Updated: Added Proctoring Review link
└── App.jsx                               ← Updated: Added proctoring route
```

### Documentation

```
docs/
└── CERTIFICATION_PROCTORING.md          ← NEW: Full technical documentation

CERTIFICATION_SETUP.md                   ← NEW: Setup guide
CERTIFICATION_STRUCTURE.md               ← This file
```

## Docker Structure

The system works with `docker-compose.yml`:

```
├── web (apps/web-frontend)              ← User-facing app
├── admin-frontend                        ← Admin panel app
├── api (services/api)                   ← Backend API with proctoring
└── ... (judge0, chroma, etc.)
```

## No Duplicates

All files are properly organized:
- **Backend**: All in `services/api/src/` - no duplicates
- **User Frontend**: All in `apps/web-frontend/src/` - no duplicates
- **Admin Frontend**: All in `apps/admin-frontend/src/` - no duplicates
- **Documentation**: All in root or `docs/`

## Files Created vs. Modified

### NEW Files Created

**Backend:**
- `services/api/src/services/proctoring.py`
- `services/api/src/routes/proctoring.py`
- `services/api/src/routes/admin/proctoring.py`

**User Frontend:**
- `apps/web-frontend/src/components/certification/ProctoringMonitor.jsx`
- `apps/web-frontend/src/components/certification/CertificationTest.jsx`
- `apps/web-frontend/src/components/certification/index.css`
- `apps/web-frontend/src/pages/CertificationsListPage.jsx`
- `apps/web-frontend/src/pages/CertificationTestPage.jsx`

**Admin Frontend:**
- `apps/admin-frontend/src/pages/ProctoringReview.jsx`

**Documentation:**
- `docs/CERTIFICATION_PROCTORING.md`
- `CERTIFICATION_SETUP.md`
- `CERTIFICATION_STRUCTURE.md` (this file)

### Files Modified

**Backend:**
- `services/api/src/main.py` - Added proctoring router & lifespan
- `services/api/requirements.txt` - Added proctoring dependencies
- `services/api/src/routes/admin/__init__.py` - Added proctoring router

**User Frontend:**
- `apps/web-frontend/src/App.jsx` - Added test route
- `apps/web-frontend/src/components/Sidebar.jsx` - Added Certifications link

**Admin Frontend:**
- `apps/admin-frontend/src/App.jsx` - Added proctoring route
- `apps/admin-frontend/src/components/Layout.jsx` - Added Proctoring Review link

## How It Works

### User Flow (apps/web-frontend/)
1. User clicks "Certifications" in sidebar
2. Sees list of available certifications
3. Clicks "Start Test" on desired certification
4. Grants camera/mic permission in consent modal
5. Takes full-screen proctored test
6. Submits answers
7. Views results

### Admin Flow (apps/admin-frontend/)
1. Admin clicks "Proctoring Review" in sidebar
2. Sees all test attempts with violations
3. Clicks "View Details" on an attempt
4. Reviews proctoring logs and violations
5. Optionally overrides behavior score
6. Reviews and approves/denies certificates

### Backend Processing (services/api/)
1. On startup: Load YOLOv8 and MediaPipe models
2. On test start: Create attempt record
3. During test: Receive images every 10s
4. Process images with AI models
5. Detect violations (phone, multiple people, etc.)
6. Update behavior score
7. Log all events to database
8. On submit: Calculate final score

## Running with Docker

```bash
# Start all services
docker-compose up

# Backend API with proctoring
docker-compose up api

# Frontend apps
docker-compose up web admin-frontend

# Full stack
docker-compose up
```

## Testing

1. **Start services**: `docker-compose up`
2. **Create certification**: Admin panel → Certifications → Create
3. **Add questions**: Admin panel → Certifications → Questions
4. **Take test**: User app → Certifications → Start Test
5. **Review**: Admin panel → Proctoring Review → View Details

## Configuration

All configuration is in:
- `services/api/src/services/proctoring.py` - Penalty values
- `apps/web-frontend/src/components/certification/ProctoringMonitor.jsx` - Capture interval
- `services/api/src/routes/certifications.py` - Score weights

## No Confusion

- **User features** → `apps/web-frontend/`
- **Admin features** → `apps/admin-frontend/`
- **Backend logic** → `services/api/src/`
- **All organized**, no duplicates, no confusion

