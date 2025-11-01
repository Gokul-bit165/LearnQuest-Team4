# 🧪 Exam Violations Dashboard - Testing Guide

## Pre-Testing Setup

### 1. Start All Services
```powershell
# Terminal 1: Start API Server
cd services/api
uvicorn src.main:app --reload --port 8000

# Terminal 2: Start Admin Frontend
cd apps/admin-frontend
npm run dev

# Terminal 3: MongoDB (if not running)
mongod
```

### 2. Verify Services Running
- API: http://localhost:8000/docs
- Admin Panel: http://localhost:5174
- MongoDB: Port 27017

### 3. Create Test Data (Optional)
```powershell
# If no test data exists, create some test attempts
cd services/api
python scripts/create_test_violations.py
```

---

## 🎯 Test Scenario 1: Basic Navigation

### Steps
1. Open browser: http://localhost:5174
2. Login as admin (email: admin@learnquest.com)
3. Look for "Exam Violations" in sidebar
4. Click "Exam Violations"

### Expected Results
✅ Dashboard loads successfully
✅ Summary cards appear at top
✅ Candidate table shows below
✅ No console errors
✅ All elements render correctly

### If It Fails
- Check API server is running
- Verify admin token in localStorage
- Check browser console for errors
- Verify MongoDB has data

---

## 🎯 Test Scenario 2: Summary Cards

### Steps
1. Navigate to Exam Violations dashboard
2. Observe summary cards
3. Click "Total Candidates" card
4. Click "Safe Users" card
5. Click "Violations" card

### Expected Results
✅ All 6 cards visible
✅ Numbers display correctly
✅ Cards are clickable
✅ Clicking filters the table
✅ Active filter highlights card
✅ Status filter updates

### If It Fails
- Check API endpoint: `/api/admin/proctoring/statistics`
- Verify backend statistics calculation
- Check MongoDB data format

---

## 🎯 Test Scenario 3: Search & Filters

### Steps
1. Type candidate name in search box
2. Verify table updates in real-time
3. Select an exam from exam filter
4. Select "Safe" from status filter
5. Set date range
6. Clear all filters

### Expected Results
✅ Search filters instantly
✅ Exam filter works
✅ Status filter works
✅ Date range works
✅ Combined filters work
✅ Clear filters resets table

### Test Data Examples
```
Search: "Gokul"
Exam: "Python Certification"
Status: "Warning"
Date: Last 7 days
```

### If It Fails
- Check state updates in React
- Verify filter logic
- Check data format in backend
- Console log filtered results

---

## 🎯 Test Scenario 4: Candidate Table

### Steps
1. Verify table has data
2. Check all columns display
3. Verify color coding works
4. Hover over rows
5. Click "View Details" button

### Expected Results
✅ Table populated with candidates
✅ All 7 columns visible
✅ Violation counts colored correctly
✅ Category badges show correct color
✅ Hover effect works
✅ View Details opens modal

### Column Checklist
- [ ] Candidate (name + ID)
- [ ] Exam
- [ ] Duration
- [ ] Violations (colored)
- [ ] Score (colored)
- [ ] Category (badge)
- [ ] Action (button)

### If It Fails
- Check API response format
- Verify data mapping
- Check CSS classes
- Verify modal trigger

---

## 🎯 Test Scenario 5: Candidate Details Modal

### Steps
1. Click "View Details" on any candidate
2. Verify modal opens
3. Check header information
4. Click each tab (Timeline, Event Log, Admin Action)
5. Verify content in each tab
6. Close modal with X button
7. Close modal with Esc key

### Expected Results
✅ Modal opens smoothly
✅ Header shows candidate info
✅ All 3 tabs visible
✅ Tab content switches correctly
✅ Timeline shows violations
✅ Event log shows table
✅ Admin action shows buttons
✅ Modal closes correctly

### If It Fails
- Check detailed API calls
- Verify modal state management
- Check z-index for overlay
- Verify tab switching logic

---

## 🎯 Test Scenario 6: Timeline Tab

### Steps
1. Open candidate modal
2. Click "Timeline View" tab
3. Verify violation summary cards
4. Check violation timeline
5. Verify timestamps
6. Check confidence levels

### Expected Results
✅ Summary shows violation counts
✅ Timeline lists events chronologically
✅ Timestamps formatted correctly
✅ Confidence shown as percentage
✅ Violation types displayed
✅ Color coding applied

### Data to Check
- Violation types
- Count per type
- Timestamp format
- Confidence range (0-100%)

### If It Fails
- Check proctoring_logs format
- Verify date parsing
- Check violation type mapping
- Verify confidence calculation

---

## 🎯 Test Scenario 7: Event Log Tab

### Steps
1. Open candidate modal
2. Click "Event Log" tab
3. Verify table appears
4. Check all columns
5. Verify event types colored
6. Check weight calculation

### Expected Results
✅ Event log table displays
✅ All 5 columns visible
✅ Events sorted by time
✅ Event types color-coded
✅ Confidence shows correctly
✅ Weights calculated accurately

### Column Checklist
- [ ] Timestamp
- [ ] Type (colored badge)
- [ ] Violations (list)
- [ ] Confidence (%)
- [ ] Weight (number)

### If It Fails
- Check table data mapping
- Verify weight calculation
- Check color mapping
- Verify sorting

---

## 🎯 Test Scenario 8: Admin Action Panel

### Steps
1. Open candidate modal
2. Click "Admin Action" tab
3. Click each decision button
4. Verify selection highlights
5. Type in notes textarea
6. Click Submit without decision
7. Select decision and submit

### Expected Results
✅ All 3 decision buttons visible
✅ Selection highlights correctly
✅ Notes textarea functional
✅ Submit requires decision
✅ Submit with decision works
✅ Modal closes after submit
✅ Table updates with new status

### Decision Flow
1. Click "Mark as Safe" → Border turns green
2. Type notes → Text appears
3. Click Submit → API call made
4. Modal closes → Success message
5. Table refreshes → Status updated

### If It Fails
- Check decision state
- Verify API endpoint
- Check PUT request payload
- Verify response handling

---

## 🎯 Test Scenario 9: Export Functionality

### Steps
1. Apply some filters
2. Click "Export Report" button
3. Check Downloads folder
4. Open CSV file
5. Verify data accuracy

### Expected Results
✅ CSV file downloads
✅ Filename includes timestamp
✅ Headers correct
✅ Data matches filtered results
✅ All columns included
✅ Formatting correct

### CSV Columns
```
Candidate,Exam,Duration,Violations,Score,Category,Date
```

### If It Fails
- Check browser download permissions
- Verify CSV generation logic
- Check data encoding
- Verify file naming

---

## 🎯 Test Scenario 10: Error Handling

### Steps
1. Disconnect API server
2. Try to load dashboard
3. Try to open candidate details
4. Try to submit decision
5. Reconnect API server
6. Refresh dashboard

### Expected Results
✅ Loading state shows
✅ Error messages display
✅ No console crashes
✅ Retry options available
✅ Graceful degradation
✅ Recovery after reconnect

### Error Messages to Check
- "Failed to load violations dashboard"
- "Failed to load candidate details"
- "Failed to save decision"
- Connection error messages

### If It Fails
- Add try-catch blocks
- Improve error messages
- Add retry logic
- Show loading states

---

## 🎯 Test Scenario 11: Responsive Design

### Steps
1. Open dashboard on desktop (1920x1080)
2. Resize to tablet (768x1024)
3. Resize to mobile (375x667)
4. Test all features at each size
5. Check modal on mobile

### Expected Results
✅ Desktop: All features visible
✅ Tablet: Grid adjusts
✅ Mobile: Vertical layout
✅ Table scrolls horizontally
✅ Modal fits screen
✅ Buttons accessible

### Breakpoints to Test
- Desktop: 1920px+
- Laptop: 1366px
- Tablet: 768px
- Mobile: 375px

### If It Fails
- Check CSS media queries
- Adjust grid columns
- Fix table overflow
- Adjust modal width

---

## 🎯 Test Scenario 12: Performance

### Steps
1. Load dashboard with 100+ candidates
2. Apply filters
3. Search rapidly
4. Open multiple modals
5. Switch tabs quickly
6. Export large dataset

### Expected Results
✅ Dashboard loads < 2 seconds
✅ Filters respond instantly
✅ Search updates smoothly
✅ Modals open < 500ms
✅ Tab switches instantly
✅ Export completes < 5 seconds

### Performance Metrics
- Initial load: < 2s
- Filter/Search: < 100ms
- Modal open: < 500ms
- API calls: < 1s
- Export: < 5s

### If It Fails
- Add pagination
- Implement virtual scrolling
- Optimize re-renders
- Cache API responses
- Debounce search

---

## 🐛 Known Issues & Workarounds

### Issue 1: Modal Doesn't Close
**Symptom:** X button doesn't work
**Workaround:** Press Esc key
**Fix:** Check onClick handler

### Issue 2: Statistics Not Updating
**Symptom:** Numbers stay same after decision
**Workaround:** Refresh page
**Fix:** Call fetchCandidates() after submit

### Issue 3: Filter Not Clearing
**Symptom:** Filter stays active
**Workaround:** Manually clear all filters
**Fix:** Reset all state on clear

### Issue 4: Export Shows No Data
**Symptom:** Empty CSV file
**Workaround:** Remove all filters
**Fix:** Check filtered array

---

## ✅ Final Checklist

### Before Production
- [ ] All test scenarios pass
- [ ] No console errors
- [ ] No console warnings
- [ ] Performance acceptable
- [ ] Responsive on all devices
- [ ] Error handling works
- [ ] Export functionality works
- [ ] API endpoints secure
- [ ] Admin authentication works
- [ ] Documentation complete

### Security Checks
- [ ] Admin-only access enforced
- [ ] JWT validation working
- [ ] SQL injection prevented
- [ ] XSS protection in place
- [ ] CSRF tokens if needed
- [ ] Rate limiting configured
- [ ] Sensitive data encrypted
- [ ] Audit logging enabled

### User Acceptance Testing
- [ ] Product owner review
- [ ] Admin user training
- [ ] Real data testing
- [ ] Edge cases handled
- [ ] Feedback incorporated
- [ ] Documentation reviewed

---

## 🎉 Testing Complete!

If all scenarios pass, the Exam Violations Dashboard is ready for production!

**Next Steps:**
1. Deploy to staging environment
2. Conduct user acceptance testing
3. Train administrators
4. Monitor for issues
5. Gather feedback
6. Iterate and improve

Happy Testing! 🚀
