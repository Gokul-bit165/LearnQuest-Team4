# 🎯 LearnQuest Admin Panel - Comprehensive Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Database Structure](#database-structure)
3. [Admin Features](#admin-features)
4. [API Endpoints](#api-endpoints)
5. [Frontend Pages](#frontend-pages)
6. [Enhanced Features](#enhanced-features)

---

## 🔍 Overview

The LearnQuest Admin Panel is a comprehensive dashboard for managing:
- **Users & Permissions**
- **Courses & Content**
- **Certification Tests**
- **Question Banks**
- **Proctoring & Violations**
- **Analytics & Reports**
- **Certificates Management**

**Access URL**: `http://localhost:5174` (Development)  
**Authentication**: Admin role required (stored in JWT token)

---

## 🗄️ Database Structure

### Collections in `learnquest` Database:

#### 1. **users**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password_hash: String,
  role: String, // "student" | "admin"
  avatar_url: String,
  auth_provider: String, // "email" | "google"
  xp: Number,
  level: Number,
  enrolled_courses: Array,
  quiz_history: Array,
  badges: Array,
  created_at: DateTime
}
```

#### 2. **courses**
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  category: String,
  difficulty: String, // "beginner" | "intermediate" | "advanced"
  topics: Array<{
    topic_id: String,
    title: String,
    content: String,
    order: Number,
    resources: Array
  }>,
  instructor: String,
  duration: String,
  thumbnail: String,
  tags: Array<String>,
  created_at: DateTime,
  updated_at: DateTime
}
```

#### 3. **questions** (Practice Problems)
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  difficulty: String,
  tags: Array<String>,
  type: String, // "code" | "quiz"
  topic_id: String,
  topic_name: String,
  test_cases: Array<{
    input: String,
    expected_output: String,
    is_hidden: Boolean
  }>,
  starter_code: Object<{
    python: String,
    javascript: String,
    java: String,
    cpp: String
  }>,
  solution: String,
  constraints: Array<String>,
  hints: Array<String>,
  is_practice_problem: Boolean,
  created_at: DateTime
}
```

#### 4. **cert_test_specs**
```javascript
{
  _id: ObjectId,
  cert_id: String,
  difficulty: String,
  topic_id: String,
  num_questions: Number,
  duration_minutes: Number,
  pass_percentage: Number,
  negative_marking: Boolean,
  question_selection: String, // "random" | "fixed"
  active: Boolean,
  created_at: DateTime,
  updated_at: DateTime
}
```

#### 5. **cert_attempts**
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  user_name: String,
  topic_id: String,
  difficulty: String,
  questions: Array,
  answers: Array<{
    question_id: String,
    code: String,
    result: Object,
    passed: Boolean
  }>,
  score: Number,
  status: String, // "in_progress" | "completed" | "submitted"
  started_at: DateTime,
  finished_at: DateTime,
  proctoring_events: Array<{
    type: String,
    violation_type: String,
    severity: String,
    message: String,
    timestamp: DateTime
  }>,
  violations: Object<{
    looking_away: Number,
    no_face: Number,
    phone_detected: Number,
    multiple_people: Number,
    excessive_noise: Number,
    tab_switch: Number,
    copy_paste: Number
  }>,
  restrictions: Object,
  settings: Object,
  total_questions: Number,
  correct_answers: Number,
  wrong_answers: Number,
  unanswered: Number
}
```

#### 6. **proctoring_sessions**
```javascript
{
  _id: ObjectId,
  attempt_id: String,
  started_at: DateTime,
  ended_at: DateTime,
  status: String,
  violation_counts: Object,
  total_violations: Number
}
```

#### 7. **proctoring_violations**
```javascript
{
  _id: ObjectId,
  attempt_id: String,
  session_id: String,
  type: String,
  severity: String,
  message: String,
  timestamp: DateTime,
  metadata: Object
}
```

#### 8. **quizzes**
```javascript
{
  _id: ObjectId,
  topic_id: String,
  questions: Array,
  created_at: DateTime
}
```

---

## 🎨 Admin Features

### 1. **Dashboard** (`/`)
**Purpose**: Overview of platform metrics

**Features**:
- Total users count
- Total certifications count
- Total courses count
- Total practice problems
- Recent test attempts (last 7 days)
- Pass rate statistics
- Recent activity feed
- Quick stats cards with trends

**API Used**:
- `GET /api/admin/metrics`
- `GET /api/admin/users`
- `GET /api/admin/certifications`
- `GET /api/admin/courses`
- `GET /api/admin/problems`

---

### 2. **Users Management** (`/users`)
**Purpose**: Manage all platform users

**Features**:
- View all users in table format
- Create new users (email/password)
- Edit user details (name, email, role, level, XP)
- Delete users
- Role management (student/admin)
- Level & XP tracking

**API Endpoints**:
```
GET    /api/admin/users/           - List all users
POST   /api/admin/users/           - Create user
GET    /api/admin/users/{id}       - Get user details
PUT    /api/admin/users/{id}       - Update user
DELETE /api/admin/users/{id}       - Delete user
```

**Fields**:
- Name (required)
- Email (required, unique)
- Password (min 6 chars, for creation)
- Role (student/admin)
- Level (1-100)
- XP (0+)

---

### 3. **Courses Management** (`/courses`)
**Purpose**: Manage learning courses

**Features**:
- View all courses
- Create new courses
- Edit course details
- Delete courses
- Manage topics within courses
- Import courses from JSON
- Course categorization

**API Endpoints**:
```
GET    /api/admin/courses/              - List courses
POST   /api/admin/courses               - Create course
GET    /api/admin/courses/{id}          - Get course
PUT    /api/admin/courses/{id}          - Update course
DELETE /api/admin/courses/{id}          - Delete course
GET    /api/admin/courses/{id}/topics   - Get topics
POST   /api/admin/courses/import-json   - Import JSON
```

**Course Structure**:
```javascript
{
  title: "Python Fundamentals",
  description: "Learn Python basics",
  category: "Programming",
  difficulty: "beginner",
  topics: [
    {
      topic_id: "py-001",
      title: "Variables & Data Types",
      content: "...",
      order: 1,
      resources: []
    }
  ],
  instructor: "Admin",
  duration: "4 weeks",
  tags: ["python", "programming"]
}
```

---

### 4. **Problems Management** (`/problems`)
**Purpose**: Manage coding practice problems

**Features**:
- View all coding problems
- Create new problems
- Edit problem details
- Delete problems
- Toggle practice problem status
- Import problems from JSON
- Test case management
- Starter code templates (Python, JS, Java, C++)

**API Endpoints**:
```
GET    /api/admin/problems/              - List problems
POST   /api/admin/problems/              - Create problem
GET    /api/admin/problems/{id}          - Get problem
PUT    /api/admin/problems/{id}          - Update problem
DELETE /api/admin/problems/{id}          - Delete problem
PATCH  /api/admin/problems/{id}/toggle   - Toggle status
POST   /api/admin/problems/import-json   - Import JSON
```

**Problem Structure**:
```javascript
{
  title: "Two Sum",
  description: "Find two numbers that add up to target",
  difficulty: "easy",
  tags: ["array", "hash-map"],
  type: "code",
  topic_id: "arrays",
  test_cases: [
    {
      input: "[2,7,11,15]\n9",
      expected_output: "[0,1]",
      is_hidden: false
    }
  ],
  starter_code: {
    python: "def two_sum(nums, target):\n    pass",
    javascript: "function twoSum(nums, target) {\n    \n}",
    java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}",
    cpp: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};"
  },
  solution: "...",
  constraints: ["2 <= nums.length <= 10^4"],
  hints: ["Use a hash map"],
  is_practice_problem: true
}
```

---

### 5. **Certification Test Manager** (`/certification-tests`)
**Purpose**: Manage certification test specifications

**Features**:
- Create test specifications
- Configure test parameters:
  - Topic ID
  - Difficulty level
  - Number of questions
  - Duration (minutes)
  - Pass percentage
  - Negative marking
- Activate/deactivate tests
- View all test specs

**API Endpoints**:
```
POST   /api/admin/cert-tests/specs                        - Create spec
GET    /api/admin/cert-tests/specs                        - List specs
GET    /api/admin/cert-tests/specs/{cert_id}/{difficulty} - Get spec
DELETE /api/admin/cert-tests/specs/{cert_id}/{difficulty} - Delete spec
PATCH  /api/admin/cert-tests/specs/{cert_id}/{difficulty}/status - Toggle
```

---

### 6. **Question Banks** (`/question-banks`)
**Purpose**: Manage certification question banks

**Features**:
- Upload question bank JSON files
- View all banks
- Support for multiple JSON files
- Bank validation

**API Endpoints**:
```
GET  /api/admin/cert-tests/banks  - List banks
POST /api/admin/cert-tests/banks  - Upload banks (multipart/form-data)
```

**Bank Format**:
```json
{
  "topic_id": "python-basics",
  "difficulty": "easy",
  "questions": [
    {
      "id": "q1",
      "title": "Hello World",
      "description": "Print 'Hello, World!'",
      "test_cases": [...],
      "starter_code": {...}
    }
  ]
}
```

---

### 7. **Exam Violations Dashboard** (`/exam-violations`)
**Purpose**: Monitor and review test proctoring violations

**Features**:
- **Real-time violation monitoring**
- **Candidate filtering**:
  - Search by name/email/ID
  - Filter by exam
  - Filter by violation status (Safe/Warning/Violation)
  - Date range filtering
- **Violation categories**:
  - Looking Away (3 second threshold)
  - Phone Detected (2 second threshold)
  - Multiple People
  - No Face Detected
  - Excessive Noise (3 second threshold)
  - Tab Switch
  - Copy/Paste
- **Summary statistics**:
  - Total candidates
  - Safe candidates (score > 95)
  - Warnings (score 90-95)
  - Violations (score < 90)
  - Noise events count
  - Camera events count
- **Detailed view modal**:
  - Test details (questions, score, duration)
  - Performance breakdown
  - Timeline of events
  - Proctoring summary
  - Admin review section
- **Admin actions**:
  - Approve (100 score)
  - Warning (90 score)
  - Violation (70 score)
  - Add admin notes
- **Export functionality**:
  - CSV export of violation reports

**API Endpoints**:
```
GET  /api/admin/proctoring/attempts                      - List attempts
GET  /api/admin/proctoring/attempts/{id}/proctoring-logs - Detailed logs
GET  /api/admin/proctoring/attempts/{id}/violations      - Violation counts
PUT  /api/admin/proctoring/attempts/{id}/review          - Admin decision
GET  /api/admin/proctoring/statistics                    - Stats
```

---

### 8. **Proctoring Review** (`/proctoring-review`)
**Purpose**: Detailed proctoring session review

**Features**:
- Review individual proctoring sessions
- View behavior scores
- Override scores (admin)
- Add review notes
- View complete violation timeline

---

### 9. **Results & Analytics** (`/results-analytics`)
**Purpose**: View test results and analytics

**Features**:
- All test attempts
- Performance metrics
- Score distribution
- Pass/fail rates
- User performance tracking

**API Endpoints**:
```
GET /api/cert-tests/attempts       - All attempts
GET /api/cert-tests/attempts/{id}  - Single attempt
```

---

### 10. **Certificate Management** (`/certificate-management`)
**Purpose**: Manage digital certificates

**Features**:
- Generate certificates
- View issued certificates
- Certificate templates
- Verification system

---

### 11. **Tests Dashboard** (`/tests`)
**Purpose**: Overview of all certification tests

**Features**:
- Active tests list
- Test statistics
- Quick access to results

---

### 12. **Practice Zone** (`/practice-zone`)
**Purpose**: Configure practice problem sets

**Features**:
- Create practice sets
- Assign problems
- Difficulty-based grouping

---

## 🔌 Complete API Reference

### Admin Authentication
All admin endpoints require:
```javascript
headers: {
  'Authorization': 'Bearer <JWT_TOKEN>'
}
```

### Endpoint Summary

| Module | Endpoint | Method | Description |
|--------|----------|--------|-------------|
| **Metrics** | `/api/admin/metrics` | GET | Dashboard statistics |
| **Users** | `/api/admin/users/` | GET | List all users |
| | `/api/admin/users/` | POST | Create user |
| | `/api/admin/users/{id}` | GET | Get user |
| | `/api/admin/users/{id}` | PUT | Update user |
| | `/api/admin/users/{id}` | DELETE | Delete user |
| **Courses** | `/api/admin/courses/` | GET | List courses |
| | `/api/admin/courses` | POST | Create course |
| | `/api/admin/courses/{id}` | GET | Get course |
| | `/api/admin/courses/{id}` | PUT | Update course |
| | `/api/admin/courses/{id}` | DELETE | Delete course |
| | `/api/admin/courses/{id}/topics` | GET | Get topics |
| | `/api/admin/courses/import-json` | POST | Import JSON |
| **Problems** | `/api/admin/problems/` | GET | List problems |
| | `/api/admin/problems/` | POST | Create problem |
| | `/api/admin/problems/{id}` | GET | Get problem |
| | `/api/admin/problems/{id}` | PUT | Update problem |
| | `/api/admin/problems/{id}` | DELETE | Delete problem |
| | `/api/admin/problems/{id}/toggle` | PATCH | Toggle status |
| | `/api/admin/problems/import-json` | POST | Import JSON |
| **Cert Tests** | `/api/admin/cert-tests/specs` | POST | Create spec |
| | `/api/admin/cert-tests/specs` | GET | List specs |
| | `/api/admin/cert-tests/specs/{cert}/{diff}` | GET | Get spec |
| | `/api/admin/cert-tests/specs/{cert}/{diff}` | DELETE | Delete spec |
| | `/api/admin/cert-tests/specs/{cert}/{diff}/status` | PATCH | Toggle active |
| | `/api/admin/cert-tests/banks` | GET | List banks |
| | `/api/admin/cert-tests/banks` | POST | Upload banks |
| **Proctoring** | `/api/admin/proctoring/attempts` | GET | List attempts |
| | `/api/admin/proctoring/attempts/{id}/proctoring-logs` | GET | Detailed logs |
| | `/api/admin/proctoring/attempts/{id}/violations` | GET | Violations |
| | `/api/admin/proctoring/attempts/{id}/review` | PUT | Admin review |
| | `/api/admin/proctoring/statistics` | GET | Statistics |
| **Certifications** | `/api/admin/certifications/` | GET | List certs |
| | `/api/admin/certifications/{id}` | GET | Get cert |
| | `/api/admin/certifications/{id}/attempts` | GET | Cert attempts |

---

## 🚀 Enhanced Features

### 1. **Smart Violation Detection**

**Thresholds** (at 4 FPS frame rate):
- **Looking Away**: 12 frames (3 seconds)
- **Phone Detection**: 8 frames (2 seconds)
- **Noise**: 12 frames (3 seconds consecutive)
- **Cooldown**: 2 seconds between same violation types

**Implementation**:
```python
# In proctoring_detector.py
VIOLATION_THRESHOLD = 12  # 3 seconds at 4 FPS
PHONE_VIOLATION_THRESHOLD = 8  # 2 seconds
COOLDOWN_SECONDS = 2
```

### 2. **Comprehensive Test Statistics**

Automatically calculated for each attempt:
- Total questions
- Correct answers
- Wrong answers
- Unanswered questions
- Duration (minutes)
- Violation counts by type
- Behavior score

### 3. **Dual-Save Architecture**

Violations saved to:
1. `proctoring_violations` collection
2. `cert_attempts.proctoring_events` array
3. `cert_attempts.violations` object (counters)

### 4. **Admin Review System**

Admins can:
- Override behavior scores
- Add review notes
- Approve/reject attempts
- Track reviewer identity
- Export violation reports

### 5. **Real-time Filtering**

Filter candidates by:
- Search term (name/email/ID)
- Violation status
- Exam type
- Date range

### 6. **Export Capabilities**

Export formats:
- CSV reports
- JSON data dumps
- Filtered subsets

---

## 🎯 Usage Examples

### Creating a User
```javascript
POST /api/admin/users/
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure123",
  "role": "student"
}
```

### Creating a Test Spec
```javascript
POST /api/admin/cert-tests/specs
{
  "cert_id": "python-cert",
  "difficulty": "intermediate",
  "topic_id": "python-fundamentals",
  "num_questions": 10,
  "duration_minutes": 60,
  "pass_percentage": 70,
  "negative_marking": false,
  "question_selection": "random",
  "active": true
}
```

### Reviewing a Proctored Test
```javascript
PUT /api/admin/proctoring/attempts/{attempt_id}/review
{
  "behavior_score_override": 90,
  "admin_notes": "Minor violations, approved",
  "reviewed_by": "admin@learnquest.com"
}
```

### Filtering Violations
```javascript
GET /api/admin/proctoring/attempts?status=completed
```

---

## 📊 Violation Scoring System

**Violation Weights**:
- Looking Away: 1 point
- No Face: 2 points
- Multiple Faces: 3 points
- Phone Detected: 4 points
- Noise Detected: 2 points
- Tab Switch: 3 points
- Copy/Paste: 2 points

**Categories**:
- **Safe**: Score < 5 (Green)
- **Warning**: Score 5-10 (Yellow)
- **Violation**: Score > 10 (Red)

**Behavior Score**:
- Base: 100
- Deduct points based on violations
- Admin can override

---

## 🔧 Configuration

### Environment Variables
```bash
VITE_API_URL=http://localhost:8000  # Backend API URL
```

### Local Development
```bash
# Start admin frontend
cd apps/admin-frontend
npm run dev
# Access at http://localhost:5174

# Start backend API
cd services/api
docker compose up -d api
# API at http://localhost:8000
```

---

## 🎨 UI Components

### Color Scheme
```css
Background: slate-900 (#0f172a)
Card: slate-800 (#1e293b)
Border: slate-700 (#334155)
Text: white / slate-100
Primary: blue-600 (#2563eb)
Success: green-600 (#16a34a)
Warning: yellow-600 (#ca8a04)
Error: red-600 (#dc2626)
```

### Icons
- Lucide React icons library
- Consistent 5-6 size units
- Color-coded by severity

---

## 🔐 Security

1. **Authentication**: JWT-based, admin role required
2. **Password Hashing**: bcrypt for user passwords
3. **Role-Based Access**: Admin endpoints protected
4. **Input Validation**: Pydantic models on backend
5. **XSS Protection**: React auto-escaping
6. **CORS**: Configured for localhost development

---

## 📈 Future Enhancements

1. **Advanced Analytics**:
   - Time-series violation trends
   - User behavior patterns
   - Predictive cheating detection

2. **AI-Powered Review**:
   - Auto-flag suspicious behavior
   - ML-based violation scoring
   - Anomaly detection

3. **Bulk Operations**:
   - Batch user import/export
   - Bulk test creation
   - Mass notifications

4. **Enhanced Reporting**:
   - PDF reports
   - Email notifications
   - Scheduled reports

5. **Audit Logs**:
   - Track all admin actions
   - Change history
   - Compliance reporting

---

## 📞 Support

For issues or questions:
- Check logs: `docker logs learnquest-api-1`
- Review documentation: `docs/` folder
- Check database: `docker exec -it learnquest-db-1 mongosh`

---

## ✅ Admin Panel Checklist

### ✅ Fully Implemented
- [x] Dashboard with metrics
- [x] User management (CRUD)
- [x] Course management (CRUD)
- [x] Problem management (CRUD)
- [x] Certification test specs
- [x] Question bank upload
- [x] Exam violations dashboard
- [x] Proctoring review
- [x] Results & analytics
- [x] CSV export
- [x] Admin review system
- [x] Real-time filtering
- [x] Violation scoring

### ⏳ Partially Implemented
- [ ] Certificate generation (UI ready, needs backend)
- [ ] Bulk operations
- [ ] Advanced analytics
- [ ] Email notifications

### 🔮 Planned Features
- [ ] AI-powered violation detection
- [ ] Video replay of proctoring sessions
- [ ] Multi-language support
- [ ] Mobile admin app
- [ ] Integration with LMS platforms

---

**Last Updated**: November 1, 2025  
**Version**: 2.0  
**Maintained By**: LearnQuest Team
