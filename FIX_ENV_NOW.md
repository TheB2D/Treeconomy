# 🚨 CRITICAL: Fix Your .env File Format!

## The Problem:

Your `.env` file has **incorrect formatting**:

```env
# WRONG ❌
SESSION_SECRET = 'Fl6yEFZtmumV5gsk/E7DrHWIPLJqTDkJG0tqsw0GoWI='
               ↑ ↑                                              ↑ ↑
           SPACE   SPACE                                  QUOTES
```

This causes Node.js to read the values incorrectly, which is why you're getting 401 errors!

---

## ✅ Fix It Right Now:

### Option 1: Copy the Correct File

```bash
cd /Users/christopherkhaing/Desktop/ranger_new
cp .env.correct .env
```

Then edit `.env` and add your `ENCRYPTION_KEY` if you generated one different from the template.

---

### Option 2: Manually Fix Your `.env`

Open your `.env` file and make sure it looks EXACTLY like this:

```env
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyBVU8sFgyFYFVDAKQyIwGIswBWIlgh3mDQ
CRS_USERNAME=sfhacks_dev24
CRS_PASSWORD=7rELENV#PcgzRjNru4DWkKq6
CRS_ENVIRONMENT=sandbox
CRS_BASE_URL=https://api-sandbox.stitchcredit.com/api
ENCRYPTION_KEY=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
SESSION_SECRET=Fl6yEFZtmumV5gsk/E7DrHWIPLJqTDkJG0tqsw0GoWI=
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📋 Critical Rules for .env Files:

### ❌ WRONG:
```env
CRS_USERNAME = "sfhacks_dev24"     # Spaces and quotes
CRS_PASSWORD= 7rELENV#...          # Space after =
SESSION_SECRET = 'value'           # Spaces and quotes
```

### ✅ RIGHT:
```env
CRS_USERNAME=sfhacks_dev24         # No spaces, no quotes
CRS_PASSWORD=7rELENV#PcgzRjNru4DWkKq6
SESSION_SECRET=Fl6yEFZtmumV5gsk/E7DrHWIPLJqTDkJG0tqsw0GoWI=
```

---

## 🔍 Quick Check:

After fixing, run this to verify:

```bash
node test-crs-credentials.js
```

Should output:
```
✅ AUTHENTICATION SUCCESSFUL!
```

---

## 🚀 Then Restart:

```bash
# Stop dev server (Ctrl+C)
npm run dev
```

---

## 💡 Why This Happens:

Node.js reads `.env` files literally. If you write:

```env
CRS_USERNAME = "sfhacks_dev24"
```

It reads the value as: ` "sfhacks_dev24"` (with space and quotes included!)

So the actual username becomes ` "sfhacks_dev24"` instead of `sfhacks_dev24`.

That's why the API returns 401 - it's trying to authenticate with the wrong username!

---

## ✅ After Fixing:

1. Save your `.env` file
2. Restart dev server
3. Try syncing your forest again
4. It should work! 🎉

---

**Fix your .env file now and restart!** 🔧
