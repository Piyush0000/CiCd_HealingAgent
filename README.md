# 🤖 Autonomous CI/CD Healing Agent

> A fully autonomous DevOps AI that clones repositories, runs tests in a sandbox, classifies bugs, applies deterministic fixes, commits with `[AI-AGENT]` prefix, and pushes a clean healing branch — zero human intervention required.

---

## 📸 Dashboard Preview

| Input Section | Live Event Feed | Results Dashboard |
|---|---|---|
| Repo URL · Team · Leader | Real-time socket stream | Score · Fixes · Timeline |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   React Dashboard                    │
│    Input Form → Live Feed → Results + Score Panel   │
└──────────────────────┬──────────────────────────────┘
                       │  HTTP + WebSocket (Socket.io)
┌──────────────────────▼──────────────────────────────┐
│              Express Backend (Node.js)               │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │            Orchestrator Agent                │   │
│  │                                              │   │
│  │  ┌──────────┐  ┌──────────┐  ┌───────────┐  │   │
│  │  │Repository│  │   Test   │  │ Analyzer  │  │   │
│  │  │  Agent   │  │Execution │  │  Agent    │  │   │
│  │  │ clone()  │  │  Agent   │  │ classify()│  │   │
│  │  │ branch() │  │ runTests │  │           │  │   │
│  │  │ commit() │  │  parse() │  └─────┬─────┘  │   │
│  │  │  push()  │  └──────────┘        │        │   │
│  │  └──────────┘               ┌──────▼──────┐ │   │
│  │                             │  Fix Agent  │ │   │
│  │  ┌────────────────────┐     │  LINTING    │ │   │
│  │  │   CI Monitor Agent │     │  SYNTAX     │ │   │
│  │  │  iteration tracker │     │  LOGIC      │ │   │
│  │  │  pass/fail record  │     │  TYPE_ERROR │ │   │
│  │  └────────────────────┘     │  IMPORT     │ │   │
│  │                             │  INDENTATION│ │   │
│  └─────────────────────────────┴─────────────┘ │   │
└─────────────────────────────────────────────────────┘
```

### Retry Loop

```
while iteration ≤ 5:
  run_tests()
  if passed → break
  failures = parse_output()
  classified = analyze(failures)
  fixes = apply_fixes(classified)
  commit("[AI-AGENT] Fix iteration N")
  push(branch)
  iteration++
```

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Axios, Socket.io-client |
| **Backend** | Node.js, Express, Socket.io |
| **Git** | simple-git |
| **Test Runners** | Jest, Mocha, Vitest, pytest (auto-detected) |
| **Styling** | Vanilla CSS (dark glassmorphism) |
| **Deployment** | Vercel (frontend) · Railway/Render (backend) |
| **Containerization** | Docker, Docker Compose |

---

## 📁 Folder Structure

```
cicd-healing-agent/
├── backend/
│   ├── agents/
│   │   ├── orchestratorAgent.js   # Coordinates all agents
│   │   ├── repositoryAgent.js     # Git clone/branch/commit/push
│   │   ├── testExecutionAgent.js  # Run tests, parse output
│   │   ├── analyzerAgent.js       # Classify bug types
│   │   ├── fixAgent.js            # Deterministic fix engine
│   │   └── ciMonitorAgent.js      # Iteration tracker & timeline
│   ├── server.js                  # Express + Socket.io server
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── InputSection.jsx   # Form + hero + agent info
│   │   │   ├── EventLog.jsx       # Real-time live feed
│   │   │   ├── ResultsDashboard.jsx
│   │   │   ├── SummaryCard.jsx    # 6 stats grid
│   │   │   ├── ScorePanel.jsx     # SVG score circle
│   │   │   ├── FixesTable.jsx     # Color-coded table
│   │   │   ├── CITimeline.jsx     # Iteration timeline
│   │   │   └── Toast.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── Dockerfile
│   ├── nginx.conf
│   └── vercel.json
├── docker-compose.yml
├── .gitignore
├── .env.example
└── README.md
```

---

## ⚡ Quick Start (Local Development)

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- Git

### 1. Clone this repo

```bash
git clone https://github.com/your-org/cicd-healing-agent.git
cd cicd-healing-agent
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure Backend Environment

```bash
cp .env.example .env
# Edit .env if needed (default PORT=4000 works out of the box)
```

### 4. Start the Backend

```bash
npm run dev      # development with nodemon
# OR
npm start        # production
```

Backend will be running at `http://localhost:4000`

### 5. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 6. Configure Frontend Environment

```bash
cp .env.example .env
# VITE_API_URL=http://localhost:4000  (default)
```

### 7. Start the Frontend

```bash
npm run dev
```

Dashboard will be running at `http://localhost:3000`

---

## 🐳 Docker Deployment

### Build & Run with Docker Compose

```bash
# From project root
docker-compose up --build
```

- Frontend: `http://localhost:3000`
- Backend:  `http://localhost:4000`

### Build individually

```bash
# Backend
cd backend
docker build -t cicd-agent-backend .
docker run -p 4000:4000 -v /var/run/docker.sock:/var/run/docker.sock cicd-agent-backend

# Frontend
cd frontend
docker build -t cicd-agent-frontend .
docker run -p 3000:80 cicd-agent-frontend
```

---

## ☁️ Cloud Deployment

### Frontend → Vercel

1. Push `frontend/` to GitHub
2. Import the repo on [vercel.com](https://vercel.com)
3. Set **Root Directory** to `frontend`
4. Add environment variable:
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   ```
5. Deploy — the `vercel.json` handles SPA routing automatically

### Backend → Railway

1. Create a new project on [railway.app](https://railway.app)
2. Connect your GitHub repo
3. Set **Root Directory** to `backend`
4. Add environment variables:
   ```
   PORT=4000
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
5. Railway auto-detects the `Dockerfile` and deploys

### Backend → Render

1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repo
3. Set **Root Directory** to `backend`
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Add same environment variables as above

---

## 🔌 API Documentation

### `GET /health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-19T10:00:00.000Z"
}
```

---

### `POST /run-agent`

Starts the healing agent (async mode with Socket.io).

**Request Body:**
```json
{
  "repoUrl": "https://github.com/username/repo",
  "teamName": "Alpha Team",
  "leaderName": "Jane Doe"
}
```

**Response (immediate):**
```json
{
  "runId": "run_1708342800000",
  "message": "Agent started. Connect to socket for live updates."
}
```

Connect to Socket.io and `join-run` with the `runId` to receive live events.

**Socket Events Emitted:**
| Event | Payload |
|---|---|
| `agent-event` | `{ type, message, ts, ... }` |
| `agent-complete` | `{ runId, result }` |
| `agent-error` | `{ runId, error }` |

---

### `POST /run-agent-sync`

Runs the agent synchronously (polling fallback — recommended for testing).

**Request Body:** Same as `/run-agent`

**Response (after completion):**
```json
{
  "success": true,
  "result": {
    "branch": "ALPHA_TEAM_JANE_DOE_AI_Fix",
    "repoUrl": "https://github.com/...",
    "totalFailures": 3,
    "totalFixes": 2,
    "iterationsUsed": 2,
    "finalStatus": "PASSED",
    "timeTaken": 48,
    "score": 110,
    "scoreBreakdown": {
      "base": 100,
      "timeBonus": 10,
      "commitPenalty": 0
    },
    "ciTimeline": [
      { "iteration": 1, "status": "FAILED", "timestamp": "..." },
      { "iteration": 2, "status": "PASSED", "timestamp": "..." }
    ],
    "fixes": [
      {
        "file": "src/utils.py",
        "bugType": "IMPORT",
        "line": 3,
        "commitMessage": "[AI-AGENT] Fix: IMPORT in utils.py line 3",
        "status": "Fixed",
        "action": "Added missing import: os"
      }
    ]
  },
  "events": [...]
}
```

---

## 🔧 Fix Engine Rules

| Bug Type | Detection | Fix Applied |
|---|---|---|
| `LINTING` | `no-unused`, `no-console` keywords | Remove flagged line |
| `SYNTAX` | `SyntaxError`, missing colon/semicolon | Append `:` or `;` |
| `INDENTATION` | `IndentationError`, unexpected indent | Reindent based on context |
| `IMPORT` | `ImportError`, `Cannot find module` | Add import at top of file |
| `TYPE_ERROR` | `TypeError`, `is not a function` | Annotate with null-check comment |
| `LOGIC` | `AssertionError`, assertion failures | Mark with review comment |

---

## 📊 Scoring System

```
Base Score:       100
+ Time Bonus:     +10  (if completed in < 5 minutes)
- Commit Penalty: -2   (per commit over 20)
─────────────────────
Max Score:        110
```

---

## 🌿 Branch Naming Convention

```
{TEAM_NAME}_{LEADER_NAME}_AI_Fix

Examples:
  ALPHA_TEAM_JANE_DOE_AI_Fix
  DATA_SCIENCE_JOHN_SMITH_AI_Fix
  BACKEND_SQUAD_ALEX_CHEN_AI_Fix
```

- All uppercase
- Spaces → underscores
- Always ends with `_AI_Fix`
- Never pushes to `main` or `master`

---

## 💡 Usage Examples

### Example 1: Python pytest repo

```bash
curl -X POST http://localhost:4000/run-agent-sync \
  -H "Content-Type: application/json" \
  -d '{
    "repoUrl": "https://github.com/example/python-calculator",
    "teamName": "Data Science",
    "leaderName": "Alice Chen"
  }'
```

→ Branch created: `DATA_SCIENCE_ALICE_CHEN_AI_Fix`

### Example 2: JavaScript Jest repo

```bash
curl -X POST http://localhost:4000/run-agent-sync \
  -H "Content-Type: application/json" \
  -d '{
    "repoUrl": "https://github.com/example/js-todo-app",
    "teamName": "Frontend Team",
    "leaderName": "Bob Lee"
  }'
```

→ Branch created: `FRONTEND_TEAM_BOB_LEE_AI_Fix`

---

## 📋 Supported Test Runners

| Runner | Language | Detection |
|---|---|---|
| Jest | JavaScript/TypeScript | `package.json` devDependencies |
| Vitest | JavaScript/TypeScript | `package.json` devDependencies |
| Mocha | JavaScript/TypeScript | `package.json` devDependencies |
| npm test | Any | `scripts.test` in `package.json` |
| pytest | Python | `requirements.txt` / `setup.py` / `pyproject.toml` |

---

## 🦺 Constraints

- ✅ No human intervention in fix loop
- ✅ No hardcoded repo paths — all dynamic via input
- ✅ Never pushes to `main` or `master`
- ✅ All commits prefixed with `[AI-AGENT]`
- ✅ `results.json` generated in cloned repo root
- ✅ Branch naming strictly enforced
- ✅ Retry limit: 5 iterations max

---

## 📄 License

MIT — free to use and extend.
"# CiCd_HealingAgent" 
