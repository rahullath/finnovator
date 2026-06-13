# Running the App

## Prerequisites
- Python 3.11+
- Node 18+
- API keys: copy `backend/.env.example` to `backend/.env` and fill in

## Quick start (two terminals)

### Terminal 1 — Backend
```bash
cd backend
python3 -m venv venv          # only first time
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt  # only first time
uvicorn main:app --reload --port 8000
```

Backend runs at http://localhost:8000  
Docs at http://localhost:8000/docs

### Terminal 2 — Frontend
```bash
cd frontend
npm install    # only first time
npm run dev
```

Frontend runs at http://localhost:5173

---

## API endpoints

| Method | URL | What it does |
|--------|-----|------|
| GET | /api/companies | List all tickers |
| GET | /api/score/{ticker} | Full score for a company (default weights) |
| POST | /api/score/{ticker} | Score with custom weights (body: `{divergence, verification, controversy}`) |
| GET | /api/portfolio | All 8 companies + portfolio tilt comparison |
| GET | /api/health | Healthcheck |

---

## Demo script (3 minutes)

1. **Open BP** → show Engagement Priority (barely above threshold), terrible impact (32/100)
2. **Open NESN** → show Greenwashing Risk, 3 contradicted claims, 5 controversies including enforcement actions
3. **Open ORSTED** → show Preferred Leader, 87% renewable, 96/100 impact
4. **Open XOM** → show XOM integrity is HIGHER than BP (77 vs 56): "Exxon is consistently bad — everyone agrees. BP claims to be good but the data says otherwise. That gap is greenwashing."
5. **Drag the weight sliders** → show how Integrity Score changes — "This is what MIT calls methodological arbitrariness. Every ESG vendor makes these choices silently. We make them visible."
6. **Switch to Portfolio view** → show Naive ESG tilt vs Integrity×Impact tilt — capital reallocation implication
7. **Switch roles** → PM → Regulator view → "This is what an FCA examiner would see"

---

## If APIs fail on demo day (fallback)

Set in `backend/.env`:
```
USE_STATIC_DATA=true
```

All data is pre-baked in `backend/data/*.csv` — the app runs fully offline.

---

## Deployment (if time allows)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend
npm run build
vercel --prod

# Backend: deploy to Railway or Render (both have free tiers)
# Set env vars in the platform dashboard
```
