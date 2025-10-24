# Team Cloud Database Setup Guide

## Quick Setup for Team Members

### 1. Get Database Credentials
Ask your team lead for:
- MongoDB Atlas connection string
- JWT secret key
- Any other environment variables

### 2. Configure Environment
1. Copy `.env.example` to `.env`
2. Update the values with your team's credentials:
   ```bash
   cp .env.example .env
   # Edit .env with your team's values
   ```

### 3. Start Services
```bash
docker-compose up
```

### 4. Verify Connection
Check if the API is connected to the cloud database:
```bash
curl http://localhost:8000/api/health
```

## For Team Leads

### Setting up MongoDB Atlas:
1. Go to https://www.mongodb.com/atlas
2. Create free account
3. Create new project "LearnQuest"
4. Create free cluster (M0 Sandbox)
5. Create database user with read/write access
6. Add network access (0.0.0.0/0 for development)
7. Get connection string
8. Share connection string with team

### Sharing Credentials:
- Use secure communication (Slack, Teams, etc.)
- Never commit credentials to git
- Use environment variables for all sensitive data

## Troubleshooting

### Connection Issues:
1. Check if MONGO_URL is correct
2. Verify network access in Atlas
3. Check if database user has correct permissions

### Team Sync Issues:
1. Make sure everyone uses the same database
2. Export/import data when needed
3. Use the sync script for complex merges

## Security Best Practices:
1. Use strong passwords
2. Limit network access to team IPs
3. Rotate credentials regularly
4. Never commit .env files to git
