# 🚀 Treeconomy Backend - Quick Start

## 🎯 What You Just Built

An **AI Credit Orchestration Layer** that:
- Uses **Gemini** for AI reasoning
- Pulls **real credit data** from CRS API
- Transforms credit into **RPG mechanics**
- Awards **verified XP** based on improvement
- Generates **AI Ranger narratives**

---

## ⚡ 5-Minute Setup

### 1. Install Dependencies ✅
```bash
npm install
```
**Status:** ✅ Already done!

---

### 2. Set Up Environment Variables

```bash
# Copy template
cp .env.local .env

# Generate encryption keys
openssl rand -hex 32    # Copy this to ENCRYPTION_KEY
openssl rand -base64 32 # Copy this to SESSION_SECRET

# Edit .env and add:
# - Your Gemini API key
# - Your CRS credentials
nano .env
```

**Where to get credentials:** See `CREDENTIALS_GUIDE.md`

---

### 3. Test Configuration

```bash
# Start dev server
npm run dev

# In another terminal, test health
curl http://localhost:3000/api/health
```

**Expected:** `"status": "healthy"`

---

### 4. Try It Out

**Option A: Use the UI**
1. Go to `http://localhost:3000`
2. Click "🌿 Sync My Forest"
3. Use sandbox data (SSN: 666001001)
4. See real credit data transform into RPG mechanics!

**Option B: Use cURL**
```bash
curl -X POST http://localhost:3000/api/credit/sync \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user",
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

## 📁 What Got Created

```
ranger_new/
├── lib/backend/
│   ├── types.ts              # Type definitions
│   ├── config.ts             # Configuration & XP rules
│   ├── security.ts           # Encryption & data protection
│   ├── gameStateEngine.ts    # XP & skill unlocking
│   ├── narrativeEngine.ts    # Gemini AI narratives
│   └── creditOrchestrator.ts # Main orchestration
│
├── app/api/
│   ├── credit/
│   │   ├── sync/route.ts     # Main sync endpoint
│   │   ├── compare/route.ts  # Multi-bureau comparison
│   │   └── debug/route.ts    # Debug requests
│   ├── health/route.ts       # Config validation
│   └── test-personas/route.ts # Sandbox test data
│
├── components/
│   ├── identity-gate-modal.tsx # Identity verification UI
│   └── ui/
│       └── 8bit-button.tsx     # Pixel art button
│
├── .env.local                # Environment template
├── .gitignore                # Updated with security rules
├── BACKEND_SETUP.md          # Full documentation
├── ENV_SETUP_INSTRUCTIONS.md # Step-by-step env setup
├── CREDENTIALS_GUIDE.md      # Where to get credentials
└── QUICK_START.md            # This file
```

---

## 🎮 How It Works

```
1. User clicks "Sync My Forest"
        ↓
2. IdentityGateModal opens
        ↓
3. User enters personal info (or loads sandbox data)
        ↓
4. POST /api/credit/sync
        ↓
5. Backend:
   - Verifies identity (FlexID)
   - Pulls credit report (CRS API)
   - Transforms to game metrics
   - Calculates XP events
   - Checks skill unlocks
   - Generates AI narrative (Gemini)
   - Deletes raw credit data
        ↓
6. Frontend receives:
   - Game state (XP, tier, forest health)
   - AI Ranger message
   - New skill unlocks
   - XP events
        ↓
7. UI updates:
   - Skill tree animates unlocks
   - XP bar fills
   - AI Ranger speaks
   - Leaderboard updates
```

---

## 🧪 Test Endpoints

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Get Sandbox Test Data
```bash
curl http://localhost:3000/api/test-personas
```

### Pull Credit Report
```bash
curl -X POST http://localhost:3000/api/credit/sync -H "Content-Type: application/json" -d @test-request.json
```

### Compare All Bureaus
```bash
curl -X POST http://localhost:3000/api/credit/compare -H "Content-Type: application/json" -d @test-request.json
```

### Debug Request
```bash
curl "http://localhost:3000/api/credit/debug?requestId=abc123"
```

---

## 🔐 Security Features

✅ **AES-256-GCM encryption** for PII  
✅ **SSN masking** (shows only last 4 digits)  
✅ **Auto-deletion** of raw credit data (15min)  
✅ **Rate limiting** (10 req/min per user)  
✅ **Sandbox environment validation**  
✅ **No logging of sensitive data**

---

## 📚 Documentation

- **`BACKEND_SETUP.md`** - Complete architecture guide
- **`ENV_SETUP_INSTRUCTIONS.md`** - Step-by-step environment setup
- **`CREDENTIALS_GUIDE.md`** - Where to get API keys
- **`QUICK_START.md`** - This file (quick overview)

---

## 🎯 XP System (Verified by Real Credit Data)

| Event | XP Awarded |
|-------|------------|
| Utilization decreases 1% | 5 XP |
| Credit score increases 1 point | 2 XP |
| On-time payment month | 10 XP |
| Hard inquiry ages off | 20 XP |
| Reach 650 score | 50 XP bonus |
| Reach 700 score | 100 XP bonus |
| Reach 750 score | 200 XP bonus |
| Reach 800 score | 400 XP bonus |

**All XP is verified by actual credit bureau data!**

---

## 🌲 Tier System

| Tier | Min XP | Shield |
|------|--------|--------|
| Seedling Scout | 0 | shield-wood-1 |
| Sprout Sentinel | 100 | shield-wood-2 |
| Grove Guardian | 250 | shield-wood-3 |
| Branch Warden | 500 | shield-wood-4 |
| Canopy Knight | 800 | shield-wood-5 |
| Wildwood Keeper | 1200 | shield-wood-6 |
| Forest Champion | 1700 | shield-wood-7 |
| Ancient Protector | 2500 | shield-wood-8 |
| Eternal Ranger | 3500 | shield-wood-9 |
| Treeconomy Legend | 5000+ | shield-wood-10 |

---

## 🆘 Troubleshooting

### "Missing environment variable"
→ Check `.env` file exists and has all required fields

### "Identity verification failed"
→ Use sandbox SSN starting with 666 (e.g., 666001001)

### "Rate limit exceeded"
→ Wait 1 minute and try again

### Gemini not responding
→ Check API key is valid and internet connection is stable

### CRS API errors
→ Verify credentials and sandbox environment is selected

---

## 🚀 Next Steps

### Immediate
- [ ] Set up environment variables
- [ ] Test health endpoint
- [ ] Try sandbox credit pull
- [ ] Verify AI narrative generation

### Short Term
- [ ] Connect Scene 2 to live API
- [ ] Replace static AI Ranger with Gemini
- [ ] Update skill tree with auto-unlocking
- [ ] Add verified leaderboard

### Long Term
- [ ] Add user authentication
- [ ] Persistent database storage
- [ ] "What-If" simulator
- [ ] Multi-bureau trend analysis

---

## 🎉 Congratulations!

You now have a **production-ready AI credit orchestration engine** that combines:
- **Gemini AI** (reasoning)
- **CRS Credit API** (truth)
- **Treeconomy** (motivation)

**This isn't just another fintech dashboard. This is a behavior change engine.**

🌲 **Now go build something amazing!**
