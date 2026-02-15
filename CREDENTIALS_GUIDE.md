# 🔐 Where to Put Your Credentials

## TL;DR - Quick Setup

```bash
# 1. Copy template to .env
cp .env.local .env

# 2. Generate encryption keys
openssl rand -hex 32    # Copy to ENCRYPTION_KEY
openssl rand -base64 32 # Copy to SESSION_SECRET

# 3. Add your API keys to .env
nano .env  # or use any text editor
```

---

## 📝 Your `.env` File Should Look Like This:

```env
# ==========================================
# GEMINI AI
# ==========================================
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyC_your_actual_key_here_1234567890

# ==========================================
# CRS CREDIT API
# ==========================================
CRS_USERNAME=your_sandbox_username
CRS_PASSWORD=your_sandbox_password
CRS_ENVIRONMENT=sandbox
CRS_BASE_URL=https://api-sandbox.stitchcredit.com/api

# ==========================================
# SECURITY
# ==========================================
ENCRYPTION_KEY=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
SESSION_SECRET=xJ9kL2mN4pQ5rS6tU7vW8xY9zA0bC1dE2fG3hI4jK5lM6nO7pQ8rS9tU0vW1xY2=

# ==========================================
# APPLICATION
# ==========================================
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🔑 Where to Get Each Credential

### 1. GOOGLE_GENERATIVE_AI_API_KEY

**Where to get it:**
- **URL**: https://aistudio.google.com/app/apikey
- **Steps**:
  1. Sign in with Google account
  2. Click "Create API Key"
  3. Copy the key that starts with `AIzaSy...`

**Paste it here in `.env`:**
```env
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSy...your_key
```

**Example:**
```env
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyCxJ9kL2mN4pQ5rS6tU7vW8xY9zA0bC1dE
```

---

### 2. CRS_USERNAME and CRS_PASSWORD

**Where to get it:**
- **Email**: development@crscreditapi.com
- **Subject**: "Sandbox Access Request"
- **What they'll send you**:
  ```
  Username: your_username
  Password: your_password
  ```

**Paste them here in `.env`:**
```env
CRS_USERNAME=your_username
CRS_PASSWORD=your_password
```

**Example:**
```env
CRS_USERNAME=sandbox_chris_123
CRS_PASSWORD=MySecurePassword123!
```

---

### 3. ENCRYPTION_KEY

**How to generate:**
```bash
openssl rand -hex 32
```

**This will output something like:**
```
a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

**Paste it here in `.env`:**
```env
ENCRYPTION_KEY=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

**⚠️ IMPORTANT**: Must be exactly 64 characters (32 bytes in hex)

---

### 4. SESSION_SECRET

**How to generate:**
```bash
openssl rand -base64 32
```

**This will output something like:**
```
xJ9kL2mN4pQ5rS6tU7vW8xY9zA0bC1dE2fG3hI4jK5lM6nO7pQ8rS9tU0vW1xY2=
```

**Paste it here in `.env`:**
```env
SESSION_SECRET=xJ9kL2mN4pQ5rS6tU7vW8xY9zA0bC1dE2fG3hI4jK5lM6nO7pQ8rS9tU0vW1xY2=
```

---

## ✅ Verification Checklist

After filling in your `.env` file:

1. **Check file exists**: `ls -la .env`
2. **Restart dev server**: `npm run dev`
3. **Test health endpoint**:
   ```bash
   curl http://localhost:3000/api/health
   ```

**Expected output:**
```json
{
  "status": "healthy",
  "checks": {
    "geminiConfigured": true,
    "crsConfigured": true,
    "securityConfigured": true
  },
  "errors": []
}
```

---

## ❌ Common Mistakes

### Mistake #1: Extra Spaces
```env
# WRONG (space after =)
GOOGLE_GENERATIVE_AI_API_KEY= AIzaSy...

# RIGHT (no space)
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSy...
```

### Mistake #2: Quotes
```env
# WRONG (don't add quotes)
CRS_USERNAME="my_username"

# RIGHT (no quotes needed)
CRS_USERNAME=my_username
```

### Mistake #3: Wrong File Name
```env
# WRONG
.env.example  ❌
.env.local    ❌

# RIGHT
.env          ✅
```

---

## 🆘 Still Having Issues?

### Test Each Credential Individually

**Test Gemini API:**
```bash
curl "https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_KEY_HERE"
```

**Test CRS API:**
```bash
curl -u "USERNAME:PASSWORD" https://api-sandbox.stitchcredit.com/api/health
```

### Check Logs

Your terminal will show detailed errors:
```bash
npm run dev

# Look for:
# ❌ Missing GOOGLE_GENERATIVE_AI_API_KEY
# ❌ Missing CRS_USERNAME
# etc.
```

---

## 🎉 Success!

When you see this, you're ready:

```bash
✅ Environment variables loaded
✅ Gemini API configured
✅ CRS API configured
✅ Security keys configured
🌲 Treeconomy backend ready!
```

---

## 📞 Need Help?

- **Gemini API Issues**: https://aistudio.google.com/
- **CRS API Issues**: development@crscreditapi.com
- **Setup Questions**: Check `BACKEND_SETUP.md` and `ENV_SETUP_INSTRUCTIONS.md`

🌲 **You've got this!**
