# 🗺️ LearnQuest Admin Panel Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        LEARNQUEST PLATFORM                          │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
         ┌──────────▼──────────┐     ┌──────────▼──────────┐
         │   STUDENT FRONTEND  │     │   ADMIN FRONTEND    │
         │   (Port 3000)       │     │   (Port 5174)       │
         │   React + Vite      │     │   React + Vite      │
         └──────────┬──────────┘     └──────────┬──────────┘
                    │                           │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │      NGINX GATEWAY        │
                    │      (Port 80/443)        │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │    FASTAPI BACKEND        │
                    │    (Port 8000)            │
                    │    Python 3.10            │
                    └─────────────┬─────────────┘
                                  │
            ┌─────────────────────┼─────────────────────┐
            │                     │                     │
┌───────────▼──────────┐ ┌───────▼────────┐ ┌────────▼─────────┐
│   MONGODB DATABASE   │ │  JUDGE0 RUNNER │ │  CHROMA VECTOR   │
│   (Port 27017)       │ │  (Port 2358)   │ │  (Port 8000)     │
│   learnquest DB      │ │  Code Executor │ │  AI Embeddings   │
└──────────────────────┘ └────────────────┘ └──────────────────┘
```

---

## Admin Panel Navigation Structure

```
┌────────────────────────────────────────────────────────────────┐
│                    LEARNQUEST ADMIN PANEL                      │
│                    http://localhost:5174                       │
└────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┴─────────────────────┐
        │           SIDEBAR NAVIGATION              │
        └─────────────────────┬─────────────────────┘
                              │
    ┌─────────────────────────┴─────────────────────────┐
    │                                                    │
    ▼                                                    ▼
┌─────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────┐
│Dashboard│  │  Users   │  │ Courses  │  │   Problems     │
│    /    │  │ /users   │  │/courses  │  │  /problems     │
└─────────┘  └──────────┘  └──────────┘  └────────────────┘
    │            │              │              │
    │            │              │              │
    ▼            ▼              ▼              ▼
[Metrics]   [User CRUD]   [Course CRUD]  [Problem CRUD]
[Stats]     [Roles]       [Topics]       [Test Cases]
[Activity]  [Levels]      [Import]       [Starter Code]
                                         [Judge0]
                              
    │
    ▼
┌─────────────────┐  ┌────────────────┐  ┌──────────────────┐
│ Practice Zone   │  │ Tests Dashboard│  │ Certification    │
│/practice-zone   │  │    /tests      │  │ Test Manager     │
└─────────────────┘  └────────────────┘  │/certification-   │
                                         │    tests         │
                                         └──────────────────┘
                                                │
                                                │
                                                ▼
┌─────────────────┐  ┌────────────────┐  ┌──────────────────┐
│ Question Banks  │  │ Proctoring     │  │ Exam Violations  │
│/question-banks  │  │    Review      │  │ Dashboard        │
│                 │  │/proctoring-    │  │/exam-violations  │
│ [Upload JSON]   │  │   review       │  │                  │
└─────────────────┘  └────────────────┘  └──────────────────┘
                              │                   │
                              │                   │
                              ▼                   ▼
┌─────────────────┐  ┌────────────────┐  ┌──────────────────┐
│ Results &       │  │ Certificate    │  │                  │
│ Analytics       │  │ Management     │  │                  │
│/results-        │  │/certificate-   │  │                  │
│ analytics       │  │ management     │  │                  │
└─────────────────┘  └────────────────┘  └──────────────────┘
```

---

## Data Flow Architecture

### 1. User Management Flow
```
┌──────────────┐
│  Admin UI    │ Create/Edit User
│  /users      │
└──────┬───────┘
       │ POST/PUT Request
       │ + JWT Token
       ▼
┌──────────────────────┐
│ FastAPI Backend      │
│ /api/admin/users/    │
└──────┬───────────────┘
       │ Validate Token
       │ Check Admin Role
       │ Hash Password
       ▼
┌──────────────────────┐
│ MongoDB              │
│ users collection     │
└──────┬───────────────┘
       │ Insert/Update
       │ Return Document
       ▼
┌──────────────────────┐
│ Response to UI       │
│ {user data}          │
└──────────────────────┘
```

### 2. Proctoring Violation Flow
```
┌──────────────────┐
│ Test Interface   │ Student Taking Test
│ (Student View)   │
└────────┬─────────┘
         │ WebSocket Connection
         │ Video Frames (250ms)
         ▼
┌──────────────────────────┐
│ Proctoring WebSocket     │
│ /api/proctoring/ws/{id}  │
└────────┬─────────────────┘
         │ Process Frame
         │ AI Detection
         ▼
┌──────────────────────────┐
│ ProctoringDetector       │
│ - MediaPipe (Face)       │
│ - YOLOv8 (Objects)       │
│ - Noise Analysis         │
└────────┬─────────────────┘
         │ Violations Found?
         │ [Yes] → Log Violation
         │ [No]  → Continue
         ▼
┌──────────────────────────┐
│ Save to MongoDB          │
│ - proctoring_violations  │
│ - cert_attempts          │
│ - proctoring_sessions    │
└────────┬─────────────────┘
         │ Real-time Update
         ▼
┌──────────────────────────┐
│ Admin Dashboard          │
│ /exam-violations         │
│ - View Violations        │
│ - Review Session         │
│ - Make Decision          │
└──────────────────────────┘
```

### 3. Test Creation & Execution Flow
```
┌──────────────────┐
│ Admin Creates    │ 1. Create Test Spec
│ Test Spec        │
└────────┬─────────┘
         │ POST /api/admin/cert-tests/specs
         ▼
┌──────────────────────────┐
│ cert_test_specs          │ 2. Store Configuration
│ {                        │
│   cert_id, difficulty,   │
│   num_questions, etc.    │
│ }                        │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────┐
│ Admin Uploads    │ 3. Upload Questions
│ Question Bank    │
└────────┬─────────┘
         │ POST /api/admin/cert-tests/banks
         ▼
┌──────────────────────────┐
│ cert_test_banks          │ 4. Store Questions
│ [{question1}, ...]       │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────┐
│ Student Starts   │ 5. Start Test
│ Test             │
└────────┬─────────┘
         │ POST /api/cert-tests/start
         ▼
┌──────────────────────────┐
│ Generate Test            │ 6. Select Questions
│ - Random selection       │    (based on spec)
│ - Create attempt         │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ cert_attempts            │ 7. Store Attempt
│ {                        │
│   user_id, questions,    │
│   status: 'in_progress'  │
│ }                        │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────┐
│ Student Submits  │ 8. Submit Code
│ Solutions        │
└────────┬─────────┘
         │ POST /api/cert-tests/submit
         ▼
┌──────────────────────────┐
│ Judge0 Execution         │ 9. Run Code
│ - Compile & Execute      │
│ - Test Cases             │
│ - Return Results         │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Update Attempt           │ 10. Store Results
│ - answers[]              │
│ - score                  │
│ - status: 'completed'    │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────┐
│ Admin Reviews    │ 11. Admin Analysis
│ in Dashboard     │
└──────────────────┘
```

---

## Database Schema Relationships

```
┌─────────────────┐
│     users       │
│  _id (PK)       │◄─────┐
│  name           │      │
│  email          │      │ user_id (FK)
│  role           │      │
└─────────────────┘      │
                         │
┌─────────────────┐      │
│    courses      │      │
│  _id (PK)       │      │
│  title          │      │
│  topics[]       │      │
└─────────────────┘      │
                         │
┌─────────────────┐      │
│   questions     │      │
│  _id (PK)       │      │
│  title          │      │
│  test_cases[]   │      │
└─────────────────┘      │
                         │
┌──────────────────┐     │
│ cert_test_specs  │     │
│  cert_id (PK)    │     │
│  difficulty (PK) │     │
│  num_questions   │     │
└──────────────────┘     │
         │               │
         │ cert_id       │
         ▼               │
┌──────────────────┐     │
│ cert_attempts    │     │
│  _id (PK)        │     │
│  user_id ────────┼─────┘
│  topic_id        │
│  questions[]     │
│  answers[]       │
│  violations{}    │
│  proctoring_     │
│    events[]      │
└────────┬─────────┘
         │
         │ attempt_id (FK)
         ▼
┌──────────────────────┐
│ proctoring_sessions  │
│  _id (PK)            │
│  attempt_id          │
│  violation_counts{}  │
└──────────────────────┘
         │
         │ session_id (FK)
         ▼
┌──────────────────────┐
│ proctoring_violations│
│  _id (PK)            │
│  attempt_id          │
│  session_id          │
│  type                │
│  severity            │
│  timestamp           │
└──────────────────────┘
```

---

## API Endpoint Hierarchy

```
/api
├── /auth
│   ├── POST /login
│   ├── POST /register
│   ├── POST /google
│   └── GET  /me
│
├── /admin ⚠️ (Requires Admin Role)
│   ├── /users
│   │   ├── GET    /              List all users
│   │   ├── POST   /              Create user
│   │   ├── GET    /{id}          Get user
│   │   ├── PUT    /{id}          Update user
│   │   └── DELETE /{id}          Delete user
│   │
│   ├── /courses
│   │   ├── GET    /              List courses
│   │   ├── POST   /              Create course
│   │   ├── GET    /{id}          Get course
│   │   ├── PUT    /{id}          Update course
│   │   ├── DELETE /{id}          Delete course
│   │   ├── GET    /{id}/topics   Get topics
│   │   └── POST   /import-json   Import JSON
│   │
│   ├── /problems
│   │   ├── GET    /              List problems
│   │   ├── POST   /              Create problem
│   │   ├── GET    /{id}          Get problem
│   │   ├── PUT    /{id}          Update problem
│   │   ├── DELETE /{id}          Delete problem
│   │   ├── PATCH  /{id}/toggle   Toggle status
│   │   └── POST   /import-json   Import JSON
│   │
│   ├── /cert-tests
│   │   ├── /specs
│   │   │   ├── POST   /                      Create spec
│   │   │   ├── GET    /                      List specs
│   │   │   ├── GET    /{cert}/{diff}         Get spec
│   │   │   ├── DELETE /{cert}/{diff}         Delete spec
│   │   │   └── PATCH  /{cert}/{diff}/status  Toggle active
│   │   └── /banks
│   │       ├── GET    /                      List banks
│   │       └── POST   /                      Upload banks
│   │
│   ├── /proctoring
│   │   ├── GET /attempts                     List attempts
│   │   ├── GET /attempts/{id}/proctoring-logs Logs
│   │   ├── GET /attempts/{id}/violations     Violations
│   │   ├── PUT /attempts/{id}/review         Admin review
│   │   └── GET /statistics                   Stats
│   │
│   ├── /certifications
│   │   ├── GET /                             List certs
│   │   ├── GET /{id}                         Get cert
│   │   └── GET /{id}/attempts                Attempts
│   │
│   └── GET /metrics                          Dashboard stats
│
├── /cert-tests (Student endpoints)
│   ├── POST /start                           Start test
│   ├── POST /submit                          Submit answer
│   ├── POST /finish                          Finish test
│   ├── GET  /attempts                        User's attempts
│   ├── GET  /attempts/{id}                   Get attempt
│   └── POST /log-violation                   Log violation
│
├── /proctoring
│   └── WebSocket /ws/{attempt_id}            Real-time monitoring
│
├── /courses (Student endpoints)
│   ├── GET /                                 List courses
│   ├── GET /{id}                             Get course
│   ├── GET /{id}/topics                      Get topics
│   └── POST /{id}/enroll                     Enroll
│
└── /problems (Student endpoints)
    ├── GET /                                 List problems
    ├── GET /{id}                             Get problem
    └── POST /{id}/submit                     Submit solution
```

---

## Tech Stack Breakdown

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND STACK                       │
├─────────────────────────────────────────────────────────┤
│ Framework:  React 18.2                                  │
│ Build Tool: Vite 4.x                                    │
│ Styling:    TailwindCSS 3.x                             │
│ Routing:    React Router DOM 6.x                        │
│ HTTP:       Axios 1.x                                   │
│ Icons:      Lucide React                                │
│ State:      React Hooks (useState, useEffect)           │
│ Forms:      Native React                                │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    BACKEND STACK                        │
├─────────────────────────────────────────────────────────┤
│ Framework:   FastAPI 0.104                              │
│ Language:    Python 3.10                                │
│ Database:    MongoDB 7.0                                │
│ ODM:         PyMongo                                    │
│ Auth:        JWT (PyJWT)                                │
│ Password:    bcrypt                                     │
│ Validation:  Pydantic                                   │
│ WebSocket:   FastAPI WebSocket                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   AI/ML STACK                           │
├─────────────────────────────────────────────────────────┤
│ Face Detection:   MediaPipe (Google)                    │
│ Object Detection: YOLOv8n (Ultralytics)                 │
│ Image Processing: OpenCV (cv2)                          │
│ ML Framework:     PyTorch                               │
│ Audio Analysis:   Native Web Audio API                  │
│ Vector DB:        ChromaDB                              │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  EXECUTION STACK                        │
├─────────────────────────────────────────────────────────┤
│ Code Runner:  Judge0 CE                                 │
│ Languages:    Python, JavaScript, Java, C++             │
│ Isolation:    Docker containers                         │
│ Timeout:      120 seconds                               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                DEPLOYMENT STACK                         │
├─────────────────────────────────────────────────────────┤
│ Container:    Docker & Docker Compose                   │
│ Reverse Proxy: Nginx                                    │
│ Process Manager: Docker Compose                         │
│ Orchestration:  Docker Swarm (optional)                 │
└─────────────────────────────────────────────────────────┘
```

---

## Component Hierarchy

### Admin Frontend Components
```
App.jsx
├── Layout.jsx
│   ├── Sidebar
│   │   └── Navigation Links
│   └── Main Content Area
│       ├── Dashboard.jsx
│       │   ├── StatCards
│       │   ├── ActivityFeed
│       │   └── Charts
│       ├── Users.jsx
│       │   ├── UserTable
│       │   ├── CreateUserModal
│       │   └── EditUserModal
│       ├── Courses.jsx
│       │   ├── CourseList
│       │   ├── CreateCoursePage
│       │   └── EditCoursePage
│       ├── Problems.jsx
│       │   ├── ProblemList
│       │   ├── ProblemEditor
│       │   └── TestCaseManager
│       ├── CertificationTestManager.jsx
│       │   ├── SpecForm
│       │   └── SpecList
│       ├── QuestionBanks.jsx
│       │   ├── BankUpload
│       │   └── BankList
│       ├── ExamViolationsDashboard.jsx
│       │   ├── FilterBar
│       │   ├── StatsSummary
│       │   ├── CandidateTable
│       │   ├── DetailModal
│       │   │   ├── TestDetailsView
│       │   │   ├── TimelineView
│       │   │   └── AdminReviewForm
│       │   └── ExportButton
│       ├── ProctoringReview.jsx
│       ├── ResultsAnalytics.jsx
│       ├── TestsDashboard.jsx
│       ├── PracticeZone.jsx
│       └── CertificateManagement.jsx
└── services/
    └── api.js (Axios instance)
```

---

## Security Layers

```
┌─────────────────────────────────────────────────────────┐
│                  LAYER 1: NETWORK                       │
├─────────────────────────────────────────────────────────┤
│ ✓ HTTPS (Production)                                    │
│ ✓ CORS Configuration                                    │
│ ✓ Rate Limiting (Nginx)                                 │
│ ✓ Firewall Rules                                        │
└─────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────┐
│                LAYER 2: AUTHENTICATION                  │
├─────────────────────────────────────────────────────────┤
│ ✓ JWT Token Validation                                  │
│ ✓ Token Expiration (24 hours)                           │
│ ✓ Secure Password Hashing (bcrypt)                      │
│ ✓ OAuth2 Integration (Google)                           │
└─────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────┐
│               LAYER 3: AUTHORIZATION                    │
├─────────────────────────────────────────────────────────┤
│ ✓ Role-Based Access Control (RBAC)                      │
│ ✓ Admin Role Verification                               │
│ ✓ Endpoint Protection                                   │
│ ✓ Resource Ownership Check                              │
└─────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────┐
│                 LAYER 4: DATA VALIDATION                │
├─────────────────────────────────────────────────────────┤
│ ✓ Pydantic Models (Backend)                             │
│ ✓ Input Sanitization                                    │
│ ✓ Type Checking                                         │
│ ✓ Length Restrictions                                   │
└─────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────┐
│                  LAYER 5: DATABASE                      │
├─────────────────────────────────────────────────────────┤
│ ✓ MongoDB Injection Prevention                          │
│ ✓ Parameterized Queries                                 │
│ ✓ Data Encryption at Rest                               │
│ ✓ Connection Pooling                                    │
└─────────────────────────────────────────────────────────┘
```

---

**Last Updated**: November 1, 2025  
**Version**: 1.0  
**Maintained By**: LearnQuest Team
