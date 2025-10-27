# 🛠️ Complete Technology Stack - LearnQuest Certification Module

## 🎯 **FRONTEND - User Interface Layer**

| Tool | Purpose | Why Used |
|------|---------|----------|
| **React.js** | JavaScript library for building interactive UIs | Component-based architecture for reusability and dynamic UI states |
| **Vite** | Frontend build tool and dev server | Fast HMR and instant startup for quick development |
| **Tailwind CSS** | Utility-first CSS framework | Rapid responsive styling with predefined classes |
| **Axios** | HTTP client library | Simplified API calls with promise-based requests |
| **React Router DOM** | Client-side routing | Single-page navigation without reloading |
| **Framer Motion** | Animation library | Smooth transitions and interactive animations |

---

## ⚙️ **BACKEND - Core Logic and API**

| Tool | Purpose | Why Used |
|------|---------|----------|
| **FastAPI** | Python web framework | Asynchronous, fast, automatic API documentation |
| **Uvicorn** | ASGI server | Efficient async request handling |
| **Pydantic** | Data validation library | Automatic request/response validation |
| **Python-dotenv** | Environment variable manager | Secure configuration management |

---

## 🗄️ **DATABASES**

| Tool | Purpose | Why Used |
|------|---------|----------|
| **MongoDB Atlas** | NoSQL cloud database | Flexible document storage for users and courses |
| **ChromaDB** | Vector database | Stores embeddings for AI-powered semantic search |
| **PostgreSQL** | Relational database (Judge0) | Structured storage for code execution |
| **Redis** | Caching layer | Fast data access for frequently used items |

---

## 🧠 **AI & MACHINE LEARNING**

| Tool | Purpose | Why Used |
|------|---------|----------|
| **Ollama** | Local LLM runtime | Hosts open-source LLMs like Llama 3 |
| **Llama 3** | Text-based LLM | Natural language understanding for tutoring |
| **LLaVA** | Multimodal LLM | Text + image understanding |
| **GraphSAGE** | Graph Neural Network | Prerequisite mapping and knowledge tracing |
| **LightGCN** | Recommendation model | Collaborative filtering for questions |
| **PyTorch Geometric** | GNN framework | Graph learning implementations |
| **YOLOv8** | Object detection model | Real-time face detection for proctoring |
| **DeepFace** | Face recognition | Identity verification in proctoring |
| **librosa** | Audio analysis | Noise detection and audio processing |
| **webrtcvad** | Speech detection | Real-time speech recognition |
| **face-recognition** | Face verification | User identity verification |

---

## 🛡️ **PROCTORING & SECURITY**

| Tool | Purpose | Why Used |
|------|---------|----------|
| **OpenCV** | Computer vision | Video processing and face detection |
| **sounddevice** | Audio capture | Real-time microphone monitoring |
| **JWT** | Authentication | Secure, stateless user sessions |
| **bcrypt** | Password hashing | Secure password storage |
| **Passlib** | Password management | Additional security layers |

---

## 🧪 **CODE EXECUTION**

| Tool | Purpose | Why Used |
|------|---------|----------|
| **Judge0** | Code execution engine | Secure sandboxed code execution |
| **Docker** | Containerization | Isolated execution environments |

---

## 🌐 **INFRASTRUCTURE & DEVOPS**

| Tool | Purpose | Why Used |
|------|---------|----------|
| **Docker** | Containerization platform | Package entire app into containers |
| **Docker Compose** | Multi-container orchestration | Run all services with one command |
| **Git & GitHub** | Version control | Team collaboration and tracking |
| **NGINX** | Reverse proxy | Load balancing and static assets |
| **Terraform** | Infrastructure as Code | Cloud deployment automation |
| **Kubernetes** | Container orchestration | Scalable deployment (optional) |

---

## 📊 **ANALYTICS & ADMIN**

| Tool | Purpose | Why Used |
|------|---------|----------|
| **React Admin** | Admin UI framework | Course and user management |
| **Chart.js** | Data visualization | Interactive charts and graphs |
| **Recharts** | React charting library | Student progress visualization |

---

## 🧰 **DEVELOPER TOOLS**

| Tool | Purpose | Why Used |
|------|---------|----------|
| **VS Code** | Code editor | Rich extensions for development |
| **Cursor AI** | AI-assisted coding | Speed up development |
| **ESLint** | Code linting | Code quality enforcement |
| **Prettier** | Code formatting | Consistent code style |
| **Postman** | API testing | Endpoint testing and debugging |

---

## 📝 **CERTIFICATION SYSTEM**

| Tool | Purpose | Why Used |
|------|---------|----------|
| **React PDF** | PDF generation | Dynamic certificate creation |
| **jsPDF** | Client-side PDF | Browser-based certificate generation |
| **PyPDF2** | PDF manipulation | Server-side PDF processing |

---

## 🔐 **AUTHENTICATION & SECURITY**

| Tool | Purpose | Why Used |
|------|---------|----------|
| **Google OAuth** | Social login | Google sign-in integration |
| **JWT** | Token-based auth | Stateless authentication |
| **bcrypt** | Password hashing | Security for passwords |
| **python-jose** | JWT library | JWT encoding/decoding |
| **passlib[bcrypt]** | Password hashing | Additional security |

---

## 📦 **DEPENDENCIES & LIBRARIES**

### **Python Backend:**
- fastapi==0.104.1
- uvicorn[standard]==0.24.0
- pymongo==4.6.0
- pydantic[email]
- passlib[bcrypt]
- python-jose[cryptography]==3.3.0
- python-multipart==0.0.6
- httpx==0.27.2
- chromadb>=0.5.0
- sentence-transformers==2.2.2
- transformers>=4.21.0
- torch>=2.0.0
- numpy<2.0
- pillow==10.1.0
- requests==2.31.0
- opencv-python==4.8.1.78
- ultralytics==8.0.196
- deepface==0.0.79
- sounddevice==0.4.6
- librosa==0.10.1
- webrtcvad==2.0.10
- scipy==1.11.4
- scikit-learn==1.3.2
- face-recognition==1.3.0
- dlib==19.24.2
- cmake==3.27.7
- google-auth==2.23.4
- google-auth-oauthlib==1.1.0
- google-auth-httplib2==0.1.1

### **JavaScript/React Frontend:**
- react
- react-dom
- react-router-dom
- axios
- framer-motion
- tailwindcss
- @lottiefiles/react-lottie-player
- vite
- postcss
- autoprefixer
- lucide-react

---

## 🎯 **SPECIFIC CERTIFICATION TOOLS**

### **Proctoring:**
- YOLOv8 (YOLO Nano) - Real-time face detection
- DeepFace - Identity verification
- OpenCV - Video processing
- librosa + webrtcvad - Audio monitoring
- face-recognition - Face encoding and matching

### **Backend Services:**
- FastAPI routes for proctoring
- Real-time monitoring service
- Violation logging system
- Behavior scoring algorithm
- Certificate issuance system

### **Frontend Components:**
- CertificationLanding.jsx
- CertificationTopics.jsx
- CertificationDifficulty.jsx
- TestEnvironmentSetup.jsx
- PreTestRequirements.jsx
- ProctoredTest.jsx
- TestResults.jsx

---

## 📱 **ACCESS POINTS**

| Service | Port | URL |
|---------|------|-----|
| Web Frontend | 3000 | http://localhost:3000 |
| Admin Frontend | 5174 | http://localhost:5174 |
| API Server | 8000 | http://localhost:8000 |
| API Docs | 8000 | http://localhost:8000/docs |
| Judge0 | 2358 | http://localhost:2358 |
| ChromaDB | 8001 | http://localhost:8001 |

---

**Total Technologies Used: 50+**

**Repository:** https://github.com/Jhananishri-B/learnquest-o
