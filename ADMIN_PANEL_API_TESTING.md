# 🧪 Admin Panel API Testing Guide

## Quick Database Queries

### View all collections
```bash
docker exec -it learnquest-db-1 mongosh learnquest --quiet --eval "db.getCollectionNames()"
```

### Count documents in each collection
```bash
docker exec -it learnquest-db-1 mongosh learnquest --quiet --eval "
print('users:', db.users.countDocuments({}));
print('courses:', db.courses.countDocuments({}));
print('questions:', db.questions.countDocuments({}));
print('cert_test_specs:', db.cert_test_specs.countDocuments({}));
print('cert_attempts:', db.cert_attempts.countDocuments({}));
print('proctoring_violations:', db.proctoring_violations.countDocuments({}));
"
```

### View recent test attempts
```bash
docker exec -it learnquest-db-1 mongosh learnquest --quiet --eval "
db.cert_attempts.find({}, {
  user_name: 1,
  topic_id: 1,
  score: 1,
  status: 1,
  started_at: 1
}).sort({started_at: -1}).limit(5).forEach(printjson)
"
```

### View violations summary
```bash
docker exec -it learnquest-db-1 mongosh learnquest --quiet --eval "
db.cert_attempts.aggregate([
  { \$match: { status: 'completed' } },
  { \$project: {
    user_name: 1,
    total_violations: { \$sum: [
      { \$ifNull: ['\$violations.looking_away', 0] },
      { \$ifNull: ['\$violations.phone_detected', 0] },
      { \$ifNull: ['\$violations.excessive_noise', 0] },
      { \$ifNull: ['\$violations.tab_switch', 0] }
    ]}
  }},
  { \$sort: { total_violations: -1 } },
  { \$limit: 10 }
]).forEach(printjson)
"
```

---

## API Testing with cURL

### 1. Get Admin Token
First, login as admin:
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@learnquest.com",
    "password": "admin123"
  }'
```

Save the token from response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**For all commands below, replace `YOUR_TOKEN` with the actual token.**

---

### 2. Users Management

#### List all users
```bash
curl http://localhost:8000/api/admin/users/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Create a user
```bash
curl -X POST http://localhost:8000/api/admin/users/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Student",
    "email": "student@test.com",
    "password": "password123",
    "role": "student"
  }'
```

#### Get user by ID
```bash
curl http://localhost:8000/api/admin/users/USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Update user
```bash
curl -X PUT http://localhost:8000/api/admin/users/USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "level": 5,
    "xp": 1000
  }'
```

#### Delete user
```bash
curl -X DELETE http://localhost:8000/api/admin/users/USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 3. Courses Management

#### List all courses
```bash
curl http://localhost:8000/api/admin/courses/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Create a course
```bash
curl -X POST http://localhost:8000/api/admin/courses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Python Advanced",
    "description": "Advanced Python concepts",
    "category": "Programming",
    "difficulty": "advanced",
    "topics": [],
    "instructor": "Admin",
    "duration": "6 weeks",
    "tags": ["python", "advanced"]
  }'
```

#### Get course topics
```bash
curl http://localhost:8000/api/admin/courses/COURSE_ID/topics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 4. Problems Management

#### List all problems
```bash
curl http://localhost:8000/api/admin/problems/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Create a problem
```bash
curl -X POST http://localhost:8000/api/admin/problems/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Reverse String",
    "description": "Write a function to reverse a string",
    "difficulty": "easy",
    "tags": ["string", "basic"],
    "type": "code",
    "topic_id": "strings",
    "test_cases": [
      {
        "input": "hello",
        "expected_output": "olleh",
        "is_hidden": false
      }
    ],
    "starter_code": {
      "python": "def reverse_string(s):\n    pass"
    },
    "is_practice_problem": true
  }'
```

---

### 5. Certification Tests

#### List test specs
```bash
curl http://localhost:8000/api/admin/cert-tests/specs \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Create test spec
```bash
curl -X POST http://localhost:8000/api/admin/cert-tests/specs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cert_id": "python-basic",
    "difficulty": "easy",
    "topic_id": "python-fundamentals",
    "num_questions": 5,
    "duration_minutes": 30,
    "pass_percentage": 60,
    "negative_marking": false,
    "question_selection": "random",
    "active": true
  }'
```

#### Upload question bank
```bash
curl -X POST http://localhost:8000/api/admin/cert-tests/banks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "files=@question_bank.json"
```

---

### 6. Proctoring & Violations

#### List all attempts
```bash
curl http://localhost:8000/api/admin/proctoring/attempts \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Filter by status
```bash
curl "http://localhost:8000/api/admin/proctoring/attempts?status_filter=completed" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Get proctoring logs
```bash
curl http://localhost:8000/api/admin/proctoring/attempts/ATTEMPT_ID/proctoring-logs \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Get violations for attempt
```bash
curl http://localhost:8000/api/admin/proctoring/attempts/ATTEMPT_ID/violations \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Submit admin review
```bash
curl -X PUT http://localhost:8000/api/admin/proctoring/attempts/ATTEMPT_ID/review \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "behavior_score_override": 90,
    "admin_notes": "Approved with minor warnings",
    "reviewed_by": "admin@learnquest.com"
  }'
```

#### Get proctoring statistics
```bash
curl http://localhost:8000/api/admin/proctoring/statistics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 7. Test Results

#### Get all test attempts
```bash
curl http://localhost:8000/api/cert-tests/attempts \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Get single attempt details
```bash
curl http://localhost:8000/api/cert-tests/attempts/ATTEMPT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## PowerShell Scripts

### List all users with details
```powershell
$token = "YOUR_TOKEN"
$headers = @{
    "Authorization" = "Bearer $token"
}

$users = Invoke-RestMethod -Uri "http://localhost:8000/api/admin/users/" -Headers $headers
$users | Format-Table name, email, role, level, xp
```

### Get violation statistics
```powershell
$token = "YOUR_TOKEN"
$headers = @{
    "Authorization" = "Bearer $token"
}

$attempts = Invoke-RestMethod -Uri "http://localhost:8000/api/admin/proctoring/attempts" -Headers $headers

$attempts.attempts | ForEach-Object {
    $violations = Invoke-RestMethod -Uri "http://localhost:8000/api/admin/proctoring/attempts/$($_.attempt_id)/violations" -Headers $headers
    [PSCustomObject]@{
        UserName = $_.user_name
        Test = $_.certification_title
        TotalViolations = $violations.total_violations
        LookingAway = $violations.violation_counts.looking_away
        PhoneDetected = $violations.violation_counts.phone_detected
        Status = $_.status
    }
} | Format-Table
```

### Create test user
```powershell
$token = "YOUR_TOKEN"
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$body = @{
    name = "Test User $(Get-Random)"
    email = "testuser$(Get-Random)@test.com"
    password = "password123"
    role = "student"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/admin/users/" -Method Post -Headers $headers -Body $body
```

---

## Database Maintenance

### Backup database
```bash
docker exec learnquest-db-1 mongodump --db=learnquest --out=/tmp/backup
docker cp learnquest-db-1:/tmp/backup ./database_backup
```

### Restore database
```bash
docker cp ./database_backup learnquest-db-1:/tmp/backup
docker exec learnquest-db-1 mongorestore --db=learnquest /tmp/backup/learnquest
```

### Clear test attempts (USE WITH CAUTION)
```bash
docker exec -it learnquest-db-1 mongosh learnquest --quiet --eval "
db.cert_attempts.deleteMany({ status: 'in_progress' })
"
```

### Reset violation counts
```bash
docker exec -it learnquest-db-1 mongosh learnquest --quiet --eval "
db.cert_attempts.updateMany(
  {},
  { \$set: {
    'violations.looking_away': 0,
    'violations.phone_detected': 0,
    'violations.excessive_noise': 0,
    'violations.tab_switch': 0
  }}
)
"
```

---

## Frontend Testing

### Access admin panel
```
URL: http://localhost:5174
```

### Login credentials
```
Email: admin@learnquest.com
Password: admin123
```

### Navigation routes
- Dashboard: `/`
- Users: `/users`
- Courses: `/courses`
- Problems: `/problems`
- Certification Tests: `/certification-tests`
- Question Banks: `/question-banks`
- Exam Violations: `/exam-violations`
- Proctoring Review: `/proctoring-review`
- Results & Analytics: `/results-analytics`
- Certificate Management: `/certificate-management`

---

## Troubleshooting

### Check API logs
```bash
docker logs -f learnquest-api-1 --tail 100
```

### Check database connection
```bash
docker exec -it learnquest-db-1 mongosh --eval "db.adminCommand('ping')"
```

### Restart services
```bash
docker compose restart api
docker compose restart web
docker compose restart admin
```

### Check service status
```bash
docker compose ps
```

### View network connections
```bash
docker network inspect learnquest_default
```

---

## Performance Testing

### Stress test user creation
```bash
for i in {1..50}; do
  curl -X POST http://localhost:8000/api/admin/users/ \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"name\": \"Test User $i\",
      \"email\": \"test$i@example.com\",
      \"password\": \"password123\",
      \"role\": \"student\"
    }" &
done
wait
```

### Benchmark API response time
```bash
time curl http://localhost:8000/api/admin/users/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Security Testing

### Test unauthorized access
```bash
# Should return 401
curl http://localhost:8000/api/admin/users/
```

### Test invalid token
```bash
# Should return 401
curl http://localhost:8000/api/admin/users/ \
  -H "Authorization: Bearer invalid_token"
```

### Test SQL injection (should be safe)
```bash
curl -X POST http://localhost:8000/api/admin/users/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "email": "test@test.com",
    "password": "password",
    "role": "admin OR 1=1"
  }'
```

---

**Last Updated**: November 1, 2025  
**Version**: 1.0
