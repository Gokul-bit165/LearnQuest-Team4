## Google Sign-In Issue Fixed ✅

### **What was wrong:**
The redirect URI in the `.env` file was set to `/login` instead of the proper OAuth callback path.

### **Fix Applied:**
Changed the redirect URI from:
```
GOOGLE_REDIRECT_URI=http://localhost:3000/login
```

To:
```
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

### **Next Steps:**

1. **Update Google Cloud Console:**
   - Go to https://console.cloud.google.com
   - Navigate to "APIs & Services" > "Credentials"
   - Find your OAuth 2.0 Client ID
   - Add these authorized redirect URIs:
     - `http://localhost:3000/auth/google/callback`
     - `http://localhost:5173/auth/google/callback` (for dev server)

2. **Restart the API** (already done):
```bash
docker restart learnquest-team4-api-1
```

3. **Test Google Sign-In:**
   - Go to http://localhost:3000/login
   - Click "Continue with Google"
   - It should redirect you to Google's sign-in page
   - After signing in, you'll be redirected back to LearnQuest

### **If it still doesn't work:**

Check if the API is reading the new environment variable:
```bash
# Restart the container
docker-compose restart api
```

Or check the API logs:
```bash
docker logs learnquest-team4-api-1
```

### **Manual Configuration:**

If the auto-configuration doesn't work, you can manually set the environment variables in `services/api/.env`:

```bash
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

Make sure these credentials are added to Google Cloud Console as authorized redirect URIs!

---

**Google Sign-In should now work! Try signing in with Google.** 🎉


