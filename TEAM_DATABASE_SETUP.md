# Team Database Setup Guide

This guide explains how to share a single database with your teammates in the LearnQuest project.

## Problem
When teammates clone the repository and run `docker-compose up`, they get their own local database instance with no data. This means everyone has different data and can't collaborate effectively.

## Solutions

### Solution 1: Database Export/Import (Recommended for Development)

This is the easiest solution for development teams.

#### For the Team Lead (Person with the data):

1. **Export your database:**
   ```bash
   python scripts/export_database.py
   ```
   This creates a zip file like `database_export_20241201_143022.zip`

2. **Share the zip file with your team:**
   - Upload to Google Drive, Dropbox, or your team's shared folder
   - Or commit it to a shared branch (not recommended for large files)

#### For Team Members:

1. **Download the zip file from your team lead**

2. **Import the database:**
   ```bash
   python scripts/import_database.py database_export_20241201_143022.zip
   ```

3. **Start your services:**
   ```bash
   docker-compose up
   ```

#### When to Re-export/Import:
- When new courses, users, or content are added
- When database structure changes
- At least once per week during active development

### Solution 2: Shared Remote Database (Recommended for Production-like Setup)

For a more production-like setup, use a shared MongoDB Atlas database or a shared server.

#### Setup MongoDB Atlas (Free):

1. **Create MongoDB Atlas account:** https://www.mongodb.com/atlas
2. **Create a free cluster**
3. **Get connection string**
4. **Update environment variables:**

Create a `.env` file in your project root:
```env
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/
MONGO_DB=learnquest
JWT_SECRET_KEY=your-secret-key-change-in-production
CHROMA_HOST=chroma
CHROMA_PORT=8000
OLLAMA_BASE_URL=http://host.docker.internal:11434
```

5. **Update docker-compose.yml to use .env file:**
   ```yaml
   api:
     build:
       context: .
       dockerfile: ./services/api/Dockerfile
     ports:
       - "8000:8000"
     env_file:
       - .env
     depends_on:
       - chroma-init
       - seed
     restart: unless-stopped
   ```

6. **Remove local MongoDB service from docker-compose.yml:**
   ```yaml
   # Comment out or remove these lines:
   # db:
   #   image: mongo:7.0
   #   ports:
   #     - "27017:27017"
   #   volumes:
   #     - mongo_data:/data/db
   #   restart: unless-stopped
   ```

### Solution 3: Database Synchronization Script

For teams that need frequent synchronization, use the sync script:

```bash
python scripts/sync_database.py
```

This script will:
- Export your local changes
- Pull latest changes from team
- Merge conflicts (if any)
- Import merged data

## Quick Start Commands

### Export Database (Team Lead):
```bash
python scripts/export_database.py
```

### Import Database (Team Members):
```bash
python scripts/import_database.py
```

### Start Services:
```bash
docker-compose up
```

### Stop and Reset Database:
```bash
docker-compose down -v  # Removes volumes
docker-compose up
```

## Troubleshooting

### Database Connection Issues:
1. Make sure MongoDB is running: `docker-compose ps`
2. Check logs: `docker-compose logs db`
3. Restart services: `docker-compose restart`

### Import/Export Issues:
1. Make sure you have the required Python packages:
   ```bash
   pip install pymongo passlib[bcrypt] python-jose[cryptography]
   ```

2. Check file permissions and paths

### Data Conflicts:
1. Always export before making changes
2. Communicate with team about major data changes
3. Use the sync script for complex merges

## Best Practices

1. **Regular Exports:** Export database at least once per day during active development
2. **Communication:** Let team know when you're exporting/importing
3. **Backup:** Keep backups of important database exports
4. **Version Control:** Don't commit large database files to git
5. **Testing:** Test import/export on a copy before sharing with team

## File Structure

```
scripts/
├── export_database.py    # Export database to JSON files
├── import_database.py   # Import database from JSON files
├── sync_database.py     # Synchronize with team database
└── seed_db.py          # Original seeding script

database_exports/        # Temporary folder (auto-created)
├── users.json
├── courses.json
├── quizzes.json
├── questions.json
└── metadata.json
```

## Need Help?

If you encounter issues:
1. Check the logs: `docker-compose logs`
2. Restart services: `docker-compose restart`
3. Reset everything: `docker-compose down -v && docker-compose up`
4. Ask your team lead for the latest database export
