# Quick Test Guide

## Test 1: Download Question Bank Template

### Steps:
1. Open admin panel: `http://localhost:5174/certification-test-manager`
2. Scroll to "Upload Question Banks (JSON)" section
3. Click the **"JSON Template"** button (with Download icon)
4. Verify file downloads as `question_bank_template.json`
5. Open the file and verify it contains:
   - 3 MCQ questions (Python, HTTP, Data Structures)
   - 2 Coding questions (Sum of Two Numbers, Reverse String)
   - Proper JSON structure with all fields

### Expected Result:
✅ File downloads successfully with enhanced template containing 5 sample questions

---

## Test 2: Finish Test Submission

### Steps:
1. Go to: `http://localhost:3000/certifications/proctored/test/DEMO-PYTHON/easy`
2. Write some code or select MCQ answers
3. Navigate through all questions using "Next" button
4. On the last question, click **"FINISH TEST"** button
5. Confirm the submission dialog
6. Verify you're redirected to certification page

### Expected Result:
✅ No errors
✅ Success message appears
✅ Redirected to `/certification` page
✅ Test marked as "completed" in database

### API Test (Alternative):
```bash
# Get a token first by logging in through the web UI
# Then use this curl command:

curl -X POST http://localhost:8000/api/cert-tests/finish \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "attempt_id": "YOUR_ATTEMPT_ID_HERE"
  }'

# Expected response:
{
  "message": "Test submitted successfully",
  "result": {
    "test_score": 0,
    "final_score": 0,
    "passed": false,
    "message": "Test submitted without grading. Please review your answers."
  }
}
```

---

## Test 3: Upload Template

### Steps:
1. Download the template (Test 1)
2. Edit the JSON file:
   - Change a question title
   - Modify difficulty level
   - Add a new question
3. In admin panel, click "Choose File" and select your edited JSON
4. Click "Upload" button
5. Wait for success message
6. Verify the new bank appears in "Uploaded Question Banks" section

### Expected Result:
✅ Upload succeeds
✅ New bank card appears with correct question count
✅ Bank name shown correctly

---

## Test 4: Create Test from Bank

### Steps:
1. Upload a question bank (Test 3)
2. Scroll to "Create Test from Question Bank" section
3. Fill in form:
   - **Cert ID**: `TEST-PYTHON`
   - **Difficulty**: `Easy`
   - Select your uploaded bank (click the card)
   - **Question Count**: `5`
   - **Duration**: `30` minutes
   - **Pass Percentage**: `70`
4. Click "Save Test Spec"
5. Verify success message

### Expected Result:
✅ Test spec created successfully
✅ Can now start test at: `/certifications/proctored/test/TEST-PYTHON/easy`

---

## Verification Checklist

After running all tests, verify:

- [ ] Template downloads with 5 sample questions
- [ ] Finish test button works without errors
- [ ] Test completion redirects correctly
- [ ] Bank upload succeeds
- [ ] New test spec can be created
- [ ] Students can take newly created tests
- [ ] API endpoint `/api/cert-tests/finish` returns 200 OK
- [ ] Database shows attempt status as "completed"

---

## Troubleshooting

### Issue: Template doesn't download
**Solution:** Check browser console for errors. Ensure admin panel is running on port 5174.

### Issue: Finish test gives 404
**Solution:** 
```bash
# Restart API container
docker compose restart api

# Check logs
docker compose logs api
```

### Issue: Can't upload template
**Solution:** 
- Verify JSON is valid (use JSONLint.com)
- Check file extension is .json
- Ensure API is running

### Issue: Test not found when starting
**Solution:**
- Verify test spec was created in admin panel
- Check cert_id and difficulty match exactly
- Use lowercase for difficulty (easy, medium, hard)

---

## Database Verification

To verify test completion in MongoDB:

```javascript
// Connect to MongoDB
use learnquest

// Check completed attempts
db.cert_attempts.find({ status: "completed" }).pretty()

// Should see:
{
  "_id": ObjectId("..."),
  "user_id": "...",
  "status": "completed",
  "completed_at": ISODate("2025-10-30T..."),
  ...
}
```

---

## Success Criteria

All tests pass when:
1. ✅ Template downloads with enhanced examples
2. ✅ Finish test completes without 404 errors
3. ✅ Success toast appears on submission
4. ✅ Database shows "completed" status
5. ✅ API logs show 200 OK for /finish endpoint
6. ✅ No errors in browser console
7. ✅ Can upload and use downloaded template

**Status:** Ready for testing! 🚀
