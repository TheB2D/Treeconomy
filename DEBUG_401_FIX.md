# 🔧 Fixing the 401 Error - Quick Debug Guide

## The Problem:
You're getting: **"Request failed with status code 401"**

This means the CRS API credentials aren't working.

---

## ✅ Step 1: Verify Your `.env` File

Open your `.env` file and check it has:

```env
# Should look EXACTLY like this:
CRS_USERNAME=sfhacks_dev24
CRS_PASSWORD=7rELENV#PcgzRjNru4DWkKq6
CRS_ENVIRONMENT=sandbox
CRS_BASE_URL=https://api-sandbox.stitchcredit.com/api
```

### ⚠️ Common Mistakes:

**WRONG:**
```env
CRS_USERNAME="sfhacks_dev24"  ❌ (no quotes!)
CRS_PASSWORD= 7rELENV#PcgzRjNru4DWkKq6  ❌ (space after =)
```

**RIGHT:**
```env
CRS_USERNAME=sfhacks_dev24  ✅
CRS_PASSWORD=7rELENV#PcgzRjNru4DWkKq6  ✅
```

---

## ✅ Step 2: Restart Your Dev Server

After fixing `.env`:

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

**Environment variables only load on startup!**

---

## ✅ Step 3: Test the Health Endpoint

```bash
curl http://localhost:3000/api/health
```

**Should return:**
```json
{
  "status": "healthy",
  "checks": {
    "crsConfigured": true  ← This should be true!
  }
}
```

**If `crsConfigured: false`:**
- Your `.env` is missing CRS credentials
- Or you didn't restart the server

---

## 🔧 Quick Fix: Skip Identity Verification (For Testing)

If you want to test the credit pull **without** identity verification first, I can update the API to skip that step temporarily.

This will help us isolate the problem:
- If credit pull works → Identity verification endpoint is the issue
- If credit pull fails → It's a credential problem

---

## 🧪 Test CRS Credentials Manually

Run this to test if your credentials work:

```bash
curl -u "sfhacks_dev24:7rELENV#PcgzRjNru4DWkKq6" \
  https://api-sandbox.stitchcredit.com/api/health
```

**If this returns 401:**
- Your CRS credentials are wrong
- Contact CRS: development@crscreditapi.com

**If this returns 200:**
- Credentials are good!
- The issue is in how we're passing them

---

## 📝 Your Complete `.env` Should Look Like:

```env
# GEMINI AI
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyBVU8sFgyFYFVDAKQyIwGIswBWIlgh3mDQ

# CRS CREDIT API
CRS_USERNAME=sfhacks_dev24
CRS_PASSWORD=7rELENV#PcgzRjNru4DWkKq6
CRS_ENVIRONMENT=sandbox
CRS_BASE_URL=https://api-sandbox.stitchcredit.com/api

# SECURITY (your generated keys)
ENCRYPTION_KEY=your_generated_key_here
SESSION_SECRET=your_generated_secret_here

# APP
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🚨 Quick Checklist:

- [ ] `.env` file exists in project root
- [ ] CRS credentials are correct (no quotes, no spaces)
- [ ] Restarted dev server after editing `.env`
- [ ] Health endpoint shows `crsConfigured: true`

---

## 🆘 Still Not Working?

Let me know and I'll:
1. Temporarily disable identity verification
2. Add more detailed error logging
3. Create a test script to verify CRS credentials

---

## 📌 About "Alice Excellent"

Yes! "Alice Excellent" is a **test persona I created** for you. The SSN `666001001` is a **standard sandbox test SSN** that should work with CRS.

But we need to fix the 401 error first before we can test it!
