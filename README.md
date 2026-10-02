# LeadPilot AI

> AI-powered lead management workspace for real estate sales professionals.

LeadPilot AI helps real estate salespeople capture inbound leads, understand them using AI, automatically prioritize them, ask contextual follow-up questions, generate suggested customer responses, and track what should happen next.

## Problem Statement

Real estate salespeople handle multiple inbound leads daily, each requiring different levels of attention. Without a system:

- High-intent leads get the same treatment as cold inquiries
- Salespeople waste time manually analyzing each lead
- Follow-up actions fall through the cracks
- Response quality is inconsistent

LeadPilot AI solves this by bringing AI-powered analysis directly into the sales workflow.

## Features (Core Requirements)

### 1. Lead Intake
- Form-based lead capture with Name, Location, Property requirement, Budget, Timeline, and a free-text Customer message.
- Uses structured dropdowns for requirements/budget/timeline to ensure cleaner data collection while satisfying the assignment parameters.

### 2. AI Analysis
Every lead receives an AI-generated analysis containing:
- **Lead Summary** — concise overview of the lead
- **Customer Intent** — what the customer is trying to achieve
- **Key Requirements** — extracted from the inquiry
- **Concerns / Objections** — potential blockers
- **Recommended Action** — what the salesperson should do next
- **Suggested Response** — a professional response ready to send

### 3. AI Copilot (Conversational Interface)
Contextual chat grounded in the selected lead's data and analysis. Supports questions like:
- "What should I emphasize on the call?"
- "Make the suggested response more assertive."
- "What concerns does this customer have?"

### 4. Lead List & Prioritization
AI extracts semantic signals (intent, urgency, budget clarity, requirement clarity), and the application calculates a deterministic priority score:

```
Score = Intent × 0.35 + Urgency × 0.30 + Budget Clarity × 0.15 + Requirement Clarity × 0.20
```

Mapping: `≥80 → HOT`, `≥50 → WARM`, `<50 → COLD`

### 5. Clear Display
- A premium, scannable "Masal AI" themed UI built with Tailwind CSS, Lucide icons, and modern glassmorphism aesthetic principles.

---

## 🚀 "Your Own Feature" (Extra Additions)

To genuinely help a salesperson before, during, and after a call, multiple extra features were added:

1. **Pipeline Analytics Dashboard (Before the call):** 
   - A high-level overview screen showing total leads, hot pipeline size, and pending follow-ups. Allows a salesperson to instantly know where to start their day.
2. **Follow-Up Timeline Tracker (After the call):** 
   - Salespeople can schedule Follow-ups (Calls, Meetings, Site Visits), add notes, and mark them as complete. This turns the app into a true CRM.
3. **Editable AI Responses (During the call):** 
   - The AI-generated suggested response can be edited directly on the screen and copied to the clipboard with one click for easy pasting into WhatsApp or Email.
4. **Global Pipeline Search:** 
   - A search bar in the sidebar that instantly filters leads by name, location, requirements, or keywords within the customer message.

---

## Architecture

```
┌──────────────────────┐
│       Browser        │
│   Next.js / React    │
│   Dashboard          │
│   Lead Form          │
│   AI Copilot         │
│   Follow-up Tracker  │
└──────────┬───────────┘
           │
     IndexedDB via Dexie
           │
     API requests to server
           │
           ▼
┌──────────────────────┐
│    Next.js Server    │
│  /api/analyze        │
│  /api/chat           │
│  Prompt Construction │
│  Zod Validation      │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│     NVIDIA NIM       │
│  Llama-3.1-70b-instruct│
└──────────────────────┘
```

## AI Model & API

- **Provider**: NVIDIA NIM
- **Model**: `meta/llama-3.1-70b-instruct` (Configurable via `NVIDIA_MODEL` env var)
- **Why 70B?**: The 70B instruction-tuned model is used because extracting strict JSON schemas and maintaining conversational context requires high instruction-following capabilities.

### How AI Calls Work

1. **Analysis** (`POST /api/analyze`): Server constructs a structured prompt with lead data, sends to NVIDIA NIM, validates the JSON response with Zod, then calculates the priority score deterministically in application code.
2. **Chat** (`POST /api/chat`): Server builds a context containing lead info + analysis + conversation history, sends to NVIDIA NIM with a system prompt that constrains responses to the selected lead.

## Data Persistence

- **Engine**: IndexedDB via Dexie.js
- **Seed Data**: 4 realistic demo leads (with scheduled follow-ups) are inserted on first load when the database is empty.
- **Why IndexedDB?**: Allows evaluators to test the application immediately upon opening the URL without needing to set up or configure a backend database like PostgreSQL.

## Local Setup

```bash
# Clone
git clone <repo-url>
cd leadpilot-ai

# Install
npm install

# Environment
cp .env.example .env.local
# Add your NVIDIA API key to .env.local

# Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NVIDIA_API_KEY` | Your NVIDIA NIM API key | Yes |
| `NVIDIA_MODEL` | Model to use (default: `meta/llama-3.1-70b-instruct`) | No |

Get an API key at [build.nvidia.com](https://build.nvidia.com).

## Key Technical Decisions

1. **IndexedDB over PostgreSQL** — Sufficient for the assignment scope; eliminates backend setup for reviewers.
2. **Deterministic scoring** — AI extracts categorical signals (high/medium/low), but the application calculates the final score mathematically. This prevents AI hallucination on arbitrary numbers.
3. **Zod validation** — Never blindly trust model output; the server validates the JSON schema before passing it to the client.
4. **Server-side AI calls** — The API key stays securely on the server; the browser never sees it.
5. **Seed data** — Evaluators see a useful, populated dashboard immediately, rather than a blank empty state.
6. **Single Page Application (SPA)** — The entire dashboard lives on a single route to preserve state and ensure instant, frictionless navigation between leads without page reloads.

## Known Limitations

- No authentication (by design — unnecessary for this prototype).
- Data is browser-local (IndexedDB); there is no cross-device sync.
- Chat does not stream responses (kept simple to avoid unnecessary complexity in standard Fetch API).

## AI Usage Disclosure

- **NVIDIA NIM (nemotron-3-super-120b-a12b)**: Used as the core product feature to analyze leads, extract metadata, and power the Copilot chat.
- **Google Antigravity / Gemini**: Used as a developer coding assistant to rapidly prototype the Next.js component architecture, write the Tailwind CSS styling, and debug React state management.
