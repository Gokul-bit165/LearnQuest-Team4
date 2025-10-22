# Course JSON Template Guide

## Perfect Template for Admin Panel Upload

This template (`course_template.json`) is guaranteed to work with your admin panel. Here's what makes it perfect:

### ✅ **Fixed Issues**
1. **Card Types**: Uses `"fill-in-blank"` (not `"fill_blank"`)
2. **Field Names**: Uses `"correct_answers"` and `"blanks"` arrays (not `"answer"`)
3. **Structure**: Follows the exact format expected by the backend

### 📋 **Template Structure**

```json
{
  "title": "Course Title",
  "description": "Course description",
  "xp_reward": 1300,
  "modules": [
    {
      "title": "Module Title",
      "order": 1,
      "topics": [
        {
          "title": "Topic Title",
          "content": "Topic description",
          "xp_reward": 150,
          "cards": [
            // Card objects here
          ]
        }
      ]
    }
  ]
}
```

### 🎯 **Card Types Supported**

#### 1. **Theory Cards**
```json
{
  "type": "theory",
  "content": "Educational content",
  "xp_reward": 10,
  "explanation": "Additional explanation"
}
```

#### 2. **Multiple Choice Questions**
```json
{
  "type": "mcq",
  "content": "Question text?",
  "choices": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "correct_choice_index": 0,
  "xp_reward": 10,
  "explanation": "Why this answer is correct"
}
```

#### 3. **Code Challenges**
```json
{
  "type": "code",
  "content": "Coding challenge description",
  "xp_reward": 40,
  "starter_code": "print('Hello World')",
  "test_cases": [
    {
      "input": "",
      "expected_output": "Hello World"
    }
  ],
  "explanation": "Solution explanation"
}
```

#### 4. **Fill-in-the-Blank**
```json
{
  "type": "fill-in-blank",
  "content": "The answer is _____.",
  "blanks": ["blank"],
  "correct_answers": ["correct"],
  "xp_reward": 10,
  "explanation": "Explanation of the answer"
}
```

### 🚀 **How to Use**

1. **Copy the template**: Use `course_template.json` as your base
2. **Modify content**: Change titles, descriptions, and questions
3. **Upload**: Use the admin panel's "Upload JSON" button
4. **Success**: Your course will be created automatically!

### ⚠️ **Important Notes**

- **Unique Titles**: Each course must have a unique title
- **Valid JSON**: Ensure proper JSON formatting (no trailing commas)
- **Required Fields**: All fields shown in the template are required
- **Array Format**: `choices`, `test_cases`, `blanks`, and `correct_answers` must be arrays

### 🔧 **Quick Customization**

To create your own course:

1. **Change the title**: Update `"title"` field
2. **Update description**: Modify `"description"`
3. **Adjust XP**: Change `"xp_reward"` values
4. **Add/Remove modules**: Copy/paste module objects
5. **Modify cards**: Update card content and types

### 📝 **Example Custom Course**

```json
{
  "title": "My Custom Course",
  "description": "Learn something new!",
  "xp_reward": 500,
  "modules": [
    {
      "title": "Introduction",
      "order": 1,
      "topics": [
        {
          "title": "Getting Started",
          "content": "Welcome to the course!",
          "xp_reward": 50,
          "cards": [
            {
              "type": "theory",
              "content": "This is your first lesson.",
              "xp_reward": 10,
              "explanation": "Great job!"
            }
          ]
        }
      ]
    }
  ]
}
```

## Practice Problems JSON Template

You can bulk import practice problems via the Admin → Practice Problems → Upload JSON button. Provide either an array or an object with a `problems` array.

Required per problem: `prompt`, `code_starter`, `test_cases` (array of `{ input, expected_output, is_hidden? }`).

```json
{
  "problems": [
    {
      "prompt": "Print 'Hello, World!'",
      "code_starter": "# write code to print Hello, World!",
      "test_cases": [
        { "input": "", "expected_output": "Hello, World!", "is_hidden": false }
      ],
      "difficulty": "easy",
      "tags": ["basics", "io"],
      "xp_reward": 10,
      "explanation": "Use print('Hello, World!')",
      "is_practice_problem": true
    },
    {
      "prompt": "Sum two integers",
      "code_starter": "a = int(input())\nb = int(input())\n# print the sum",
      "test_cases": [
        { "input": "2\n3", "expected_output": "5", "is_hidden": false },
        { "input": "10\n-4", "expected_output": "6", "is_hidden": true }
      ],
      "difficulty": "medium",
      "tags": ["math"],
      "xp_reward": 20,
      "is_practice_problem": true
    }
  ]
}
```

Notes:
- Optional fields: `difficulty` (easy|medium|hard), `tags` (array), `xp_reward`, `explanation`, `course_id`, `topic_id`.
- If `course_id` and `topic_id` are provided, they will be stored on the problem document.

This template is tested and guaranteed to work with your admin panel! 🎉
