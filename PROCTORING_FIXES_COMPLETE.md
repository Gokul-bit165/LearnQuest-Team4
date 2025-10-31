# Proctoring System Fixes - Summary

## Changes Made

### 1. ✅ Noise Threshold Adjusted (10-15)

**Problem**: Noise threshold was too high (140) and not triggering for normal conversation levels.

**Solution**: 
- Changed `NOISE_THRESHOLD` from 140 to **15** in `WebcamProctoring.jsx`
- Updated UI meter thresholds to match lower sensitivity:
  - Bar 1 (green): > 5 (was > 30)
  - Bar 2 (yellow): > 10 (was > 60)
  - Bar 3 (orange): > 15 (was > 100)
  - Bar 4 (red): > 20 (was > 140)

**Result**: Now detects normal conversation and ambient noise much more effectively.

**Files Modified**:
- `apps/web-frontend/src/components/WebcamProctoring.jsx` (lines 191, 338-341)

---

### 2. ✅ Fixed Repeated Webcam Permission Requests

**Problem**: Webcam permission was being requested 3 times:
- Twice before clicking "Start Test"
- Once after clicking "Start Test"

**Root Cause**: React's `useEffect` was running multiple times due to missing dependency management and component re-renders.

**Solution**:
- Added `hasStartedRef` ref to track if proctoring has already started
- Updated `useEffect` to only start proctoring once using the ref guard:
  ```javascript
  const hasStartedRef = useRef(false);
  
  useEffect(() => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      startProctoring();
    }
    
    return () => {
      stopProctoring();
    };
  }, [startProctoring, stopProctoring]);
  ```
- Added proper dependencies `[startProctoring, stopProctoring]` to useEffect

**Result**: Webcam and microphone permissions now requested only once when the test starts.

**Files Modified**:
- `apps/web-frontend/src/components/WebcamProctoring.jsx` (lines 16, 290-299)

---

### 3. ✅ Fixed Proctoring Logs Not Saving in Admin Frontend

**Problem**: Violation logs were being sent to WebSocket and saved in `proctoring_violations` collection, but NOT being saved to the certification attempt's `proctoring_logs` array that the admin frontend reads.

**Root Cause**: The WebcamProctoring component was only sending violations to the proctoring WebSocket, not to the certification API endpoint.

**Solution**:

#### Frontend (WebcamProctoring.jsx):
1. **Video violations**: When violations are received from WebSocket, also send them to certification API:
   ```javascript
   // Log violations to certification attempt
   for (const violation of data.violations) {
     await fetch(`${apiHost}/api/certifications/proctoring-event`, {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${localStorage.getItem('token')}`
       },
       body: JSON.stringify({
         attempt_id: attemptId,
         event: {
           type: 'violation_detected',
           violation_type: violation.type,
           severity: violation.severity,
           message: violation.message,
           metadata: {
             yaw: data.yaw,
             pitch: data.pitch
           }
         }
       })
     });
   }
   ```

2. **Noise violations**: When excessive noise is detected, send to certification API:
   ```javascript
   await fetch(`${apiHost}/api/certifications/proctoring-event`, {
     method: 'POST',
     // ... body includes type: 'excessive_noise'
   });
   ```

#### Backend (certifications.py):
- Added handling for new violation types in behavior score deduction:
  - `violation_detected`: -10 points (general violations from video proctoring)
  - `excessive_noise`: -5 points (audio violations)

**Result**: 
- All violations (video + audio) now appear in admin frontend's proctoring review
- Violations are stored in both:
  1. `proctoring_violations` collection (WebSocket/proctoring service)
  2. `certification_attempts.proctoring_logs` array (certification service - what admin reads)

**Files Modified**:
- `apps/web-frontend/src/components/WebcamProctoring.jsx` (lines 88-136, 217-238)
- `services/api/src/routes/certifications.py` (lines 316-319)

---

## Testing Instructions

### 1. Test Noise Threshold
1. Start a certification test with proctoring enabled
2. Grant camera + microphone permissions (should only ask once now!)
3. Look at the microphone icon in top-left corner
4. Speak normally - bars should light up and level should be 10-20
5. Speak louder - should trigger "Excessive noise detected" warning

### 2. Test Single Permission Request
1. Navigate to a test page
2. **Before** clicking "Start Test": No permission requests
3. Click "Start Test"
4. **After** clicking: One combined request for camera + microphone
5. Grant permissions
6. Camera preview should appear immediately with microphone meter

### 3. Test Admin Logs
1. Take a test with proctoring enabled
2. Trigger some violations:
   - Look away from camera
   - Show a phone
   - Make loud noise
3. Finish/submit the test
4. Go to Admin Frontend → "Proctoring Review"
5. Find your attempt in the list
6. Click "View Details"
7. **Verify**: All violations should now appear in the logs table

---

## Technical Details

### Noise Detection Scale
- **0-255**: Full audio level range
- **0-5**: Silent/background
- **5-10**: Very quiet (whisper)
- **10-15**: Normal conversation ⚠️ **Threshold**
- **15-20**: Loud talking
- **20+**: Very loud (shouting/music)

### Violation Storage

#### Old System (WebSocket only):
```
Violation → WebSocket → proctoring_violations collection
                      ❌ NOT in certification_attempts.proctoring_logs
```

#### New System (Dual storage):
```
Violation → WebSocket → proctoring_violations collection
          ↓
          → REST API → certification_attempts.proctoring_logs ✅
```

### Behavior Score Deductions
- **Tab switch**: -10 points
- **Face not detected**: -5 points
- **Multiple people**: -15 points
- **Phone detected**: -20 points
- **General violation**: -10 points (NEW)
- **Excessive noise**: -5 points (NEW)

---

## Deployment Status
✅ Frontend rebuilt and deployed  
✅ Backend rebuilt and deployed  
✅ Containers restarted  
✅ All changes active  

---

## Files Changed Summary

### Frontend
- `apps/web-frontend/src/components/WebcamProctoring.jsx`
  - Lines 16: Added `hasStartedRef`
  - Lines 88-136: Added violation logging to certification API
  - Lines 191: Changed noise threshold to 15
  - Lines 193: Made interval callback async
  - Lines 217-238: Added noise violation logging to certification API
  - Lines 290-299: Fixed useEffect to prevent repeated starts
  - Lines 338-341: Updated UI meter thresholds

### Backend
- `services/api/src/routes/certifications.py`
  - Lines 316-319: Added behavior score deductions for `violation_detected` and `excessive_noise`

---

## Known Behaviors

1. **Microphone meter is very sensitive**: This is intentional! The threshold of 15 means even normal conversation will trigger warnings. This ensures students remain quiet during exams.

2. **Violations appear twice**: 
   - Once in WebSocket proctoring session (for real-time monitoring)
   - Once in certification attempt logs (for admin review)
   - This is correct behavior for audit trail purposes

3. **Permission prompt timing**: Browser security requires user interaction before requesting media permissions, so the prompt only appears after clicking "Start Test" button.

---

## Future Improvements

1. **Adjustable thresholds**: Allow admins to configure noise sensitivity per test
2. **Audio calibration**: Add a pre-test calibration to measure baseline ambient noise
3. **Violation history graph**: Visual timeline of when violations occurred
4. **Real-time admin monitoring**: Allow admins to watch live proctoring sessions
5. **Audio level history**: Store noise level samples for post-test review
