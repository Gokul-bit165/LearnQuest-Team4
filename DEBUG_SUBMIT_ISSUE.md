# Debug Guide: Submit Problem "Running..." Issue

## Problem
When clicking "Submit Problem" button, it shows "Submitting..." and appears to stay in running state.

## Changes Made

### 1. Enhanced Frontend Debugging (`CodingTestInterface.jsx`)
- Added extensive console logging to track submission flow
- Improved button UI to show "Submitting..." with spinner animation
- Added database save confirmation messages
- Better error handling with detailed error logs

### 2. Enhanced Backend Debugging (`cert_tests_runtime.py`)
- Added print statements to `/submit-code` endpoint
- Logs when endpoint is called and all payload details

### 3. Visual Improvements
- Changed "Submit" button to "Submit Problem" for clarity
- Added spinner animation during submission
- Console output now shows "✓ Submission saved to database successfully!"

## How to Test

### Step 1: Open Browser Developer Console
1. Navigate to http://localhost:5173
2. Press F12 to open Developer Tools
3. Click on the "Console" tab
4. Keep this open while testing

### Step 2: Take a Test
1. Login to LearnQuest
2. Start a coding certification test
3. Write some code for a problem

### Step 3: Click "Submit Problem"
1. Click the purple "Submit Problem" button
2. Watch the button change to show spinner + "Submitting..."
3. Watch the Console panel (bottom) - should show test results

### Step 4: Check Debug Output

**In Browser Console (F12):**
You should see logs like:
```
=== handleSubmitProblem START ===
Current question: 0
Attempt ID: 673ab12...
Submitting with test cases: [...]
=== Saving submission to database ===
Payload: { attempt_id: "...", question_number: 0, ... }
✓ Code submission saved to database: { message: "...", passed: true }
=== handleSubmitProblem COMPLETE ===
Setting isRunning to false
=== handleSubmitProblem END ===
```

**In Terminal (Docker Logs):**
Run this command to see backend logs:
```powershell
docker compose logs -f api
```

You should see:
```
=== /submit-code endpoint called ===
User: your_email@example.com
Payload keys: ['attempt_id', 'question_number', 'code', ...]
attempt_id: 673ab12...
question_number: 0
code_length: 150
language_id: 71
passed: True
```

### Step 5: Identify the Issue

**If button stays "Submitting...":**
- Check browser console for errors (red text)
- Look for where the flow stops
- Check if there's a network error

**Common Issues:**

1. **Network Error:**
   - Console shows: `Failed to fetch` or `Network error`
   - Solution: Check if API is running (`docker ps`)

2. **Backend Error:**
   - Console shows: `Error: Failed to submit solution`
   - Check terminal logs for Python errors

3. **Missing attemptId:**
   - Console shows: `No attemptId available - skipping database save`
   - Test was not started properly

4. **Authentication Error:**
   - Status 401 or 403 errors
   - Token expired - logout and login again

## Expected Behavior

✅ **Success Flow:**
1. Click "Submit Problem"
2. Button shows spinner + "Submitting..."
3. Test cases run (3-5 seconds)
4. Console shows test results
5. Console shows "✓ Submission saved to database successfully!"
6. Button returns to normal "Submit Problem"
7. Toast notification appears

## Quick Commands

### Check if containers are running:
```powershell
docker ps
```

### View API logs in real-time:
```powershell
docker compose logs -f api
```

### Restart API if needed:
```powershell
docker compose restart api
```

### Check frontend is running:
```powershell
# Should see something running on port 5173
netstat -ano | findstr :5173
```

## What to Report Back

Please provide:
1. **Screenshot** of browser console (F12) after clicking Submit Problem
2. **Copy the console logs** (all the `===` messages)
3. **Any error messages** (red text in console)
4. **Does the button eventually return to normal?** Or does it stay "Submitting..."?

This will help me identify exactly where the issue is occurring!
