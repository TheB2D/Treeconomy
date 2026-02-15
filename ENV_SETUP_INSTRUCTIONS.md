# 🔑 Environment Setup Instructions

## Quick Start Checklist

```bash
□ Create .env file
□ Get Gemini API key
□ Get CRS credentials
□ Generate encryption keys
□ Test configuration
```

---

## 1️⃣ Create Your `.env` File

Create a file named `.env` in your project root with this content:

```env
# ==========================================
# GEMINI AI CONFIGURATION
# ==========================================
GOOGLE_GENERATIVE_AI_API_KEY=

# ==========================================
# CRS CREDIT API CONFIGURATION
# ==========================================
CRS_USERNAME=
CRS_PASSWORD=
CRS_ENVIRONMENT=sandbox
CRS_BASE_URL=https://api-sandbox.stitchcredit.com/api

# ==========================================
# SECURITY & ENCRYPTION
# ==========================================
ENCRYPTION_KEY=
SESSION_SECRET=

# ==========================================
# APPLICATION SETTINGS
# ==========================================
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 2️⃣ Get Gemini API Key

### Method 1: Google AI Studio (Recommended)

1. Go to: **https://aistudio.google.com/app/apikey**
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Select your Google Cloud project (or create a new one)
5. Copy the generated key
6. Paste it into your `.env` file:

```env
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyC...your_key_here
```

### Method 2: Google Cloud Console

1. Go to: **https://console.cloud.google.com/**
2. Enable the **Generative Language API**
3. Create credentials → API Key
4. Copy and paste into `.env`

**Cost:** Gemini API has a generous free tier (2 million tokens/day for Flash models)

---

## 3️⃣ Get CRS Credit API Credentials

### Request Sandbox Access

1. **Email**: development@crscreditapi.com
2. **Subject**: "Sandbox Access Request for Treeconomy"
3. **Body**:
   ```
   Hi CRS Team,

   I'm building Treeconomy, an AI-powered financial gamification app,
   and would like sandbox access to test credit API integration.

   Project: Treeconomy (AI Credit Orchestration Layer)
   Use Case: Transforming credit data into RPG game mechanics
   Environment: Sandbox testing

   Thank you!
   ```

4. You'll receive:
   - `username` (your sandbox username)
   - `password` (your sandbox password)

5. Add to `.env`:

```env
CRS_USERNAME=your_sandbox_username
CRS_PASSWORD=your_sandbox_password
```

**Note:** Keep `CRS_ENVIRONMENT=sandbox` for now. Production access requires compliance review.

---

## 4️⃣ Generate Encryption Keys

### ENCRYPTION_KEY (AES-256)

Run this command in your terminal:

```bash
openssl rand -hex 32
```

**Example output:**
```
a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

Copy and paste into `.env`:

```env
ENCRYPTION_KEY=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

### SESSION_SECRET (JWT)

Run this command:

```bash
openssl rand -base64 32
```

**Example output:**
```
xJ9kL2mN4pQ5rS6tU7vW8xY9zA0bC1dE2fG3hI4jK5lM6nO7pQ8rS9tU0vW1xY2=
```

Copy and paste into `.env`:

```env
SESSION_SECRET=xJ9kL2mN4pQ5rS6tU7vW8xY9zA0bC1dE2fG3hI4jK5lM6nO7pQ8rS9tU0vW1xY2=
```

---

## 5️⃣ Verify Your Configuration

### Start Development Server

```bash
npm run dev
```

### Test Health Endpoint

Open your browser or use curl:

```bash
curl http://localhost:3000/api/health
```

**Expected Response (Success):**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-14T...",
  "environment": "development",
  "crsEnvironment": "sandbox",
  "checks": {
    "geminiConfigured": true,
    "crsConfigured": true,
    "securityConfigured": true
  },
  "errors": []
}
```

**If you see errors**, check the `errors` array for missing credentials.

---

## 6️⃣ Test with Sandbox Data

### Get Test Personas

```bash
curl http://localhost:3000/api/test-personas
```

**Response:**
```json
{
  "personas": {
    "excellent": {
      "firstName": "Alice",
      "lastName": "Excellent",
      "ssn": "666001001",
      ...
    },
    ...
  }
}
```

### Test Credit Sync

Use the frontend **Identity Gate Modal** or:

```bash
curl -X POST http://localhost:3000/api/credit/sync \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user_1",
    "bureau": "experian",
    "personalInfo": {
      "firstName": "Alice",
      "lastName": "Excellent",
      "ssn": "666001001",
      "birthDate": "1990-01-01",
      "addresses": [{
        "addressLine1": "123 Perfect St",
        "city": "New York",
        "state": "NY",
        "postalCode": "10001"
      }]
    }
  }'
```

**Expected:** Successful credit pull + game state transformation + AI narrative

---

## 📋 Final `.env` Checklist

Your final `.env` should look like this (with real values):

```env
# GEMINI AI
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyC...your_actual_key

# CRS CREDIT API
CRS_USERNAME=your_sandbox_username
CRS_PASSWORD=your_sandbox_password
CRS_ENVIRONMENT=sandbox
CRS_BASE_URL=https://api-sandbox.stitchcredit.com/api

# SECURITY
ENCRYPTION_KEY=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
SESSION_SECRET=xJ9kL2mN4pQ5rS6tU7vW8xY9zA0bC1dE2fG3hI4jK5lM6nO7pQ8rS9tU0vW1xY2=

# APP
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## ⚠️ Security Reminders

1. **NEVER commit `.env` to Git** (already in `.gitignore`)
2. **Rotate keys periodically** (especially if exposed)
3. **Use different keys** for dev/staging/production
4. **Don't share your `.env` file** (it contains secrets)

---

## 🆘 Common Issues

### "Missing GOOGLE_GENERATIVE_AI_API_KEY"
- Check `.env` file exists in project root
- Restart dev server: `npm run dev`
- Verify no typos in environment variable names

### "Invalid CRS credentials"
- Confirm you received sandbox access email
- Check for extra spaces in username/password
- Ensure `CRS_ENVIRONMENT=sandbox`

### "Encryption key invalid"
- Must be exactly 64 hex characters (32 bytes)
- Re-run: `openssl rand -hex 32`

---

## ✅ You're Ready!

Once you see:
```json
{ "status": "healthy" }
```

You can now:
- Pull real credit data from CRS API
- Transform it into Treeconomy game state
- Generate AI Ranger narratives with Gemini
- Award verified XP based on credit improvements

🌲 **Happy coding!**
