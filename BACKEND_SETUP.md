# 🌲 Treeconomy Backend Setup Guide
## AI Credit Orchestrator Layer - Gemini + CRS Credit API

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Environment Setup](#environment-setup)
4. [Backend Modules](#backend-modules)
5. [API Endpoints](#api-endpoints)
6. [Testing Guide](#testing-guide)
7. [Security Notes](#security-notes)
8. [Next Steps](#next-steps)

---

## 🎯 Overview

Your Treeconomy backend is now a **real-time AI credit orchestration engine** that:

- ✅ Uses **Gemini AI** as the reasoning/narrative engine
- ✅ Integrates with **CRS Credit API** via MCP for real credit data
- ✅ Transforms credit metrics into **RPG game mechanics**
- ✅ Generates **AI Ranger narratives** in environmental metaphors
- ✅ Awards **verified XP** based on actual credit improvement
- ✅ Auto-unlocks **skills** when credit thresholds are met

**This is NOT a credit dashboard. This is an AI-powered financial improvement simulation.**

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                       │
│  - Scene 1: Skill Tree (real skill unlocking)              │
│  - Scene 2: AI Ranger (live Gemini narratives)             │
│  - Scene 3: Leaderboards (verified XP only)                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│            NEXT.JS API ROUTES (/app/api/)                   │
│  - /api/credit/sync     → Main orchestration endpoint      │
│  - /api/credit/compare  → Multi-bureau comparison          │
│  - /api/credit/debug    → Debug failed requests            │
│  - /api/health          → Config validation                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│           BACKEND ORCHESTRATION LAYER                       │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  creditOrchestrator.ts                              │  │
│  │  - Coordinates entire flow                          │  │
│  │  - Calls CRS API for credit data                    │  │
│  │  - Transforms to game state                         │  │
│  │  - Triggers Gemini for narratives                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  gameStateEngine.ts                                 │  │
│  │  - XP calculation                                    │  │
│  │  - Skill unlock logic                               │  │
│  │  - Tier progression                                 │  │
│  │  - Forest health scoring                            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  narrativeEngine.ts                                 │  │
│  │  - Gemini AI integration                            │  │
│  │  - Environmental metaphor generation                │  │
│  │  - AI Ranger messaging                              │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  security.ts                                        │  │
│  │  - AES-256 encryption                               │  │
│  │  - SSN sanitization                                 │  │
│  │  - Rate limiting                                    │  │
│  │  - Temporary data cleanup                           │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │
           ┌───────────┴───────────┐
           ▼                       ▼
┌────────────────────┐   ┌───────────────────────┐
│   GEMINI AI API    │   │   CRS CREDIT API      │
│  (Narratives)      │   │   (Credit Data)       │
└────────────────────┘   └───────────────────────┘
```

---

## 🔧 Environment Setup

### Step 1: Create `.env` File

Copy the template and fill in your credentials:

```bash
cp .env.example .env
```

### Step 2: Fill in Credentials

```env
# GEMINI AI
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here

# CRS CREDIT API
CRS_USERNAME=your_crs_username_here
CRS_PASSWORD=your_crs_password_here
CRS_ENVIRONMENT=sandbox

# SECURITY (Generate these!)
ENCRYPTION_KEY=run_openssl_rand_-hex_32
SESSION_SECRET=run_openssl_rand_-base64_32

# APP
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Get Your API Keys

#### **Gemini API Key**
1. Go to: https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key → Paste into `GOOGLE_GENERATIVE_AI_API_KEY`

#### **CRS Credit API Credentials**
1. Contact CRS: development@crscreditapi.com
2. Request sandbox access
3. You'll receive `username` and `password`
4. Paste into `CRS_USERNAME` and `CRS_PASSWORD`

#### **Generate Encryption Keys**

```bash
# Encryption Key (AES-256)
openssl rand -hex 32

# Session Secret
openssl rand -base64 32
```

---

## 📦 Backend Modules

### 1. `creditOrchestrator.ts`

**Main orchestration layer** that coordinates the entire flow.

**Key Functions:**
- `orchestrateSync()` - Main endpoint: pulls credit, transforms, generates narrative
- `pullCreditReport()` - Calls CRS API
- `verifyIdentity()` - FlexID identity verification
- `compareBureaus()` - Multi-bureau comparison

**Usage:**
```typescript
import { getOrchestrator } from '@/lib/backend/creditOrchestrator';

const orchestrator = getOrchestrator();
const result = await orchestrator.orchestrateSync({
  userId: "user123",
  bureau: "experian",
  personalInfo: { /* ... */ },
  includeIdentityCheck: true
});
```

---

### 2. `gameStateEngine.ts`

**XP calculation and skill unlocking** based on real credit data.

**Key Functions:**
- `updateGameState()` - Transforms credit report into game state
- `calculateXPEvents()` - Awards XP for improvements
- `checkSkillUnlocks()` - Auto-unlocks skills when conditions met
- `calculateForestHealth()` - 0-100 health score

**XP Rules:**
- **Utilization decrease**: 5 XP per 1% reduction
- **Score increase**: 2 XP per point
- **Payment streak**: 10 XP per month
- **Milestones**: Bonus XP at 650/700/750/800

---

### 3. `narrativeEngine.ts`

**Gemini-powered AI Ranger** that speaks in environmental metaphors.

**Key Functions:**
- `generateNarrative()` - Main narrative generation
- `generateWelcomeNarrative()` - First-time user message
- `generateTierUpNarrative()` - Celebration for tier-ups
- `generateWhatIfNarrative()` - "What-if" simulations

**Metaphor System:**
- Credit Score → Forest vitality
- Utilization → Resource consumption / Soil depletion
- Payment History → Seasonal cycles / Growth rings
- Hard Inquiries → Storms / Lightning strikes

---

### 4. `security.ts`

**Encryption and data protection** utilities.

**Key Functions:**
- `encrypt()` / `decrypt()` - AES-256-GCM encryption
- `maskSSN()` - Shows only last 4 digits
- `sanitizeForLogging()` - Removes PII from logs
- `checkRateLimit()` - In-memory rate limiting
- `storeTemporary()` - Auto-expiring data storage

**Critical:** Raw credit data is deleted after 15 minutes!

---

## 🌐 API Endpoints

### `POST /api/credit/sync`

**Main orchestration endpoint** - Pulls credit and updates game state.

**Request:**
```json
{
  "userId": "user123",
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
  },
  "includeIdentityCheck": true
}
```

**Response:**
```json
{
  "success": true,
  "gameState": {
    "userId": "user123",
    "forestHealth": 85,
    "xp": 420,
    "tier": "Canopy Knight",
    "metrics": {
      "creditScore": 750,
      "utilization": 25,
      "paymentStreak": 12,
      "inquiryCount": 1
    }
  },
  "narrative": {
    "message": "Your forest flourishes...",
    "tone": "positive"
  },
  "newUnlocks": [
    {
      "skillId": "score-750",
      "name": "Excellent Credit Achievement",
      "xpAwarded": 200
    }
  ],
  "xpEvents": [/* ... */]
}
```

---

### `POST /api/credit/compare`

**Multi-bureau comparison** - Pulls all three bureaus in parallel.

**Request:**
```json
{
  "userId": "user123",
  "personalInfo": { /* same as above */ }
}
```

---

### `GET /api/credit/debug?requestId=abc123`

**Debug previous requests** - Retrieves stored request/response data.

---

### `GET /api/health`

**Health check** - Validates configuration.

**Response:**
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

### `GET /api/test-personas`

**Sandbox test data** - Returns pre-configured test personas.

*(Only available in sandbox environment)*

---

## 🧪 Testing Guide

### Step 1: Check Health

```bash
curl http://localhost:3000/api/health
```

Should return `"status": "healthy"` if all configured.

---

### Step 2: Get Test Personas

```bash
curl http://localhost:3000/api/test-personas
```

Returns sandbox SSNs you can use for testing.

---

### Step 3: Test Credit Sync

Use the **IdentityGateModal** component or call API directly:

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

---

### Step 4: Test Multi-Bureau Comparison

```bash
curl -X POST http://localhost:3000/api/credit/compare \
  -H "Content-Type: application/json" \
  -d '{ /* same personalInfo */ }'
```

---

## 🔐 Security Notes

### ⚠️ CRITICAL RULES

1. **NEVER log SSNs** - Use `sanitizeForLogging()`
2. **NEVER store raw credit reports** - Transform → Delete
3. **ALWAYS encrypt PII at rest** - Use `encrypt()`
4. **ALWAYS use HTTPS in production**
5. **Sandbox SSNs start with 666** - Enforced by `validateEnvironment()`

### Data Retention Policy

- **Raw credit data**: 15 minutes (then auto-deleted)
- **Transformed metrics**: Stored in game state
- **No SSNs stored**: Only masked versions for display

### Rate Limiting

- Credit sync: 10 requests/minute per user
- Bureau comparison: 3 requests/5min per user

---

## 🚀 Next Steps

### Phase 1: Integration (Current)

- [x] Backend orchestration layer
- [x] Game state engine
- [x] Narrative engine
- [x] API routes
- [x] Identity gate UI
- [ ] Connect frontend to API
- [ ] Replace static AI Ranger with live Gemini

### Phase 2: Enhanced Features

- [ ] Persistent storage (database)
- [ ] User authentication
- [ ] Verified leaderboards
- [ ] Seasonal resets
- [ ] Achievement badges

### Phase 3: Advanced

- [ ] "What-If" simulator
- [ ] Credit score prediction
- [ ] Multi-bureau trend analysis
- [ ] Push notifications on XP events

---

## 📚 Example Integration

### In Scene 2 (AI Ranger):

```typescript
"use client";

import { useState } from 'react';
import { IdentityGateModal } from '@/components/identity-gate-modal';

export function SceneTwo() {
  const [showModal, setShowModal] = useState(false);
  const [narrative, setNarrative] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async (personalInfo) => {
    setIsLoading(true);
    
    const response = await fetch('/api/credit/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'your_user_id',
        bureau: 'experian',
        personalInfo,
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      setNarrative(result.narrative.message);
      // Update XP bar, skills, etc.
    }
    
    setIsLoading(false);
    setShowModal(false);
  };

  return (
    <>
      <button onClick={() => setShowModal(true)}>
        🌿 Sync My Forest
      </button>

      <IdentityGateModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onVerify={handleVerify}
        isVerifying={isLoading}
      />

      {/* Display AI Ranger message */}
      <div className="ai-ranger-message">
        {narrative}
      </div>
    </>
  );
}
```

---

## 🆘 Troubleshooting

### "Missing GOOGLE_GENERATIVE_AI_API_KEY"
- Check `.env` file exists
- Verify API key is valid
- Restart dev server after adding env vars

### "Identity verification failed"
- Check SSN format (9 digits, no dashes)
- Ensure sandbox SSN starts with 666
- Verify CRS credentials are correct

### "Rate limit exceeded"
- Wait for rate limit window to expire
- Check `resetAt` timestamp in error response

### Gemini not generating narratives
- Check Gemini API key is valid
- Verify network connectivity
- Check logs for detailed error messages

---

## 📞 Support

- **CRS API Issues**: development@crscreditapi.com
- **Gemini API Issues**: https://aistudio.google.com/
- **Backend Questions**: Check console logs (verbose debugging enabled)

---

## 🎉 Congratulations!

You now have a **real-time AI credit orchestration engine** that:
- Uses **actual credit bureau data**
- Transforms it into **RPG mechanics**
- Generates **AI-powered narratives**
- Awards **verified XP**
- Auto-unlocks **skills**

**You're not building a fintech app. You're building a financial improvement game powered by AI and real credit data.**

🌲 **Welcome to Treeconomy 2.0**
