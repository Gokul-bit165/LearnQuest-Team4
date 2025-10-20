#!/usr/bin/env python3
"""
Seed script to add demo practice problems to the Learn Quest platform.
"""

import os
import sys
from datetime import datetime
from pymongo import MongoClient
from bson import ObjectId
import uuid

# Add the services/api/src directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'services', 'api', 'src'))

# MongoDB connection
MONGO_URL = os.getenv("MONGO_URL", "mongodb://db:27017")
DB_NAME = os.getenv("MONGO_DB", "learnquest")

def get_database():
    """Connect to MongoDB and return database instance"""
    client = MongoClient(MONGO_URL)
    return client[DB_NAME]

def add_practice_problems():
    """Add demo practice problems to the questions collection"""
    db = get_database()
    questions = db.questions
    courses = db.courses
    
    # Find the Python Basics course to get its ID
    python_course = courses.find_one({"slug": "python-basics"})
    if not python_course:
        print("Python Basics course not found")
        return
    
    course_id = str(python_course["_id"])
    
    # Add practice problems to the questions collection
    practice_problems = [
        {
            "type": "code",
            "course_id": course_id,
            "quiz_id": None,  # Practice problems don't belong to a quiz
            "prompt": "Two Sum - Find two numbers that add up to a target",
            "code_starter": "def two_sum(nums, target):\n    # Your code here\n    pass\n\n# Test your function\nif __name__ == '__main__':\n    import sys\n    data = sys.stdin.read().strip()\n    lines = data.split('\\n')\n    nums = list(map(int, lines[0].split()))\n    target = int(lines[1])\n    result = two_sum(nums, target)\n    print(' '.join(map(str, result)))",
            "test_cases": [
                {
                    "input": "2 7 11 15\n9",
                    "expected_output": "0 1",
                    "is_hidden": False
                },
                {
                    "input": "3 2 4\n6",
                    "expected_output": "1 2",
                    "is_hidden": False
                },
                {
                    "input": "3 3\n6",
                    "expected_output": "0 1",
                    "is_hidden": True
                }
            ],
            "difficulty": "easy",
            "tags": ["arrays", "hash-table"],
            "xp_reward": 15,
            "is_practice_problem": True,
            "explanation": "Use a hash map to store numbers and their indices. For each number, check if target - number exists in the map.",
            "created_at": datetime.utcnow()
        },
        {
            "type": "code",
            "course_id": course_id,
            "quiz_id": None,
            "prompt": "Reverse String - Reverse a string in-place",
            "code_starter": "def reverse_string(s):\n    # Your code here\n    pass\n\n# Test your function\nif __name__ == '__main__':\n    import sys\n    s = sys.stdin.read().strip()\n    reverse_string(s)\n    print(s)",
            "test_cases": [
                {
                    "input": "hello",
                    "expected_output": "olleh",
                    "is_hidden": False
                },
                {
                    "input": "abcd",
                    "expected_output": "dcba",
                    "is_hidden": False
                },
                {
                    "input": "a",
                    "expected_output": "a",
                    "is_hidden": True
                }
            ],
            "difficulty": "easy",
            "tags": ["two-pointers", "string"],
            "xp_reward": 10,
            "is_practice_problem": True,
            "explanation": "Use two pointers, one at the start and one at the end. Swap characters and move pointers towards the center.",
            "created_at": datetime.utcnow()
        },
        {
            "type": "code",
            "course_id": course_id,
            "quiz_id": None,
            "prompt": "Valid Parentheses - Check if parentheses are balanced",
            "code_starter": "def is_valid(s):\n    # Your code here\n    pass\n\n# Test your function\nif __name__ == '__main__':\n    import sys\n    s = sys.stdin.read().strip()\n    result = is_valid(s)\n    print('true' if result else 'false')",
            "test_cases": [
                {
                    "input": "()",
                    "expected_output": "true",
                    "is_hidden": False
                },
                {
                    "input": "()[]{}",
                    "expected_output": "true",
                    "is_hidden": False
                },
                {
                    "input": "(]",
                    "expected_output": "false",
                    "is_hidden": False
                },
                {
                    "input": "([)]",
                    "expected_output": "false",
                    "is_hidden": True
                }
            ],
            "difficulty": "easy",
            "tags": ["stack", "string"],
            "xp_reward": 12,
            "is_practice_problem": True,
            "explanation": "Use a stack to keep track of opening brackets. When you encounter a closing bracket, check if it matches the most recent opening bracket.",
            "created_at": datetime.utcnow()
        },
        {
            "type": "code",
            "course_id": course_id,
            "quiz_id": None,
            "prompt": "Maximum Subarray - Find the contiguous subarray with maximum sum",
            "code_starter": "def max_subarray(nums):\n    # Your code here\n    pass\n\n# Test your function\nif __name__ == '__main__':\n    import sys\n    data = sys.stdin.read().strip()\n    nums = list(map(int, data.split()))\n    result = max_subarray(nums)\n    print(result)",
            "test_cases": [
                {
                    "input": "-2 1 -3 4 -1 2 1 -5 4",
                    "expected_output": "6",
                    "is_hidden": False
                },
                {
                    "input": "1",
                    "expected_output": "1",
                    "is_hidden": False
                },
                {
                    "input": "5 4 -1 7 8",
                    "expected_output": "23",
                    "is_hidden": True
                }
            ],
            "difficulty": "medium",
            "tags": ["array", "divide-and-conquer", "dynamic-programming"],
            "xp_reward": 20,
            "is_practice_problem": True,
            "explanation": "Use Kadane's algorithm. Keep track of the maximum sum ending at each position and the global maximum sum.",
            "created_at": datetime.utcnow()
        },
        {
            "type": "code",
            "course_id": course_id,
            "quiz_id": None,
            "prompt": "Binary Tree Inorder Traversal - Traverse a binary tree in-order",
            "code_starter": "def inorder_traversal(root):\n    # Your code here\n    pass\n\n# Test your function\nif __name__ == '__main__':\n    import sys\n    # This is a simplified test - in practice you'd build the tree from input\n    data = sys.stdin.read().strip()\n    # For demo purposes, assume input is a list of values\n    values = data.split() if data else []\n    result = inorder_traversal(values)\n    print(' '.join(map(str, result)))",
            "test_cases": [
                {
                    "input": "1 null 2 3",
                    "expected_output": "1 3 2",
                    "is_hidden": False
                },
                {
                    "input": "",
                    "expected_output": "",
                    "is_hidden": False
                },
                {
                    "input": "1",
                    "expected_output": "1",
                    "is_hidden": True
                }
            ],
            "difficulty": "easy",
            "tags": ["stack", "tree", "depth-first-search"],
            "xp_reward": 15,
            "is_practice_problem": True,
            "explanation": "In-order traversal: left subtree, root, right subtree. Use recursion or a stack to implement.",
            "created_at": datetime.utcnow()
        }
    ]
    
    # Insert practice problems into the questions collection
    for problem in practice_problems:
        questions.insert_one(problem)
    
    print(f"✅ Added {len(practice_problems)} practice problems to the questions collection")

def main():
    """Main function"""
    print("Starting practice problems seeding...")
    
    try:
        add_practice_problems()
        print("✅ Practice problems seeding completed successfully!")
        
    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
