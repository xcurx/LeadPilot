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

## Features

### Lead Intake
- Form-based lead capture with name, location, property requirement, budget, timeline, and customer message
- Client-side validation before submission

### AI Analysis
Every lead receives an AI-generated analysis containing:
- **Lead Summary** — concise overview of the lead
- **Customer Intent** — what the customer is trying to achieve
- **Key Requirements** — extracted from the inquiry
- **Concerns / Objections** — potential blockers
- **Recommended Action** — what the salesperson should do next
- **Suggested Response** — a professional response ready to send

### Priority Scoring
AI extracts semantic signals (intent, urgency, budget clarity, requirement clarity), and the application calculates a deterministic priority score:

```
Score = Intent × 0.35 + Urgency × 0.30 + Budget Clarity × 0.15 + Requirement Clarity × 0.20
```

Mapping: `≥80 → HOT`, `≥50 → WARM`, `<50 → COLD`

### AI Copilot
Contextual chat grounded in the selected lead's data and analysis. Supports questions like:
- "What should I emphasize on the call?"
- "Make the suggested response more assertive."
- "What concerns does this customer have?"

### Follow-up Tracker
- Status management (NEW → CONTACTED → QUALIFIED → SITE_VISIT → NEGOTIATION → CLOSED)
- Follow-up date/time scheduling
- Follow-up notes
- Mark as contacted

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
│  AI Service Layer    │
│  Prompt Construction │
│  Zod Validation      │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│     NVIDIA NIM       │
│       LLM            │
└──────────────────────┘
```

## AI Model & API

- **Provider**: NVIDIA NIM
- **Model**: Configurable via `NVIDIA_MODEL` env var (default: `meta/llama-3.1-8b-instruct`)
- **Architecture**: The AI provider is abstracted behind an `AIProvider` interface, allowing future provider swaps without UI changes

### How AI Calls Work

1. **Analysis** (`POST /api/analyze`): Server constructs a structured prompt with lead data, sends to NVIDIA NIM, validates the JSON response with Zod, then calculates priority score deterministically in application code
2. **Chat** (`POST /api/chat`): Server builds a context containing lead info + analysis + conversation history, sends to NVIDIA NIM with a system prompt that constrains responses to the selected lead

## Data Persistence

- **Engine**: IndexedDB via Dexie.js
- **Tables**: `leads`, `conversations`
- **Seed Data**: 4 realistic demo leads are inserted on first load when the database is empty

No server-side database is needed. All data persists in the browser.

## Priority Scoring

Scoring logic is isolated in `lib/scoring.ts`:

| Signal | Weight |
|--------|--------|
| Intent | 0.35 |
| Urgency | 0.30 |
| Budget Clarity | 0.15 |
| Requirement Clarity | 0.20 |

Signal levels: `high → 100`, `medium → 60`, `low → 20`

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
| `NVIDIA_MODEL` | Model to use (default: `meta/llama-3.1-8b-instruct`) | No |

Get an API key at [build.nvidia.com](https://build.nvidia.com).

## Deployment

Deploy to Vercel:

1. Push to GitHub
2. Import in Vercel
3. Add `NVIDIA_API_KEY` and `NVIDIA_MODEL` as environment variables
4. Deploy

## Key Technical Decisions

1. **IndexedDB over PostgreSQL** — Sufficient for the assignment scope; no server-side DB management needed
2. **Deterministic scoring** — AI extracts signals, app calculates score. Not "give me a score 1-100"
3. **AI provider abstraction** — `AIProvider` interface allows future provider swaps
4. **Zod validation** — Never blindly trust model output; validate before entering app state
5. **Server-side AI calls** — API key stays on the server; browser never sees it
6. **Seed data** — Evaluators see a useful dashboard immediately, not an empty state

## Known Limitations

- No authentication (by design — unnecessary for this prototype)
- Data is browser-local (IndexedDB); no cross-device sync
- Chat does not stream responses (kept simple to avoid unnecessary complexity)
- No real-time updates across tabs

## AI Usage Disclosure

This project uses AI (NVIDIA NIM) for:
- Lead analysis and semantic understanding
- Intent, urgency, and requirement extraction
- Concern detection and recommendation generation
- Contextual conversational assistance

The application handles persistence, priority calculation, sorting, filtering, status management, and follow-up tracking — these are NOT delegated to the AI.
