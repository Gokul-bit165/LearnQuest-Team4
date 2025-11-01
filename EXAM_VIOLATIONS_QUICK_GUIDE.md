# 🎯 Exam Violations Dashboard - Quick Reference

## 🚀 Quick Start

### Access the Dashboard
```
URL: http://localhost:5174/exam-violations
Login: Use admin credentials
```

---

## 📊 Dashboard Overview

### Summary Cards (Click to Filter)
| Card | Description | Color |
|------|-------------|-------|
| 👥 Total Candidates | All test takers | Blue |
| ✅ Safe Users | Score < 5 | Green |
| ⚠️ Warnings | Score 5-9 | Yellow |
| 🚫 Violations | Score ≥ 10 | Red |
| 🎧 Noise Events | Total audio violations | Orange |
| 📷 Camera Events | Total video violations | Purple |

---

## 🔍 Filtering Options

### Search Bar
- Search by: Name, Email, Test ID
- Real-time filtering

### Filters
- **Exam**: Select specific certification
- **Status**: All / Safe / Warning / Violation
- **Date Range**: Start and end dates

---

## 📋 Violation Scoring

### Weights (How violations are scored)
```
Looking Away:      1 point
Noise Detected:    2 points
No Face:           2 points
Copy/Paste:        2 points
Multiple Faces:    3 points
Tab Switch:        3 points
Phone Detected:    4 points
```

### Categories
- 🟢 **Safe**: Total score < 5
- 🟡 **Warning**: Total score 5-9
- 🔴 **Violation**: Total score ≥ 10

---

## 🕵️ Reviewing Candidates

### Step 1: Find Candidate
1. Use search or filters
2. Locate candidate in table
3. Click **"View Details"**

### Step 2: Review Evidence
**Timeline Tab**
- See violation summary
- View chronological events
- Check timestamps

**Event Log Tab**
- Detailed event table
- Confidence levels
- Violation weights

### Step 3: Make Decision
**Admin Action Tab**

Choose one:
- ✅ **Mark as Safe** → Score 100 (no penalty)
- ⚠️ **Issue Warning** → Score 90 (minor penalty)
- 🚫 **Confirm Violation** → Score 70 (major penalty)

Add notes explaining your decision

Click **Submit Decision**

---

## 📥 Exporting Data

### Export Report
1. Apply desired filters
2. Click **"Export Report"** button
3. CSV file downloads automatically

### CSV Contains
- Candidate name
- Exam name
- Duration
- Violation count
- Violation score
- Category
- Date

---

## 🎯 Decision Guidelines

### Mark as Safe ✅
**When:**
- 0-2 minor violations only
- Technical issues confirmed
- False positives verified

**Example:**
- 1-2 "looking away" events
- Brief camera glitch
- Accidental tab switch

### Issue Warning ⚠️
**When:**
- 3-5 minor violations
- 1-2 medium violations
- Questionable behavior

**Example:**
- Multiple looking away
- Some background noise
- Occasional tab switches

### Confirm Violation 🚫
**When:**
- 6+ violations
- Major violations (phone, multiple faces)
- Clear cheating behavior

**Example:**
- Phone detected
- Multiple people visible
- Frequent tab switching
- Suspicious patterns

---

## 🚨 Common Scenarios

### Scenario 1: Technical Issues
**Symptoms:**
- Multiple "no face" detections
- Camera disconnects

**Action:**
- Review timeline
- Check for patterns
- If consistent issues → Mark as Safe
- Add note: "Technical issues - camera malfunction"

### Scenario 2: Noisy Environment
**Symptoms:**
- Multiple noise detections
- Otherwise clean

**Action:**
- Check other violations
- If minimal → Issue Warning
- Add note: "Noisy environment - no other violations"

### Scenario 3: Clear Cheating
**Symptoms:**
- Phone detected
- Multiple faces
- Frequent tab switches

**Action:**
- Confirm Violation
- Add note: "Clear evidence of assistance"

### Scenario 4: Borderline Case
**Symptoms:**
- 4-5 minor violations
- Spread across test

**Action:**
- Review carefully
- Consider test duration
- If short test → Issue Warning
- If long test → Mark as Safe
- Document reasoning

---

## 💡 Best Practices

### ✅ DO
- Review timeline before deciding
- Add detailed notes
- Consider test duration
- Look for patterns
- Cross-reference with test score
- Export data regularly

### ❌ DON'T
- Make quick decisions
- Ignore context
- Skip note-taking
- Rely solely on score
- Ignore technical issues

---

## 🔧 Troubleshooting

### No Data Showing
**Check:**
1. API server running (port 8000)
2. MongoDB running
3. Admin token valid
4. Browser console for errors

**Fix:**
- Restart API server
- Re-login as admin
- Clear browser cache

### Modal Won't Open
**Check:**
1. Attempt ID valid
2. API endpoint responding
3. Network tab in DevTools

**Fix:**
- Refresh page
- Try different candidate
- Check API logs

### Export Not Working
**Check:**
1. Pop-up blocker disabled
2. Browser download permissions
3. Filter applied correctly

**Fix:**
- Allow downloads
- Try without filters
- Use different browser

---

## 📱 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Ctrl + F` | Focus search bar |
| `Esc` | Close modal |
| `Tab` | Navigate form fields |
| `Enter` | Submit decision |

---

## 📊 Statistics Interpretation

### High Violation Rate
**If 30%+ have violations:**
- Review test conditions
- Check camera/audio setup
- Consider technical issues
- Adjust violation thresholds

### Low Violation Rate
**If <5% have violations:**
- System working well
- Good test environment
- Clear instructions given

### Noise Spikes
**If many noise violations:**
- Check test environment
- Consider external factors
- May need quieter location
- Headphone requirement

### Camera Issues
**If many camera violations:**
- Check lighting requirements
- Browser compatibility
- Webcam quality issues
- Permission problems

---

## 🎓 Training Tips

### For New Admins
1. Review 5-10 Safe cases
2. Review 5-10 Warning cases
3. Review 5-10 Violation cases
4. Compare decisions
5. Discuss edge cases
6. Practice note-taking

### Review Checklist
- [ ] Check violation count
- [ ] Review violation types
- [ ] Check timeline patterns
- [ ] Consider test duration
- [ ] Look at test score
- [ ] Check for technical issues
- [ ] Add detailed notes
- [ ] Make decision
- [ ] Submit review

---

## 📞 Support

### Need Help?
- Check troubleshooting section
- Review documentation
- Check API logs
- Contact dev team

### Report Issues
Include:
- Screenshot
- Browser console errors
- Attempt ID
- Steps to reproduce

---

## ✅ Quick Checklist

Daily Tasks:
- [ ] Review new violations
- [ ] Check flagged cases
- [ ] Export daily report
- [ ] Update decision notes

Weekly Tasks:
- [ ] Analyze trends
- [ ] Review statistics
- [ ] Adjust thresholds if needed
- [ ] Generate summary report

Monthly Tasks:
- [ ] Review all decisions
- [ ] Audit patterns
- [ ] Update guidelines
- [ ] Train new admins

---

## 🎯 Success Metrics

Good Performance:
- ✅ All violations reviewed within 24 hours
- ✅ Detailed notes on all decisions
- ✅ <5% appeals on decisions
- ✅ Consistent decision patterns
- ✅ Clear documentation

---

**Need more help?** See `EXAM_VIOLATIONS_DASHBOARD_COMPLETE.md` for detailed documentation.

Happy Monitoring! 🚀
