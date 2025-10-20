# 🔧 Network Error Troubleshooting Guide

## The Error: "Network error. Please check your connection."

This error from the voice recognition feature usually means one of these issues:

---

## ✅ Quick Fixes (Try These First)

### 1. **Check Django Server is Running**

The logs show your server IS running at `http://127.0.0.1:8000/`

✅ **Server Status**: Running  
✅ **Last Request**: Successfully processed at 13:56  
✅ **Gemini API**: Working correctly

### 2. **Hard Refresh Your Browser**

The issue might be cached errors:

**Chrome/Edge:**

- Press `Ctrl + Shift + R` (Windows)
- Or `Ctrl + F5`

**Safari:**

- Press `Cmd + Shift + R` (Mac)

### 3. **Clear Browser Cache**

1. Open DevTools (`F12`)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### 4. **Check Frontend is Running**

Your frontend should be at: `http://localhost:5173`

Check the terminal where you ran `npm run dev` - it should show:

```
VITE ready in [time]
➜ Local: http://localhost:5173/
```

---

## 🔍 Detailed Troubleshooting

### Issue 1: Server Address Mismatch

Your Django server is running on `http://127.0.0.1:8000/` but the frontend config uses `http://localhost:8000/`

These should be the same, but sometimes browsers treat them differently.

**Test the API directly:**

1. Open a new browser tab
2. Go to: `http://localhost:8000/api/`
3. You should see the API root page

If that doesn't work, try: `http://127.0.0.1:8000/api/`

**If the second one works but first doesn't:**

Edit `frontend/src/services/api.js`:

```javascript
// Change from:
const API_BASE_URL = "http://localhost:8000/api";

// To:
const API_BASE_URL = "http://127.0.0.1:8000/api";
```

---

### Issue 2: CORS Configuration

Check your `.env` file has:

```env
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

**Add 127.0.0.1 variant:**

```env
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000
```

After changing `.env`, **restart Django server**:

1. Go to terminal with Django server
2. Press `Ctrl+C`
3. Run: `python manage.py runserver`

---

### Issue 3: Voice Recognition Network Error

The voice recognition might be showing this error if:

1. **Google's speech service is unreachable** (browser-dependent)
2. **Browser requires HTTPS** for some features
3. **Firewall blocking** the speech API

**To test if it's voice-specific:**

1. Try typing a message (not using voice) and sending
2. If typing works but voice doesn't:
   - This is a speech API issue, not your backend
   - Try a different browser (Chrome recommended)
   - Check if you have proxy/VPN blocking Google services

---

## 🧪 Test Backend Connection

### Test 1: Check API Health

Open browser console (`F12`) and run:

```javascript
fetch("http://localhost:8000/api/")
  .then((r) => r.json())
  .then((d) => console.log("✅ Backend connected:", d))
  .catch((e) => console.error("❌ Backend error:", e));
```

### Test 2: Check CORS

In browser console:

```javascript
fetch("http://localhost:8000/api/documents/", {
  method: "GET",
  headers: { "Content-Type": "application/json" },
})
  .then((r) => console.log("✅ CORS OK, status:", r.status))
  .catch((e) => console.error("❌ CORS error:", e));
```

---

## 🎤 Voice-Specific Debugging

### Check if Voice is the Problem:

1. **Open DevTools** (`F12`)
2. **Go to Console tab**
3. **Click the mic button**
4. **Look for errors** in red

### Common Voice Errors:

| Error              | Meaning                             | Fix                                   |
| ------------------ | ----------------------------------- | ------------------------------------- |
| `network`          | Can't reach Google's speech service | Check internet, try different browser |
| `not-allowed`      | Microphone permission denied        | Allow mic in browser settings         |
| `no-speech`        | Didn't detect speech                | Speak louder, check mic               |
| Connection refused | Backend is down                     | Start Django server                   |

---

## 🔧 Step-by-Step Fix

### Method 1: Restart Everything

```powershell
# Terminal 1 - Stop Django (Ctrl+C), then:
cd backend
python manage.py runserver

# Terminal 2 - Stop Frontend (Ctrl+C), then:
cd frontend
npm run dev

# Then in browser:
# 1. Hard refresh (Ctrl+Shift+R)
# 2. Try again
```

### Method 2: Update API URL

If `localhost` doesn't work, use `127.0.0.1`:

**File**: `frontend/src/services/api.js`

```javascript
const API_BASE_URL = "http://127.0.0.1:8000/api";
```

**File**: `backend/.env`

```env
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Restart both servers after changes.

### Method 3: Check Firewall

Windows Firewall might be blocking:

1. Open Windows Defender Firewall
2. Click "Allow an app through firewall"
3. Find Python
4. Make sure both Private and Public are checked
5. Try again

---

## 📊 Current Status Check

Based on your logs:

✅ **Django Server**: Running correctly on port 8000  
✅ **Gemini API**: Working (successfully answered question at 13:56)  
✅ **RAG Pipeline**: Working (found 5 relevant chunks)  
✅ **Database**: Working (conversation saved)  
✅ **FAISS**: Working (68 vectors indexed)

**Conclusion**: Your backend is working perfectly!

The issue is likely:

1. Frontend connection config
2. Browser cache
3. Voice recognition network (browser-side)

---

## 🎯 Most Likely Solution

Based on your setup, try this:

### Option A: Simple Browser Fix

```
1. Hard refresh: Ctrl + Shift + R
2. Try voice input again
3. If error persists, try typing instead
```

### Option B: Check Voice Separately

```
1. Try sending a message by TYPING (not voice)
2. If typing works → voice API issue (not your backend)
3. If typing fails → backend connection issue
```

### Option C: Update CORS (if typing also fails)

```
1. Edit backend/.env
2. Add: http://127.0.0.1:5173 to CORS_ALLOWED_ORIGINS
3. Restart Django server
4. Hard refresh browser
```

---

## 🆘 Still Not Working?

### Get More Info:

1. **Open Browser DevTools** (`F12`)
2. **Go to Network tab**
3. **Try the action again**
4. **Look for failed requests** (red)
5. **Click on the failed request**
6. **Copy the error details**

### Check These:

- [ ] Django server running? (look for logs)
- [ ] Frontend running? (localhost:5173 works?)
- [ ] Browser console errors? (F12 → Console)
- [ ] Network tab shows requests? (F12 → Network)
- [ ] Can access http://localhost:8000/api/ directly?

---

## 💡 Pro Tip

The voice feature uses **two different APIs**:

1. **Your Backend API** (`localhost:8000`) - For chat/RAG
2. **Browser Speech API** (Google/Apple) - For voice recognition

If voice shows "Network error" but typing works:
→ It's the **Speech API** having issues, not your backend!

Try:

- Use a different browser (Chrome is best)
- Check your internet connection
- Disable VPN/proxy temporarily

---

## ✅ Expected Working State

When everything works, you should see:

1. **Type a message** → Send → Get AI response ✅
2. **Click mic** → Speak → See text → Send → Get AI response ✅
3. **No red errors** in browser console ✅
4. **Django logs show** successful requests ✅

Your logs already show #1 and #4 are working!

---

**Need more help?** Share:

- Browser console errors (F12 → Console)
- Network tab details (F12 → Network)
- Which action causes the error (voice or typing?)
