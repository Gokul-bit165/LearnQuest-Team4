# 🧠 GNN-Based Adaptive Practice System Setup Guide

## 🎯 **Complete Implementation**

I've successfully implemented a **Graph Neural Network (GNN) based adaptive practice system** for LearnQuest! This system uses AI to recommend personalized practice problems based on user behavior patterns.

## 📋 **What Was Implemented**

### ✅ **Backend Components:**

1. **User Simulation Script** (`scripts/simulate_users.py`)
   - Creates 50 fake users with practice history
   - Generates `(User) -[:SOLVED]-> (Problem)` relationships
   - Provides training data for the GNN

2. **GNN Training System** (`services/gnn/train.py`)
   - Heterogeneous Graph Neural Network using PyTorch Geometric
   - Learns user-problem-topic relationships
   - Saves trained model and node mappings

3. **GNN API Endpoint** (`services/api/src/routes/gnn.py`)
   - `/api/gnn/recommend` - Gets personalized problem recommendations
   - `/api/gnn/status` - Checks if model is loaded
   - `/api/gnn/reload` - Reloads the model

4. **AI Agent Integration** (`services/api/src/routes/ai.py`)
   - `/api/ai/generate-practice` - Combines GNN recommendations with AI coaching
   - Generates personalized messages using Llama3
   - Returns both recommendations and encouraging messages

5. **Updated Dependencies** (`services/api/requirements.txt`)
   - Added `torch>=2.0.0`
   - Added `torch-geometric>=2.4.0`

### ✅ **Frontend Components:**

1. **Enhanced Quiz Results** (`apps/web-frontend/src/pages/Quiz.jsx`)
   - Shows "Build My Personalized Practice Plan" button for scores < 80%
   - Displays AI-generated practice plan in a modal
   - Links to individual practice problems

2. **API Integration** (`apps/web-frontend/src/services/api.js`)
   - Added `generatePracticePlan()` function
   - Connects frontend to AI agent endpoint

## 🚀 **Setup Instructions**

### **Phase 1: Data Preparation (CRITICAL)**

Before the GNN can work, you need sufficient data:

1. **Create More Practice Problems:**
   ```bash
   # Go to Admin Panel: http://localhost:5174
   # Navigate to "Practice Problems" -> "Create New Problem"
   # Create at least 15-20 coding problems
   # IMPORTANT: Link each problem to a Course and Topic
   ```

2. **Run User Simulation:**
   ```bash
   python scripts/simulate_users.py
   ```

### **Phase 2: Train the GNN Model**

1. **Rebuild API with new dependencies:**
   ```bash
   docker-compose build api
   docker-compose up -d api
   ```

2. **Train the GNN model:**
   ```bash
   docker-compose exec api python services/gnn/train.py
   ```

3. **Verify model training:**
   ```bash
   # Check if files were created:
   ls services/gnn/
   # Should show: gnn_model.pt, node_mappings.json
   ```

### **Phase 3: Test the System**

1. **Start all services:**
   ```bash
   docker-compose up
   ```

2. **Test the API endpoints:**
   ```bash
   # Check GNN status
   curl http://localhost:8000/api/gnn/status
   
   # Test recommendation (replace USER_ID with actual user ID)
   curl -X POST http://localhost:8000/api/gnn/recommend \
     -H "Content-Type: application/json" \
     -d '{"user_id": "USER_ID", "failed_problem_ids": [], "num_recommendations": 5}'
   ```

3. **Test the full flow:**
   - Take a quiz and score below 80%
   - Click "Build My Personalized Practice Plan"
   - Verify AI-generated recommendations appear

## 🔧 **How It Works**

### **Graph Structure:**
```
Users ←→ Problems ←→ Topics
  ↓        ↓         ↓
Solved  Belongs_To  Course
```

### **Recommendation Flow:**
1. **User completes quiz** with score < 80%
2. **Frontend extracts** failed problem IDs
3. **AI Agent calls GNN** to get recommendations
4. **GNN analyzes** user-problem-topic relationships
5. **AI generates** personalized coaching message
6. **Frontend displays** practice plan with problems

### **GNN Architecture:**
- **Heterogeneous Graph** with Users, Problems, Topics
- **SAGEConv layers** for learning embeddings
- **Link prediction** for user-problem recommendations
- **Similarity scoring** based on learned embeddings

## 🎯 **Key Features**

### **Intelligent Recommendations:**
- ✅ **User-based**: Learns from similar users' behavior
- ✅ **Problem-based**: Considers problem difficulty and topics
- ✅ **Topic-based**: Understands concept relationships
- ✅ **Personalized**: Adapts to individual learning patterns

### **AI Coaching:**
- ✅ **Encouraging messages** from Questie AI coach
- ✅ **Contextual explanations** for why problems were recommended
- ✅ **Motivational tone** to keep students engaged

### **Seamless Integration:**
- ✅ **Automatic triggering** when quiz score < 80%
- ✅ **One-click generation** of practice plans
- ✅ **Direct links** to practice problems
- ✅ **Beautiful UI** with modal display

## 🔍 **Troubleshooting**

### **"GNN model not loaded" Error:**
```bash
# Check if model files exist
ls services/gnn/gnn_model.pt services/gnn/node_mappings.json

# If missing, retrain the model
docker-compose exec api python services/gnn/train.py
```

### **"No problems found" Error:**
```bash
# Check if you have enough practice problems
python -c "
import sys, os
sys.path.append('services/api/src')
from database import get_database
db = get_database()
count = db.questions.count_documents({'type': 'code'})
print(f'Code problems: {count}')
"
```

### **"No user-problem edges" Error:**
```bash
# Run user simulation to create training data
python scripts/simulate_users.py
```

### **Frontend Not Showing Button:**
- Ensure quiz score is below 80%
- Check browser console for errors
- Verify API endpoint is working: `curl http://localhost:8000/api/gnn/status`

## 📊 **Performance Optimization**

### **For Production:**
1. **GPU Acceleration**: Install CUDA for faster training
2. **Model Caching**: Keep trained model in memory
3. **Batch Processing**: Process multiple recommendations together
4. **Database Indexing**: Index user-problem relationships

### **For Development:**
1. **Smaller Datasets**: Use fewer simulated users for faster training
2. **Simpler Models**: Reduce embedding dimensions
3. **Cached Recommendations**: Store recommendations temporarily

## 🎉 **Success Indicators**

You'll know the system is working when:

1. ✅ **User simulation** creates 50 users with practice history
2. ✅ **GNN training** completes without errors
3. ✅ **Model files** are created in `services/gnn/`
4. ✅ **API endpoints** return recommendations
5. ✅ **Frontend shows** "Build My Personalized Practice Plan" button
6. ✅ **AI generates** personalized coaching messages
7. ✅ **Practice problems** are recommended and clickable

## 🚀 **Next Steps**

1. **Add more data** - Create more courses, topics, and problems
2. **Fine-tune model** - Adjust GNN parameters for better recommendations
3. **A/B testing** - Compare GNN vs random recommendations
4. **Analytics** - Track recommendation effectiveness
5. **Real-time learning** - Update model as users solve more problems

## 💡 **Pro Tips**

- **Start small**: Begin with 10-15 problems and 20-30 users
- **Monitor performance**: Check API response times and accuracy
- **Iterate quickly**: Retrain model when adding new data
- **User feedback**: Track which recommendations users actually solve
- **Gradual rollout**: Test with a subset of users first

Your GNN-based adaptive practice system is now ready to provide personalized learning experiences! 🎯✨
