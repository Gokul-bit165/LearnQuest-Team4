# Submit Problem Button Issue - Complete Fix

## Problem Description
When clicking the "Submit Problem" button in the coding test interface, the button shows "Submitting..." and appears to stay in that state indefinitely.

## Changes Implemented

### 1. Frontend Changes (`apps/web-frontend/src/pages/CodingTestInterface.jsx`)

#### Enhanced Button UI
- Changed button text from "Submit" to "Submit Problem" for clarity
- Added animated spinner during submission
- Button now shows:
  - **Normal state**: "Submit Problem" with checkmark icon
  - **Submitting state**: "Submitting..." with spinning loader

#### Added Comprehensive Debugging
```javascript
// Debug logs track the entire submission flow:
=== handleSubmitProblem START ===
Current question: X
Attempt ID: XXXXX
... (test execution) ...
=== Saving submission to database ===
Payload: {...}
✓ Code submission saved to database
=== handleSubmitProblem COMPLETE ===
Setting isRunning to false
=== handleSubmitProblem END ===
```

#### Improved Error Handling
- Detailed error logging with response status and messages
- Console output shows success/failure of database save
- Better user feedback with specific error messages

#### State Management Fix
- Ensured `setIsRunning(false)` is called in finally block
- Prevents stuck "Submitting..." state even if errors occur

### 2. Backend Changes (`services/api/src/routes/cert_tests_runtime.py`)

#### Added Debug Logging to `/submit-code` Endpoint
```python
=== /submit-code endpoint called ===
User: user@example.com
Payload keys: [...]
attempt_id: XXXXX
question_number: X
code_length: XXX
language_id: XX
passed: True/False
```

## How to Test

### Method 1: Browser Console (Recommended)

1. **Open Browser Developer Tools**
   - Navigate to http://localhost:3000
   - Press `F12` to open Developer Tools
   - Click "Console" tab

2. **Start a Test**
   - Login to LearnQuest
   - Start a coding certification test
   - Write code for any problem

3. **Submit Problem**
   - Click the purple "Submit Problem" button
   - **Watch the button**: Should show spinner + "Submitting..."
   - **Watch the console**: Should see debug logs starting with `===`

4. **Expected Console Output**
   ```
   === handleSubmitProblem START ===
   Current question: 0
   Attempt ID: 673xxxxx
   Submitting with test cases: [...]
   === Saving submission to database ===
   Payload: { attempt_id: "...", question_number: 0, ... }
   ✓ Code submission saved to database: { message: "...", passed: true }
   === handleSubmitProblem COMPLETE ===
   Setting isRunning to false
   === handleSubmitProblem END ===
   ```

5. **Check Button State**
   - Button should return to "Submit Problem" (no spinner)
   - Console panel should show test results
   - Toast notification should appear

### Method 2: Backend Logs

1. **Open a terminal**
2. **Run the log viewer**:
   ```powershell
   docker compose logs -f api
   ```

3. **Submit a problem** in the browser

4. **Expected Backend Output**:
   ```
   === /submit-code endpoint called ===
   User: your_email@example.com
   Payload keys: ['attempt_id', 'question_number', ...]
   attempt_id: 673xxxxx
   question_number: 0
   code_length: 150
   language_id: 71
   passed: True
   ```

## Troubleshooting

### Issue: Button Stays "Submitting..."

**Check Browser Console for:**

1. **Network Error**
   - Error message: `Failed to fetch` or `Network Error`
   - **Solution**: Check if API is running
   ```powershell
   docker compose ps
   ```

2. **Backend Error (500)**
   - Error message: `Error: Failed to submit solution`
   - **Solution**: Check backend logs
   ```powershell
   docker compose logs api | Select-String -Pattern "error" -CaseSensitive:$false
   ```

3. **Authentication Error (401/403)**
   - Error message: `Unauthorized` or `Forbidden`
   - **Solution**: Logout and login again (token expired)

4. **Missing Attempt ID**
   - Console shows: `No attemptId available - skipping database save`
   - **Solution**: Test was not started properly - restart the test

5. **Timeout Error**
   - Long delay then error
   - **Solution**: Check Judge0 is running
   ```powershell
   docker compose ps judge0
   ```

### Issue: No Debug Logs Appearing

1. **Clear browser cache**
   - Press `Ctrl + Shift + Del`
   - Clear cached images and files
   - Refresh page with `Ctrl + F5`

2. **Verify container rebuilt**
   ```powershell
   docker compose ps web
   # Should show "Up X seconds" (recent restart)
   ```

3. **Rebuild if needed**
   ```powershell
   docker compose up -d --build web
   ```

## Technical Details

### API Endpoint
- **URL**: `POST /api/cert-tests/submit-code`
- **Auth**: Required (JWT token in Authorization header)
- **Payload**:
  ```json
  {
    "attempt_id": "string",
    "question_number": 0,
    "code": "string",
    "language_id": 71,
    "passed": true,
    "test_results": { ... }
  }
  ```
- **Response**:
  ```json
  {
    "message": "Code submitted successfully",
    "passed": true
  }
  ```

### Frontend State Flow
```
User clicks "Submit Problem"
  ↓
setIsRunning(true) → Button shows "Submitting..."
  ↓
Run test cases via /run-code
  ↓
Save submission via /submit-code
  ↓
setIsRunning(false) → Button returns to normal
  ↓
Show toast notification
```

### Key Files Modified
1. `apps/web-frontend/src/pages/CodingTestInterface.jsx`
   - Lines 489-601: handleSubmitProblem function
   - Lines 968-987: Submit button UI

2. `services/api/src/routes/cert_tests_runtime.py`
   - Lines 499-565: /submit-code endpoint

## Quick Commands

### Check Services
```powershell
docker compose ps
```

### Restart API
```powershell
docker compose restart api
```

### Rebuild Web Frontend
```powershell
docker compose up -d --build web
```

### View Logs
```powershell
# API logs
docker compose logs -f api

# All logs
docker compose logs -f
```

### Test Services
```powershell
.\test_submit_issue.ps1
```

## What to Report

If the issue persists, please provide:

1. **Browser Console Screenshot** (F12 → Console tab)
2. **All console logs** (copy/paste everything with `===`)
3. **Any error messages** (red text in console)
4. **Does button eventually return to normal?** (Yes/No)
5. **Backend logs** from `docker compose logs api | Select-Object -Last 50`

This information will help identify the exact point of failure.

## Success Criteria

✅ **Working correctly when:**
1. Click "Submit Problem" → button shows spinner
2. Console shows all debug logs (===)
3. Console shows "✓ Submission saved to database successfully!"
4. Button returns to "Submit Problem" (no spinner)
5. Toast notification appears
6. Can submit other problems without issues

## Files Created
- `DEBUG_SUBMIT_ISSUE.md` - Detailed debug guide
- `test_submit_issue.ps1` - Quick test script
- `SUBMIT_PROBLEM_FIX_COMPLETE.md` - This document
