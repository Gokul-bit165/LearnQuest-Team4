# Certification Proctoring System - Changes Summary

## What Was Fixed

### 1. Docker Setup ✅
- **Added proctoring dependencies to Dockerfile** (`services/api/Dockerfile`)
  - Installs `mediapipe`, `opencv-python-headless`, and `ultralytics` packages
  - These are installed during Docker build

### 2. Admin Panel API URLs ✅
- **Fixed API URLs in admin frontend** (`apps/admin-frontend/src/pages/Certifications.jsx`)
  - Added `API_BASE_URL` constant using environment variable
  - Fixed all API calls to use correct endpoints:
    - `GET /api/admin/certifications/` - List certifications
    - `POST /api/admin/certifications/` - Create certification
    - `PUT /api/admin/certifications/{id}` - Update certification
    - `DELETE /api/admin/certifications/{id}` - Delete certification

### 3. Backend Router Configuration ✅
- **Fixed certification router prefix** (`services/api/src/routes/admin/certifications.py`)
  - Removed duplicate prefix from router definition
  - Prefix is applied in `__init__.py` at line 16

### 4. Structure - NO Duplicates ✅
- **User features** → `apps/web-frontend/` (port 3000)
  - Certifications listed in sidebar
  - Test taking interface
  - Results display
- **Admin features** → `apps/admin-frontend/` (port 5174)
  - Create/manage certifications
  - Review proctoring logs
  - Override behavior scores
- **Backend** → `services/api/src/` (port 8000)
  - Proctoring service
  - API endpoints
  - Model loading

## How to Run

### Option 1: Docker Compose (Recommended)
```bash
docker-compose up
```

This will:
1. Build the backend with proctoring dependencies
2. Start web-frontend on port 3000
3. Start admin-frontend on port 5174
4. Start API server on port 8000

### Option 2: Manual
```bash
# Terminal 1 - Backend
cd services/api
pip install -r requirements.txt
uvicorn src.main:app --reload

# Terminal 2 - Web Frontend (User)
cd apps/web-frontend
npm run dev

# Terminal 3 - Admin Frontend
cd apps/admin-frontend
npm run dev
```

## URLs

- **User App**: http://localhost:3000
  - Certifications in sidebar
  - Click "Certifications" to browse and take tests
  
- **Admin Panel**: http://localhost:5174
  - Create certifications: http://localhost:5174/certifications
  - Review proctoring: http://localhost:5174/proctoring

- **API**: http://localhost:8000
  - API docs: http://localhost:8000/docs
  - Proctoring models loaded on startup

## What Works Now

1. ✅ Admin can create certifications in admin panel
2. ✅ Admin can manage questions for certifications
3. ✅ Users see "Certifications" in sidebar (port 3000)
4. ✅ Users can browse and start certifications
5. ✅ Proctoring system monitors tests with AI
6. ✅ Admin can review attempts in Proctoring Review page
7. ✅ Docker compose installs all dependencies automatically

## Files Changed

### Backend (services/)
- `services/api/Dockerfile` - Added proctoring dependencies
- `services/api/src/routes/admin/certifications.py` - Fixed router prefix

### Admin Frontend (apps/admin-frontend/)
- `apps/admin-frontend/src/pages/Certifications.jsx` - Fixed API URLs

### User Frontend (apps/web-frontend/)
- Already has certifications in sidebar
- Already has test pages and proctoring components

## Testing Checklist

1. Start Docker: `docker-compose up`
2. Go to admin panel: http://localhost:5174/certifications
3. Create a new certification
4. Go to user app: http://localhost:3000
5. Click "Certifications" in sidebar
6. Start a test (will require camera/mic permissions)

## Notes

- Proctoring models are large (~500MB) and download on first startup
- Camera/mic permissions are required for tests
- Full-screen mode is enforced during tests
- Tab switching is detected and penalized

## Troubleshooting

**Admin panel API errors:**
- Check API_BASE_URL in admin-frontend
- Verify backend is running on port 8000
- Check browser console for CORS errors

**Proctoring not working:**
- Wait for models to load on first startup
- Check backend logs for errors
- Verify dependencies installed in Docker

**Sidebar not showing:**
- Clear browser cache
- Restart frontend: `npm run dev`
- Check browser console for errors

