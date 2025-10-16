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

### Installation

```bash
# Install dependencies
npm install

# Start all services with Docker
docker-compose up
```

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

## 📚 Documentation

See the `/docs` folder for detailed documentation:
- [Design System](./docs/design-system.md)
- [API Specification](./docs/api-spec.md)
- [Deployment Guide](./docs/deployment.md)

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## 📄 License

MIT License - see LICENSE file for details
