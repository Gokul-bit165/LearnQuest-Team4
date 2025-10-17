#!/usr/bin/env python3
"""
Database seeding script for Learn Quest MVP
Creates sample data for users, courses, modules, quizzes, and questions
"""

import os
import sys
from datetime import datetime
from pymongo import MongoClient
from passlib.context import CryptContext
import uuid

# Add the services/api/src directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'services', 'api', 'src'))

# MongoDB connection
MONGO_URL = os.getenv("MONGO_URL", "mongodb://db:27017")
DB_NAME = os.getenv("MONGO_DB", "learnquest")

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_database():
    """Connect to MongoDB and return database instance"""
    client = MongoClient(MONGO_URL)
    return client[DB_NAME]

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    return pwd_context.hash(password)

def create_sample_user(db):
    """Create a sample user with hashed password"""
    users_collection = db.users
    
    # Check if user already exists
    existing_user = users_collection.find_one({"email": "student@learnquest.com"})
    if existing_user:
        print("Sample user already exists")
        return existing_user["_id"]
    
    user_data = {
        "name": "John Student",
        "email": "student@learnquest.com",
        "password_hash": hash_password("password123"),
        "avatar_url": None,
        "auth_provider": "email",
        "xp": 0,
        "level": 1,
        "enrolled_courses": [],
        "quiz_history": [],
        "badges": [],
        "created_at": datetime.utcnow()
    }
    
    result = users_collection.insert_one(user_data)
    print(f"Created sample user: {result.inserted_id}")
    return result.inserted_id

def create_sample_courses(db):
    """Create sample courses with modules"""
    courses_collection = db.courses
    
    # Python Basics Course
    python_course = {
        "title": "Python Basics",
        "slug": "python-basics",
        "description": "Learn the fundamentals of Python programming language",
        "xp_reward": 100,
        "modules": [
            {
                "module_id": str(uuid.uuid4()),
                "title": "Introduction to Python",
                "order": 1,
                "topics": [
                    {
                        "topic_id": str(uuid.uuid4()),
                        "title": "What is Python?",
                        "content_url": "/content/python-intro"
                    },
                    {
                        "topic_id": str(uuid.uuid4()),
                        "title": "Python Syntax",
                        "content_url": "/content/python-syntax"
                    }
                ]
            },
            {
                "module_id": str(uuid.uuid4()),
                "title": "Variables and Data Types",
                "order": 2,
                "topics": [
                    {
                        "topic_id": str(uuid.uuid4()),
                        "title": "Variables in Python",
                        "content_url": "/content/python-variables"
                    },
                    {
                        "topic_id": str(uuid.uuid4()),
                        "title": "Data Types",
                        "content_url": "/content/python-data-types"
                    }
                ]
            },
            {
                "module_id": str(uuid.uuid4()),
                "title": "Control Flow",
                "order": 3,
                "topics": [
                    {
                        "topic_id": str(uuid.uuid4()),
                        "title": "If Statements",
                        "content_url": "/content/python-if"
                    },
                    {
                        "topic_id": str(uuid.uuid4()),
                        "title": "Loops",
                        "content_url": "/content/python-loops"
                    }
                ]
            }
        ],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    # Data Structures Course
    ds_course = {
        "title": "Data Structures",
        "slug": "data-structures",
        "description": "Master fundamental data structures and algorithms",
        "xp_reward": 150,
        "modules": [
            {
                "module_id": str(uuid.uuid4()),
                "title": "Arrays and Lists",
                "order": 1,
                "topics": [
                    {
                        "topic_id": str(uuid.uuid4()),
                        "title": "Array Basics",
                        "content_url": "/content/arrays-basics"
                    }
                ]
            },
            {
                "module_id": str(uuid.uuid4()),
                "title": "Linked Lists",
                "order": 2,
                "topics": [
                    {
                        "topic_id": str(uuid.uuid4()),
                        "title": "Singly Linked Lists",
                        "content_url": "/content/linked-lists"
                    }
                ]
            }
        ],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    # Insert courses
    python_result = courses_collection.insert_one(python_course)
    ds_result = courses_collection.insert_one(ds_course)
    
    print(f"Created Python Basics course: {python_result.inserted_id}")
    print(f"Created Data Structures course: {ds_result.inserted_id}")
    
    return python_result.inserted_id, ds_result.inserted_id

def create_sample_quiz(db, course_id):
    """Create a sample quiz for the Python Basics course"""
    quizzes_collection = db.quizzes
    
    quiz_data = {
        "course_id": str(course_id),
        "title": "Python Basics Quiz",
        "duration_seconds": 1800,  # 30 minutes
        "question_ids": [],
        "xp_reward": 50,
        "created_at": datetime.utcnow()
    }
    
    result = quizzes_collection.insert_one(quiz_data)
    print(f"Created quiz: {result.inserted_id}")
    return result.inserted_id

def create_sample_questions(db, quiz_id, course_id):
    """Create sample MCQ questions for the quiz"""
    quizzes_collection = db.quizzes
    questions_collection = db.questions
    
    questions = [
        {
            "type": "mcq",
            "course_id": str(course_id),
            "quiz_id": str(quiz_id),
            "prompt": "What is the correct way to declare a variable in Python?",
            "choices": [
                "var x = 5",
                "x = 5",
                "int x = 5",
                "x := 5"
            ],
            "correct_choice": 1,  # Index 1 is "x = 5"
            "difficulty": "easy",
            "tags": ["variables", "syntax"],
            "created_at": datetime.utcnow()
        },
        {
            "type": "mcq",
            "course_id": str(course_id),
            "quiz_id": str(quiz_id),
            "prompt": "Which of the following is NOT a Python data type?",
            "choices": [
                "int",
                "string",
                "char",
                "float"
            ],
            "correct_choice": 2,  # Index 2 is "char"
            "difficulty": "easy",
            "tags": ["data-types"],
            "created_at": datetime.utcnow()
        },
        {
            "type": "mcq",
            "course_id": str(course_id),
            "quiz_id": str(quiz_id),
            "prompt": "What will be the output of: print(3 + 2 * 4)",
            "choices": [
                "20",
                "11",
                "14",
                "Error"
            ],
            "correct_choice": 1,  # Index 1 is "11"
            "difficulty": "medium",
            "tags": ["operators", "precedence"],
            "created_at": datetime.utcnow()
        },
        {
            "type": "mcq",
            "course_id": str(course_id),
            "quiz_id": str(quiz_id),
            "prompt": "Which keyword is used to define a function in Python?",
            "choices": [
                "function",
                "def",
                "define",
                "func"
            ],
            "correct_choice": 1,  # Index 1 is "def"
            "difficulty": "easy",
            "tags": ["functions"],
            "created_at": datetime.utcnow()
        },
        {
            "type": "mcq",
            "course_id": str(course_id),
            "quiz_id": str(quiz_id),
            "prompt": "What is the result of: 'Hello' + 'World'",
            "choices": [
                "HelloWorld",
                "Hello World",
                "Hello+World",
                "Error"
            ],
            "correct_choice": 0,  # Index 0 is "HelloWorld"
            "difficulty": "easy",
            "tags": ["strings", "concatenation"],
            "created_at": datetime.utcnow()
        }
    ]
    
    question_ids = []
    for question in questions:
        result = questions_collection.insert_one(question)
        question_ids.append(str(result.inserted_id))
        print(f"Created question: {result.inserted_id}")
    
    # Update quiz with question IDs
    quizzes_collection.update_one(
        {"_id": quiz_id},
        {"$set": {"question_ids": question_ids}}
    )
    
    return question_ids

def main():
    """Main seeding function"""
    print("Starting database seeding...")
    
    try:
        db = get_database()
        print(f"Connected to database: {DB_NAME}")
        
        # Create sample user
        user_id = create_sample_user(db)
        
        # Create sample courses
        python_course_id, ds_course_id = create_sample_courses(db)
        
        # Create sample quiz for Python course
        quiz_id = create_sample_quiz(db, python_course_id)
        
        # Create sample questions
        question_ids = create_sample_questions(db, quiz_id, python_course_id)
        
        print("\n✅ Database seeding completed successfully!")
        print(f"📊 Created:")
        print(f"  - 1 user (student@learnquest.com / password123)")
        print(f"  - 2 courses (Python Basics, Data Structures)")
        print(f"  - 1 quiz with {len(question_ids)} questions")
        
    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
