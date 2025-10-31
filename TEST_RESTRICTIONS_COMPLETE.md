# Test Interface Restrictions & Proctoring Fixes

## Issues Fixed

### ✅ 1. Webcam Shows Inactive & Not Asking Permission
**Problem**: WebcamProctoring component wasn't initializing because attemptId wasn't set for all test routes.

**Solution**:
- Added attemptId generation for direct certification route: `cert_${certificationId}_${timestamp}`
- Ensured WebcamProctoring only renders after loading completes: `{attemptId && !isLoading && <WebcamProctoring />}`
- WebcamProctoring now starts automatically when component mounts and requests camera/mic permissions

**Result**: Camera and microphone permissions are now requested immediately when test loads, and proctoring starts automatically.

---

### ✅ 2. Force Fullscreen Mode
**Problem**: Tests weren't enforcing fullscreen mode.

**Solution**:
- **Auto-enter fullscreen** on test start for ALL certification tests (not just when restrictions.enable_fullscreen is set)
- **Block Escape key** to prevent exiting fullscreen
- **Block F11 key** to prevent manual fullscreen toggle
- **Detect fullscreen exit** using screenfull.on('change') listener
- **Auto-return to fullscreen** when user tries to exit

**Code Changes**:
```javascript
// Force fullscreen on mount
if (screenfull.isEnabled && !screenfull.isFullscreen) {
  screenfull.request();
}

// Block Escape and F11
if (e.key === 'Escape' || e.key === 'F11') {
  e.preventDefault();
  toast.warning('⚠️ Cannot exit fullscreen during test!');
}

// Detect and handle fullscreen exit
const handleFullscreenChange = () => {
  if (!screenfull.isFullscreen) {
    toast.error('⚠️ You must remain in fullscreen! Returning...');
    // Record violation
    setViolations(prev => ({ ...prev, tabSwitch: prev.tabSwitch + 1 }));
    // Force back
    setTimeout(() => screenfull.request(), 1000);
  }
};
```

---

### ✅ 3. Tab Switch Detection & Warning Messages
**Problem**: Tab switching detection existed but didn't force return to fullscreen.

**Solution**:
- **Detect tab switches** via document.hidden (visibilitychange event)
- **Show violation warnings** with counter (e.g., "VIOLATION 1/3")
- **Force return to fullscreen** after tab switch detected
- **Block Alt+Tab** keyboard shortcut
- **Auto-submit test** after 3 violations

**Warning Messages**:
```javascript
// First 2 violations
toast.warning(`⚠️ VIOLATION ${totalViolations}/3: Tab switching detected! Returning to fullscreen...`);

// 3rd violation
toast.error('❌ DISQUALIFIED: 3+ violations detected! Test will be auto-submitted.');
```

**Automatic Actions**:
1. User switches tab → Violation recorded
2. Show warning toast
3. Wait 500ms for user to return
4. Force back to fullscreen automatically
5. If 3 violations → Auto-submit test after 3 seconds

---

### ✅ 4. Key Press Detection & Blocking
**Problem**: Various key presses needed to be blocked during test.

**Solution**: Enhanced keyboard event blocking for security:

**Blocked Keys**:
- **Escape**: Cannot exit fullscreen
- **F11**: Cannot toggle fullscreen manually  
- **F12**: Cannot open developer tools
- **Alt+Tab / Ctrl+Tab**: Cannot switch tabs/windows
- **Ctrl+C/V/X**: Copy/paste blocked (if restrictions.copy_paste === false)
- **Backspace**: Prevents accidental navigation (except in inputs)

**Code**:
```javascript
const handleKeyDown = (e) => {
  // Block Escape
  if (e.key === 'Escape') {
    e.preventDefault();
    toast.warning('⚠️ Cannot exit fullscreen during test!');
  }
  
  // Block F11
  if (e.key === 'F11') {
    e.preventDefault();
    toast.warning('⚠️ Fullscreen cannot be toggled during test!');
  }
  
  // Block Alt+Tab / Ctrl+Tab
  if ((e.ctrlKey || e.altKey || e.metaKey) && e.key === 'Tab') {
    e.preventDefault();
    toast.error('⚠️ Tab switching is not allowed!');
    setViolations(prev => ({ ...prev, tabSwitch: prev.tabSwitch + 1 }));
  }
  
  // Block F12
  if (e.key === 'F12') {
    e.preventDefault();
    toast.error('Developer tools are disabled during test');
  }
};
```

---

### ✅ 5. Auto-Finish Test When Time Ends
**Problem**: Timer existed but didn't always properly trigger auto-submit.

**Solution**: Enhanced timer with proper cleanup and warnings:

**Features**:
- ⏰ **5-minute warning**: Orange toast when 5 minutes remaining
- 🚨 **1-minute warning**: Red toast when 1 minute remaining
- ⏱️ **Auto-submit**: Automatically submits test when timer reaches 0
- ✅ **Proper cleanup**: Timer clears properly to prevent multiple submissions

**Code**:
```javascript
useEffect(() => {
  if (timeRemaining === null || isLoading) return;
  
  const timer = setInterval(() => {
    setTimeRemaining(prev => {
      // Time's up!
      if (prev <= 1) {
        clearInterval(timer);
        toast.info('⏰ Time is up! Auto-submitting test...');
        setTimeout(() => handleSubmitTest(), 1000);
        return 0;
      }
      
      // 5-minute warning
      if (prev === 300) {
        toast.warning('⚠️ Only 5 minutes remaining!');
      }
      
      // 1-minute warning
      if (prev === 60) {
        toast.error('⚠️ Only 1 minute remaining!');
      }
      
      return prev - 1;
    });
  }, 1000);
  
  return () => clearInterval(timer);
}, [isLoading, timeRemaining]);
```

---

## Additional Security Features

### Browser Navigation Blocking
- **Back button disabled**: Using pushState to prevent browser back
- **Page refresh warning**: beforeunload event shows "Test in progress!" warning
- **Right-click disabled**: Context menu blocked when restrictions.right_click === false

### Violation Tracking
```javascript
violations: {
  tabSwitch: 0,    // Tab switches and fullscreen exits
  copyPaste: 0     // Copy/paste attempts
}

// Total violations = tabSwitch + copyPaste
// Auto-submit at 3 total violations
```

---

## Testing Instructions

### Test Fullscreen Enforcement
1. Start a certification test
2. **Expected**: Automatically enters fullscreen
3. Try pressing **Escape** → Should show warning and stay in fullscreen
4. Try pressing **F11** → Should show warning and block toggle
5. Try Alt+Tab to switch windows → Returns to fullscreen with violation warning

### Test Tab Switch Detection
1. While in test, press **Alt+Tab** or switch to another window
2. **Expected**: 
   - "⚠️ VIOLATION 1/3: Tab switching detected! Returning to fullscreen..."
   - Automatically returns to fullscreen when you come back
3. Do it 3 times → Test auto-submits

### Test Timer Auto-Submit
1. Start a test (or modify duration_minutes to 1 minute for quick testing)
2. Wait for timer to reach:
   - 5:00 → Orange warning toast
   - 1:00 → Red warning toast
   - 0:00 → "Time is up! Auto-submitting test..." then auto-submits

### Test Webcam Proctoring
1. Start test
2. **Expected**: Camera/microphone permission request appears immediately
3. Grant permissions
4. **Expected**: Small camera preview appears in bottom-right with "Active" status
5. Microphone meter should show real-time audio levels

### Test Key Blocking
1. Try pressing **F12** → Should show "Developer tools are disabled"
2. Try **Ctrl+C** on code → Should show copy/paste warning (if enabled)
3. Try **Backspace** outside editor → Should prevent navigation

---

## Technical Implementation Details

### Files Modified
**Frontend**:
- `apps/web-frontend/src/pages/CodingTestInterface.jsx`
  - Lines 62-106: Added attemptId generation for all routes
  - Lines 139-312: Enhanced fullscreen enforcement and violation detection
  - Lines 314-349: Improved timer with warnings and auto-submit
  - Line 814: Fixed WebcamProctoring conditional rendering

### Key Technologies Used
- **screenfull.js**: Cross-browser fullscreen API
- **React hooks**: useEffect for event listeners
- **Document API**: visibilitychange, keydown, contextmenu events
- **History API**: pushState/popstate for back button blocking
- **Sonner**: Toast notifications for user feedback

### Event Listeners Added
```javascript
// Visibility (tab switching)
document.addEventListener('visibilitychange', handleVisibilityChange);

// Keyboard (key blocking)
document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keydown', preventNavigation);

// Fullscreen changes
screenfull.on('change', handleFullscreenChange);

// Context menu (right-click)
document.addEventListener('contextmenu', handleContextMenu);

// Page unload (refresh warning)
window.addEventListener('beforeunload', handleBeforeUnload);

// Browser navigation
window.addEventListener('popstate', handlePopState);
```

### Cleanup on Unmount
All event listeners are properly removed in useEffect cleanup:
```javascript
return () => {
  document.removeEventListener('visibilitychange', handleVisibilityChange);
  document.removeEventListener('keydown', handleKeyDown);
  // ... etc
  if (screenfull.isEnabled) {
    screenfull.off('change', handleFullscreenChange);
  }
};
```

---

## User Experience Flow

### 1. Test Start
```
User clicks "Start Test"
  ↓
Loading screen
  ↓
Auto-enter fullscreen ✅
  ↓
Request camera/mic permissions 📹🎤
  ↓
Timer starts ⏱️
  ↓
Proctoring active (green "Active" badge)
```

### 2. During Test
```
User types code ✍️
  ↓
All key presses monitored
  ↓
Tab switches detected → Warning + Return to fullscreen
  ↓
Fullscreen exit attempts → Blocked + Warning
  ↓
Camera monitoring violations → Logged to admin
  ↓
Noise detection → Logged to admin
```

### 3. Test End
```
Either:
A) User clicks "Finish Test" → Normal submission
B) Timer reaches 0:00 → Auto-submit ⏰
C) 3 violations reached → Auto-submit 🚨
  ↓
Exit fullscreen
  ↓
Show results
```

---

## Deployment Status
✅ Frontend rebuilt with all fixes  
✅ Container restarted  
✅ All features active and ready for testing  

---

## Known Behaviors

1. **Permission Request Timing**: 
   - Camera/mic permissions requested as soon as test loads
   - This happens AFTER fullscreen is entered
   - Browser security requires this order

2. **Fullscreen Return Delay**: 
   - 500ms delay before forcing return to fullscreen
   - Gives user time to see the violation warning
   - Prevents jarring immediate return

3. **Timer Precision**: 
   - Interval runs every 1000ms (1 second)
   - May have slight drift over long tests
   - Acceptable for educational purposes

4. **Violation Counter**: 
   - Combines tab switches + copy/paste
   - Total count of 3 triggers auto-submit
   - Counter persists for entire test session

---

## Future Enhancements

1. **Admin Configuration**: 
   - Allow admins to set violation threshold (default: 3)
   - Configure which keys to block
   - Set timer warning intervals

2. **Resume After Disconnection**: 
   - Save progress periodically
   - Allow resume if connection drops
   - Maintain violation count across sessions

3. **Mobile Support**: 
   - Detect mobile devices
   - Show appropriate warnings (fullscreen not available)
   - Alternative proctoring methods

4. **Real-time Admin Dashboard**: 
   - Live view of active tests
   - See violations as they happen
   - Ability to intervene or warn students
