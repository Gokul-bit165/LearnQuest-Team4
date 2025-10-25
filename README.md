# LearnQuest

A comprehensive learning management system with AI-powered features, code execution sandbox, and gamification.

## 🏗️ Project Structure

```
learn-quest/
├─ apps/              # Frontend applications
├─ services/          # Backend services
├─ infra/            # Infrastructure configuration
├─ scripts/          # Utility scripts
└─ docs/             # Documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v18+)
- Docker & Docker Compose
- Python (v3.9+) for backend services
- Google Cloud Console account (for OAuth)

### Installation

```bash
# Install dependencies
npm install

# Configure environment variables
cp env.example .env
# Edit .env with your configuration (see Google OAuth setup below)

# Start all services with Docker
docker-compose up
```

### Google OAuth Setup

1. Follow the [Google OAuth Setup Guide](docs/GOOGLE_OAUTH_SETUP.md)
2. Configure your `.env` file with Google OAuth credentials
3. Test the integration: `python scripts/test_google_oauth_simple.py`

## 📦 Components

### Frontend Apps
- **web-frontend**: Main user-facing React application (Vite + Tailwind)
- **admin-frontend**: Administrative dashboard
- **runner**: Code execution sandbox interface

### Backend Services
- **api**: Main API service (FastAPI/Express)
- **worker**: Background job processor
- **embeddings-index**: Vector store synchronization

## 🛠️ Development

```bash
# Start development environment
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## � Run with Docker (recommended)

- Prereqs: Docker Desktop running
- From repo root:
	- Build: `docker-compose build`
	- Start: `docker-compose up -d`
- Open:
	- Web: http://localhost:3000
	- API health: http://localhost:8000/api/health
- Stop and clean: `docker-compose down -v`

Notes:
- Web builds with Nginx and uses `VITE_API_URL=http://api:8000` inside the compose network (already set). From your browser, you’ll hit it via the web container proxy at http://localhost:3000.

## 🧪 Run locally (no Docker)

### API
```powershell
cd services/api
python -m venv venv
./venv/Scripts/Activate.ps1
pip install -r requirements.txt
# Ensure Mongo is running locally on mongodb://localhost:27017 (or set MONGO_URL/MONGO_DB)
uvicorn src.main:app --reload --port 8000
```

### Web
```powershell
cd apps/web-frontend
npm install
$env:VITE_API_URL='http://localhost:8000'
npm run dev
# Open the URL Vite prints (typically http://localhost:5173)
```

## 🔍 Smoke test

- API: `curl http://localhost:8000/api/health` → {"status":"ok"}
- Web routes: `/login`, `/courses`, `/dashboard` open without errors.

## �📚 Documentation

See the `/docs` folder for detailed documentation:
- [Design System](./docs/design-system.md)
- [API Specification](./docs/api-spec.md)
- [Deployment Guide](./docs/deployment.md)

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## 📄 License

MIT License - see LICENSE file for details
