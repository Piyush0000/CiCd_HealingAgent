# 🦅 CI/CD Healing Agent (Code Falcons)

> **Autonomous DevOps Agent for the RIFT 2026 Hackathon**  
> _Detects, Analyzes, and Fixes Code Failures Automously using Multi-Agent AI Architecture._

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-Live-green.svg)
![Score](https://img.shields.io/badge/score-110%2F100-brightgreen.svg)

## 🚀 Live Demo & Links
- **Live Dashboard:** [YOUR_VERCEL_DEPLOYMENT_URL_HERE]
- **Demo Video:** [YOUR_LINKEDIN_VIDEO_URL_HERE]
- **GitHub Repository:** [https://github.com/Start-Up-Inches/cicd-healing-agent](https://github.com/Start-Up-Inches/cicd-healing-agent)

---

## 🧠 Architecture Overview

Our system utilizes a **Modular Multi-Agent Architecture** orchestrated by a central controller. Each agent specializes in a specific domain of the CI/CD pipeline, allowing for robust error handling and intelligent decision-making.

### 🤖 The Agent Squad
1.  **🎩 Orchestrator Agent**: Manages the entire healing lifecycle. Coordinates the flow between cloning, testing, analyzing, and fixing.
2.  **📚 Repository Agent**: Handles Git operations (Clone, Branch, Commit, Push). Safely manages the file system and ensures no direct changes to `main`.
3.  **🧪 Test Execution Agent**: 
    *   **Auto-Detection**: Identifies project type (Node.js/Python) and test runner (Jest/Mocha/Pytest).
    *   **Smart Parsing**: Uses **Gemini 2.0 Flash** to parse complex logs when regex fails (e.g., extracting file paths from stack traces).
    *   **Recursive Search**: Finds tests even in subdirectories (monorepo support).
4.  **🧐 Analyzer Agent**: Classifies raw failures into specific bug types: `LINTING`, `SYNTAX`, `LOGIC`, `TYPE_ERROR`, `IMPORT`, `INDENTATION`.
5.  **🔧 Fix Agent**: 
    *   **Strategy Engine**: Selects the best fix strategy based on bug type.
    *   **AI Surgeon**: Uses GenAI (Gemini 2.0) to generate precise code fixes for logic errors and complex bugs.
    *   **Self-Correction**: Verifies fixes by re-running tests.

---

## 🛠️ Technology Stack

### Frontend (Dashboard) :computer:
*   **React.js (Vite)**: Fast, modern UI framework.
*   **Tailwind CSS**: Responsive, beautiful styling.
*   **Socket.io Client**: Real-time event streaming from the agent.
*   **Lucide React**: Icons and visual indicators.

### Backend (The Brain) :brain:
*   **Node.js & Express**: High-performance runtime.
*   **OpenRouter (Gemini 2.0 Flash)**: LLM for intelligent log parsing and code generation.
*   **Simple-Git**: For programmatic Git operations.
*   **Docker**: Containerized execution environment (Optional).

---

## ⚡ Key Features

*   **Autonomous Healing**: Runs tests, finds bugs, applies fixes, and pushes code without human intervention.
*   **Smart Log Parsing**: If regex fails, AI steps in to read the logs like a human.
*   **Branch Safety**: Creates a dedicated branch (`TEAM_NAME_LEADER_AI_Fix`) for safety.
*   **Real-Time Dashboard**: Watch the agent work live with a streaming terminal and progress timeline.
*   **Configurable**: Supports standard `npm test` and `pytest` workflows.

---

## 🔧 Installation & Setup

### Prerequisites
*   Node.js v18+
*   Git
*   OpenRouter API Key (for AI features)

### 1. Clone the Repository
```bash
git clone https://github.com/Start-Up-Inches/cicd-healing-agent.git
cd cicd-healing-agent
```

### 2. Backend Setup
```bash
cd backend
npm install
# Create .env file
cp .env.example .env
```
**Configure `.env`:**
```env
PORT=4000
FRONTEND_URL=http://localhost:3000
OPENROUTER_API_KEY=sk-or-v1-your-key-here
GITHUB_TOKEN=your_github_token  # Optional: For pushing to remote
```
**Start Backend:**
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```
**Start Dashboard:**
```bash
npm run dev
```
Access the dashboard at `http://localhost:3000`.

---

## 🧪 Supported Bug Types

Our agent can automatically detect and fix:

| Bug Type | Description | Fix Strategy |
| :--- | :--- | :--- |
| **LINTING** | ESLint/Flake8 style issues | Auto-formatting / Removal |
| **SYNTAX** | Missing colons, brackets, etc. | Regex / AI Patch |
| **LOGIC** | Incorrect math, wrong variable | **GenAI Logic Repair** |
| **TYPE_ERROR** | Undefined functions, wrong types | AI Analysis |
| **IMPORT** | Missing module, wrong path | dependency check / path fix |
| **INDENTATION**| Python indentation errors | Auto-indentation fix |

---

## 🎥 Usage Example

1.  Enter a GitHub Repository URL in the Dashboard.
2.  Enter Team Name (**CODE FALCONS**) and Leader Name (**DANI DANIELS**).
3.  Click **"Run Agent"**.
4.  Watch the agent:
    *   Clone the repo.
    *   Run tests (Fail ❌).
    *   Analyze logs (AI Parse 🧠).
    *   Apply fix (AI Patch 🔧).
    *   Run tests again (Pass ✅).
    *   Push to GitHub (`BOTZILLA_ANSH_GUPTA_AI_Fix`).

---

## 👥 Team Members

*   **Team Name**: CODE FALCONS
*   **Team Leader**: Dani Daniels
*   **Members**: [Your Name], [Member 2], [Member 3]

---

Made with ❤️ for **RIFT 2026**.
