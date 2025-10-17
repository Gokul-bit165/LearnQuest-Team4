# Learn Quest MVP Setup Guide

This guide will help you set up and run the Learn Quest MVP application.

## Prerequisites

- Docker and Docker Compose
- Node.js (v18+) for local development
- Python (v3.9+) for backend development

## Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd LearnQuest-Team4

# Install root dependencies
npm install
```

### 2. Start with Docker Compose

```bash
# Start all services
docker-compose up --build

# This will start:
# - MongoDB database on port 27017
# - API server on port 8000
# - Web frontend on port 3000
# - Database seeding with sample data
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### 4. Login Credentials

Use these demo credentials to log in:
- **Email**: student@learnquest.com
- **Password**: password123

## Development Setup

### Backend Development

```bash
# Navigate to API directory
cd services/api

# Install Python dependencies
pip install -r requirements.txt

# Run the API server
uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Development

```bash
# Navigate to frontend directory
cd apps/web-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## Project Structure

```
LearnQuest-Team4/
├── apps/
│   ├── web-frontend/          # React frontend
│   ├── admin-frontend/        # Admin dashboard (placeholder)
│   └── runner/               # Code execution sandbox
├── services/
│   ├── api/                  # FastAPI backend
│   ├── worker/               # Background jobs
│   └── embeddings-index/      # Vector store sync
├── scripts/
│   └── seed_db.py           # Database seeding script
├── infra/                    # Infrastructure configs
└── docs/                    # Documentation
```

## Features Implemented

### ✅ Backend (FastAPI)
- JWT Authentication
- User management
- Course listing and details
- Quiz system with session management
- XP and leveling system
- User dashboard and analytics

### ✅ Frontend (React)
- Authentication flow
- Course browsing
- Quiz taking interface
- Results and feedback
- User dashboard
- Responsive design with Tailwind CSS

### ✅ Database
- MongoDB with sample data
- User profiles with XP and levels
- Course and module structure
- Quiz questions and sessions
- Progress tracking

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Courses
- `GET /api/courses/` - List all courses
- `GET /api/courses/{slug}` - Get course details

### Quizzes
- `POST /api/quizzes/{quiz_id}/start` - Start quiz session
- `GET /api/quizzes/{session_id}/questions` - Get quiz questions
- `POST /api/quizzes/{session_id}/submit` - Submit quiz answers

### Users
- `GET /api/users/me` - Get user profile
- `GET /api/users/me/dashboard` - Get dashboard data

## Sample Data

The seeding script creates:
- 1 sample user (student@learnquest.com)
- 2 courses (Python Basics, Data Structures)
- 1 quiz with 5 MCQ questions
- User progress tracking

## Troubleshooting

### Common Issues

1. **Port conflicts**: Make sure ports 3000, 8000, and 27017 are available
2. **Database connection**: Ensure MongoDB container is running
3. **CORS issues**: Check that API_URL environment variable is set correctly

### Reset Database

```bash
# Stop services
docker-compose down

# Remove volumes
docker-compose down -v

# Restart with fresh data
docker-compose up --build
```

## Next Steps

This MVP provides the foundation for:
- Admin panel for content management
- Code execution sandbox integration
- AI-powered features (RAG, recommendations)
- Advanced analytics and reporting
- Mobile app development

## Support

For issues or questions, please check the documentation in the `/docs` folder or create an issue in the repository.
