# LinkedIn Agent — Complete File Checklist & Context for Cursor

## Project: linkedin-agent-clean
## Stack: React + Vite (Frontend) | FastAPI + Python (Backend) | Docker

---

## ✅ COMPLETE FILE TREE (every file that must exist)

```
linkedin-agent-clean/                    ← ROOT
│
├── .env                                 ← SECRET KEYS (never commit)
├── .gitignore                           ← Ignores .env, node_modules, __pycache__
├── docker-compose.yml                   ← Runs frontend + backend together
├── README.md                            ← Setup instructions
├── step1_get_token.py                   ← Run ONCE to get LinkedIn OAuth token
│
├── backend/                             ← Python FastAPI server
│   ├── Dockerfile                       ← Docker image for backend
│   ├── main.py                          ← ALL backend logic (API routes + AI calls)
│   └── requirements.txt                 ← Python dependencies
│
└── frontend/                            ← React app (Vite)
    ├── Dockerfile                       ← Docker image for frontend
    ├── index.html                       ← HTML entry point (loads React)
    ├── package.json                     ← Node dependencies + scripts
    ├── vite.config.js                   ← Vite config + API proxy to backend
    ├── public/                          ← Static assets (currently empty, that's OK)
    └── src/                             ← All React source code
        ├── App.jsx                      ← Root component + page routing + Dashboard
        ├── index.css                    ← Global CSS variables + animations
        ├── main.jsx                     ← React entry point (mounts App)
        │
        ├── components/                  ← Reusable UI components
        │   ├── OutputPanel.jsx          ← Shows generated text + Copy + Post buttons
        │   ├── Sidebar.jsx              ← Left nav (Content / Brand / Job Hunt)
        │   └── StatusBar.jsx            ← Top bar: AI provider + LinkedIn status
        │
        ├── hooks/                       ← API communication layer
        │   └── useApi.js                ← fetch() calls to FastAPI backend
        │
        └── pages/                       ← One file per agent mode
            ├── ContentPage.jsx          ← Mode 1: Work activity → LinkedIn post
            ├── BrandPage.jsx            ← Mode 2: Events/hackathons → Brand post
            └── JobPage.jsx              ← Mode 3: JD → Cover letter + recruiter DM
```

---

## 📋 FILE COUNT VERIFICATION

Run this in terminal to verify all files exist:
```bash
find . -type f | grep -v node_modules | grep -v __pycache__ | sort
```

Expected output (22 files):
```
./.env
./.gitignore
./README.md
./docker-compose.yml
./step1_get_token.py
./backend/Dockerfile
./backend/main.py
./backend/requirements.txt
./frontend/Dockerfile
./frontend/index.html
./frontend/package.json
./frontend/vite.config.js
./frontend/src/App.jsx
./frontend/src/index.css
./frontend/src/main.jsx
./frontend/src/components/OutputPanel.jsx
./frontend/src/components/Sidebar.jsx
./frontend/src/components/StatusBar.jsx
./frontend/src/hooks/useApi.js
./frontend/src/pages/BrandPage.jsx
./frontend/src/pages/ContentPage.jsx
./frontend/src/pages/JobPage.jsx
```

---

## 🔌 HOW FILES CONNECT (Data Flow)

```
User types in browser
        ↓
ContentPage.jsx / BrandPage.jsx / JobPage.jsx
        ↓  calls
useApi.js  →  fetch('/api/generate')
        ↓  proxied by vite.config.js to
backend:8000/generate
        ↓  handled by
main.py  →  calls Gemini or Anthropic API
        ↓  returns generated text
OutputPanel.jsx  →  shows result
        ↓  user clicks "Post to LinkedIn"
useApi.js  →  fetch('/api/post-to-linkedin')
        ↓
main.py  →  calls LinkedIn API  →  post published ✅
```

---

## 📄 WHAT EACH FILE DOES

### ROOT FILES

**`.env`** — Your secret keys. Never commit to git.
```
ANTHROPIC_API_KEY=...   ← Claude API (optional, takes priority)
GEMINI_API_KEY=...      ← Gemini API (free tier)
LINKEDIN_CLIENT_ID=8686ysfd1dxz4r
LINKEDIN_CLIENT_SECRET=...
LINKEDIN_ACCESS_TOKEN=  ← Auto-filled by step1_get_token.py
LINKEDIN_PERSON_URN=    ← Auto-filled by step1_get_token.py
```

**`docker-compose.yml`** — Defines 2 services:
- `backend` → builds from `./backend`, runs on port 8000
- `frontend` → builds from `./frontend`, runs on port 3000
- Both share the `.env` file

**`step1_get_token.py`** — Run once before docker-compose up:
- Opens browser → LinkedIn login
- Gets OAuth access token
- Saves token + URN to `.env` automatically

---

### BACKEND FILES

**`backend/main.py`** — The entire Python backend:
- `GET  /health` → health check
- `GET  /status` → AI provider + LinkedIn connection status
- `POST /generate` → takes `{mode, input}` → calls AI → returns generated text
  - mode = "content" | "brand" | "job"
- `POST /post-to-linkedin` → takes `{text}` → posts to LinkedIn API
- Auto-detects: uses Anthropic if key set, else Gemini
- CORS enabled for localhost:3000

**`backend/requirements.txt`**:
```
fastapi==0.115.0
uvicorn==0.30.6
python-dotenv==1.0.1
requests==2.32.3
pydantic==2.8.2
```

**`backend/Dockerfile`**:
- Base: python:3.11-slim
- Installs requirements
- Runs: `uvicorn main:app --host 0.0.0.0 --port 8000 --reload`

---

### FRONTEND FILES

**`frontend/vite.config.js`** — Critical: proxies `/api/*` → `http://backend:8000/*`
This means frontend calls `/api/generate` → backend receives it at `/generate`

**`frontend/index.html`** — Loads Google Fonts (JetBrains Mono + Syne) + mounts React

**`frontend/package.json`** — Dependencies:
```json
"react": "^18.3.1"
"react-dom": "^18.3.1"
"lucide-react": "^0.383.0"
```

**`frontend/src/index.css`** — CSS custom properties (design tokens):
- Dark theme: `--bg`, `--bg-card`, `--bg-elevated`, `--border`, etc.
- Colors: `--accent` (blue), `--green`, `--amber`, `--purple`, `--red`
- Fonts: `--font-display` (Syne), `--font-mono` (JetBrains Mono)
- Animations: fadeUp, pulse-dot, spin, blink

**`frontend/src/main.jsx`** — Entry: renders `<App />` into `#root`

**`frontend/src/App.jsx`** — Root component:
- State: `page` (current route: 'home'|'content'|'brand'|'job')
- Renders: `<StatusBar>` + `<Sidebar>` + current page
- Dashboard: shows 3 mode cards + stats (3TB, FIFA 2026, 42 apps)

**`frontend/src/components/StatusBar.jsx`**:
- Polls `GET /api/status` every 15 seconds
- Shows: AI provider (gemini/claude) + LinkedIn connected status

**`frontend/src/components/Sidebar.jsx`**:
- Navigation: Content (✦ green) | Brand (◈ purple) | Job Hunt (⊕ amber)
- Shows logo "AGENT_PS" + Priyansh's info

**`frontend/src/components/OutputPanel.jsx`**:
- Displays generated text in monospace code block
- Copy button (copies to clipboard)
- "Post to LinkedIn" button → calls `POST /api/post-to-linkedin`
- Shows success/error state after posting

**`frontend/src/hooks/useApi.js`**:
- `checkStatus()` → GET /api/status
- `generate(mode, input)` → POST /api/generate
- `postToLinkedIn(text)` → POST /api/post-to-linkedin

**`frontend/src/pages/ContentPage.jsx`**:
- Textarea: user describes today's work activity
- Placeholder example: MongoDB migration story
- Tips grid: include numbers, mention tools, describe challenge, state result
- On submit: calls `generate('content', input)`

**`frontend/src/pages/BrandPage.jsx`**:
- Quick-add chips: Hackathon, Cost-saving event, Tech talk, etc.
- Textarea: describe event/achievement
- On submit: calls `generate('brand', input)`

**`frontend/src/pages/JobPage.jsx`**:
- Shows target companies grid (Hotstar, JP Morgan, Zscaler, etc.)
- Textarea: paste full job description
- Shows what you'll get: Cover Letter + 8 Keywords + Recruiter DM
- On submit: calls `generate('job', input)`

---

## 🚀 STARTUP ORDER

```bash
# 1. Fill .env with your keys
# 2. Connect LinkedIn (run once, outside Docker)
python step1_get_token.py

# 3. Start everything
docker-compose up --build

# Frontend → http://localhost:3000
# Backend  → http://localhost:8000
# API Docs → http://localhost:8000/docs
```

---

## 🐛 COMMON ISSUES & FIXES

| Problem | Cause | Fix |
|---------|-------|-----|
| Frontend can't reach backend | Proxy not working | Check vite.config.js has `target: 'http://backend:8000'` |
| "No valid API key" error | .env not loaded | Make sure .env is in ROOT folder (not inside backend/) |
| LinkedIn post fails | Token expired | Re-run step1_get_token.py (token lasts 2 months) |
| CORS error in browser | Backend CORS config | Check main.py has `allow_origins: ["http://localhost:3000"]` |
| Container can't find module | npm install not run | Run `docker-compose up --build` (not just `up`) |

---

## 💡 CURSOR PROMPT TO USE

Paste this when asking Cursor to check/fix anything:

> "This is a LinkedIn AI Agent webapp. Backend is FastAPI (Python) in /backend/main.py.
> Frontend is React + Vite in /frontend/src/. The vite.config.js proxies /api/* to 
> http://backend:8000. The agent has 3 modes: content, brand, job. It auto-detects 
> Gemini or Anthropic API from .env. LinkedIn posting uses OAuth token from .env.
> Check [specific file] and [specific issue]."

