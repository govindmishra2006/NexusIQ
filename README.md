<div align="center">

<img src="https://img.shields.io/badge/NexusIQ-v0.1.0-6366f1?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMyAyLjA1djIuMDJjMy45NS40OSA3IDMuODUgNyA3LjkzIDAgMy4yMS0xLjgxIDYuMDItNC41MiA3LjVMMTMgMTcuOVYyM2w4LTQtNy4yNS0zLjYzQzE1LjYgMTMuOTkgMTcgMTEuMTQgMTcgOGMwLTQuNDItMy42LTgtOC04di4wNXptLTIgMEMzLjYuNDkgMCA0LjQyIDAgOGMwIDMuMTQgMS40MSA1Ljk5IDMuNzUgNy44N0w0IDl2OGw4IDR2LTUuMWwtMi40OC0xLjVDNy43MSAxMy40NCA2IDEwLjg4IDYgOGMwLTQuMDggMy4wNS03LjQ0IDctNy45NXoiLz48L3N2Zz4=" alt="NexusIQ" />

# ⚡ NexusIQ

### **An enterprise-grade, AI-powered e-commerce intelligence platform that acts as an autonomous fractional CTO for Shopify merchants.**

*Stop reading dashboards. Start receiving decisions.*

<br/>

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-4285F4?style=flat-square&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

<br/>

> NexusIQ ingests a raw Shopify Orders CSV, runs a proprietary mathematical anomaly engine, fuses the results with the merchant's private business goals, and delivers a structured executive brief — in under 30 seconds — that tells you exactly what broke, why, and what to do about it.

<br/>

</div>

---

## 📋 Table of Contents

- [The Problem](#-the-problem)
- [How It Works](#-how-it-works)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture Overview](#-architecture-overview)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Supabase Setup](#2-supabase-setup)
  - [3. Backend Setup](#3-backend-setup)
  - [4. Frontend Setup](#4-frontend-setup)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [Security Model](#-security-model)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 The Problem

Every Shopify merchant exports CSVs, pastes data into ChatGPT, and waits for an answer that has zero context about their business goals, their typical order patterns, or what "normal" even looks like for their store.

The result is generic advice from a system that doesn't know you — and another week of guessing.

**NexusIQ is the fix.** It doesn't describe your data. It interrogates it mathematically, contextualizes it against your private business objectives, and returns a boardroom-ready brief with a prioritized action plan.

---

## ⚙️ How It Works

NexusIQ's pipeline has five distinct, purpose-built layers:

```
┌─────────────────────────────────────────────────────────────────┐
│  1. THE VAULT          React + Supabase Auth (JWT)              │
│     User authenticates. Store DNA (goals, targets) is set.      │
├─────────────────────────────────────────────────────────────────┤
│  2. THE MATH ENGINE    FastAPI + Pandas                          │
│     CSV is ingested. IQR anomaly detection runs on revenue       │
│     and order data. Outlier SKUs are flagged with hard numbers.  │
├─────────────────────────────────────────────────────────────────┤
│  3. CONTEXTUAL AI BRIDGE  FastAPI Dependency Injection           │  ← Secret Sauce
│     JWT is verified. Service role fetches private Store DNA.     │
│     Math output + business goals are fused into a               │
│     Pydantic-validated, context-rich Gemini prompt.              │
├─────────────────────────────────────────────────────────────────┤
│  4. THE BRAIN          Google Gemini 2.5 Flash                   │
│     Receives strict JSON-schema instructions. Outputs a          │
│     structured executive brief: summary, root causes,            │
│     action plan — zero hallucination filler.                     │
├─────────────────────────────────────────────────────────────────┤
│  5. THE ARCHIVE        PostgreSQL JSONB + Zustand                │
│     Brief and chart data are stored permanently. Accessible      │
│     via a timeline UI for longitudinal business tracking.        │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✨ Key Features

### 🧮 The Math Engine — No Guesswork, Only Numbers
NexusIQ never feeds raw CSVs directly to an AI. The FastAPI backend first runs a **rigorous Pandas preprocessing pipeline**: it computes total revenue, order volume, average order value (AOV), and applies the **Interquartile Range (IQR) method** to mathematically isolate severe revenue anomalies and flag specific product SKUs as statistical outliers. The AI receives proven facts, not raw noise.

### 🔗 The Contextual AI Bridge — Your Business Goals, Fused Into Every Analysis
This is the architectural feature that separates NexusIQ from every generic "CSV + ChatGPT" workflow. When a brief is requested, a FastAPI **Dependency Injection** chain:
1. Verifies the user's Supabase JWT on every request
2. Uses the Supabase **service role key** to securely fetch the user's private `store_settings` (Target AOV, monthly revenue goals, store context) — bypassing Row Level Security by design, on the server side only
3. Fuses the mathematical anomaly output with the business context into a **Pydantic-validated prompt schema**

The result: Gemini doesn't analyze your data in a vacuum. It analyzes your data *against your stated business goals* — producing insights like *"Your AOV of $61 is 30% below your $87 target, driven by SKU #4892 accounting for 34% of volume at a below-average order size"* instead of generic observations.

### 🔒 Enterprise Security — JWT + Row Level Security
NexusIQ is built with a **zero-trust data architecture**:
- All API endpoints require a valid **Supabase JWT** — verified server-side via FastAPI Dependency Injection
- PostgreSQL **Row Level Security (RLS)** policies ensure users can only read and write their own `store_settings` and `brief_archives` rows — enforced at the database level, not just the application layer
- The service role key (which bypasses RLS) **never touches the frontend** — it lives exclusively in the backend `.env` and is used only for the secure server-side context fetch

### 📊 The Brief Archive — Longitudinal Business Intelligence
Every generated brief is stored in a PostgreSQL `JSONB` column alongside its Plotly chart data. A **Zustand-managed timeline UI** surfaces the full brief history, enabling merchants to track the evolution of their store's health across uploads and identify macro trends over time.

### ⚡ Sub-30-Second Intelligence Loop
From CSV upload to structured executive brief: anomaly detection, context injection, AI synthesis, and database persistence complete in a single request cycle — typically under 30 seconds.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | React 18 + Vite | Component architecture, fast HMR dev server |
| **Styling** | Tailwind CSS | Utility-first glassmorphism design system |
| **Animations** | Framer Motion | Micro-interactions, page transitions |
| **State Management** | Zustand | Lightweight global state for briefs and auth |
| **Charts** | Plotly.js | Interactive revenue and anomaly visualizations |
| **Backend Framework** | FastAPI (Python 3.10+) | Async API, Dependency Injection, auto OpenAPI docs |
| **Data Engine** | Pandas | CSV ingestion, IQR anomaly detection, stat computation |
| **Data Validation** | Pydantic v2 | Strict prompt schema validation, request/response models |
| **Database** | Supabase (PostgreSQL) | Persistent storage, JSONB brief archive |
| **Authentication** | Supabase Auth | JWT-based auth, session management |
| **Authorization** | PostgreSQL RLS | Row-level data isolation per user |
| **AI Model** | Google Gemini 2.5 Flash | Structured JSON executive brief generation |

---

## 🏗️ Architecture Overview

```
nexusiq/
├── frontend/                  # React + Vite application (The Vault)
│   └── src/
│       ├── components/        # UI components (DropZone, BriefCard, Timeline)
│       ├── store/             # Zustand state stores
│       ├── lib/               # Supabase client, API helpers
│       └── pages/             # Route-level page components
│
└── backend/                   # FastAPI application (The Math Engine)
    ├── main.py                # App entrypoint, router registration
    ├── routers/
    │   └── analysis.py        # /analyze endpoint — the core pipeline
    ├── services/
    │   ├── math_engine.py     # Pandas IQR anomaly detection logic
    │   ├── ai_bridge.py       # Gemini prompt construction + API call
    │   └── context_service.py # Supabase service role Store DNA fetch
    ├── models/
    │   └── schemas.py         # Pydantic models for requests/responses
    └── dependencies/
        └── auth.py            # FastAPI JWT verification dependency
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed and accounts created before proceeding:

- **Node.js** `v18+` and **npm** `v9+`
- **Python** `3.10+` and **pip**
- A **[Supabase](https://supabase.com/)** account (free tier is sufficient)
- A **[Google AI Studio](https://aistudio.google.com/)** account for a Gemini API key

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/nexusiq.git
cd nexusiq
```

---

### 2. Supabase Setup

#### 2a. Create a New Supabase Project
Navigate to [supabase.com](https://supabase.com/), create a new project, and wait for it to provision.

#### 2b. Run the Database Schema

In your Supabase project, open the **SQL Editor** and execute the following script to create the required tables and security policies.

```sql
-- ============================================================
-- NexusIQ Database Schema
-- Run this entire script in the Supabase SQL Editor
-- ============================================================


-- ------------------------------------------------------------
-- TABLE 1: store_settings
-- Stores each user's private "Store DNA" (business goals)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.store_settings (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    store_name  TEXT,
    target_aov  NUMERIC(10, 2),          -- Target Average Order Value ($)
    revenue_goal NUMERIC(12, 2),         -- Monthly revenue goal ($)
    store_context TEXT,                  -- Free-text business context for the AI
    created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Auto-update the updated_at timestamp on row modification
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_store_settings_updated_at
    BEFORE UPDATE ON public.store_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS: Enable and lock down store_settings
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own store settings"
    ON public.store_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own store settings"
    ON public.store_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own store settings"
    ON public.store_settings FOR UPDATE
    USING (auth.uid() = user_id);


-- ------------------------------------------------------------
-- TABLE 2: brief_archives
-- Stores all generated AI briefs and chart data as JSONB
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.brief_archives (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    source_filename TEXT NOT NULL,                -- Original CSV filename
    brief_json      JSONB NOT NULL,               -- Full Gemini brief output
    chart_data      JSONB,                        -- Plotly chart config/data
    metrics_snapshot JSONB,                       -- Key stats at time of generation
    created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for fast per-user timeline queries
CREATE INDEX idx_brief_archives_user_id_created_at
    ON public.brief_archives (user_id, created_at DESC);

-- RLS: Enable and lock down brief_archives
ALTER TABLE public.brief_archives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own briefs"
    ON public.brief_archives FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own briefs"
    ON public.brief_archives FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Note: Briefs are immutable by design — no UPDATE or DELETE policies.
-- Archive integrity is a core product guarantee.
```

#### 2c. Retrieve Your Supabase Credentials

From your Supabase project dashboard, navigate to **Settings → API** and collect:
- **Project URL** → `SUPABASE_URL`
- **`anon` / public key** → `VITE_SUPABASE_ANON_KEY` (frontend)
- **`service_role` / secret key** → `SUPABASE_SERVICE_KEY` (backend only — treat as a password)

> ⚠️ **Security Warning:** The `service_role` key bypasses all Row Level Security policies. It must **never** be exposed to the frontend or committed to version control. It belongs exclusively in your backend `.env` file.

---

### 3. Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Create and activate a Python virtual environment
python -m venv venv

# On macOS/Linux:
source venv/bin/activate

# On Windows:
.\venv\Scripts\activate

# Install all dependencies
pip install -r requirements.txt
```

#### 3a. Configure Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
cp .env.example .env
```

Open `.env` and populate every variable:

```env
# ── Supabase ──────────────────────────────────────────────────
# Your Supabase project URL (from Settings → API)
SUPABASE_URL="https://your-project-ref.supabase.co"

# Service role key — NEVER expose this to the frontend
# Used server-side to securely fetch user Store DNA (bypasses RLS)
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Anon key — also used by backend for JWT verification
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# ── Google Gemini ──────────────────────────────────────────────
# API key from https://aistudio.google.com/app/apikey
GEMINI_API_KEY="AIzaSy..."

# ── App Config ────────────────────────────────────────────────
# Allowed origins for CORS (your frontend dev URL)
ALLOWED_ORIGINS="http://localhost:5173"
```

#### 3b. Start the Backend Server

```bash
# From the backend/ directory, with venv activated
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.
Interactive API documentation (auto-generated by FastAPI) is available at `http://localhost:8000/docs`.

---

### 4. Frontend Setup

```bash
# Navigate to the frontend directory (from repo root)
cd frontend

# Install dependencies
npm install
```

#### 4a. Configure Frontend Environment Variables

```bash
cp .env.example .env.local
```

Open `.env.local` and populate:

```env
# ── Supabase (Public Keys Only) ───────────────────────────────
# Your Supabase project URL
VITE_SUPABASE_URL="https://your-project-ref.supabase.co"

# Anon / public key ONLY — the service role key must NEVER appear here
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# ── Backend API ───────────────────────────────────────────────
VITE_API_BASE_URL="http://localhost:8000"
```

#### 4b. Start the Frontend Dev Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## 🖥️ Usage

Once both servers are running:

1. **Create an Account** — Navigate to `http://localhost:5173` and sign up. Supabase handles authentication.

2. **Set Your Store DNA** — Before your first analysis, open the **Settings** panel and configure your business context:
   - `Store Name`
   - `Target Average Order Value (AOV)` — e.g., `$87.00`
   - `Monthly Revenue Goal` — e.g., `$55,000`
   - `Store Context` — free-text description of your business model, top products, and anything the AI should know

3. **Export Your Shopify CSV** — In your Shopify Admin, go to **Orders → Export → All time → Export Orders (CSV)**

4. **Upload & Analyze** — Drag and drop (or click to select) your orders CSV into the drop zone on the main dashboard

5. **Receive Your Brief** — Within ~30 seconds, NexusIQ will render your executive brief, containing:
   - **Executive Summary** — A plain-English synthesis of your store's performance
   - **Detected Anomalies** — Specific dates, SKUs, and revenue deviations flagged by the IQR engine
   - **Root Cause Analysis** — AI-reasoned explanations grounded in your actual data
   - **Action Plan** — A prioritized, specific list of actions tied to your business goals

6. **Review Your Archive** — Access all previous briefs via the **Timeline** panel — your full business intelligence history, stored permanently

---

## 📁 Project Structure

```
nexusiq/
│
├── frontend/                        # ⚛️  React 18 + Vite Application
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/                # Login, SignUp, ProtectedRoute
│   │   │   ├── dashboard/           # DropZone, BriefDisplay, MetricsGrid
│   │   │   ├── archive/             # Timeline, BriefCard, BriefModal
│   │   │   ├── settings/            # StoreDNAForm
│   │   │   └── ui/                  # Shared design system components
│   │   ├── store/
│   │   │   ├── authStore.js         # Zustand: Supabase session state
│   │   │   └── briefStore.js        # Zustand: current brief + archive
│   │   ├── lib/
│   │   │   ├── supabaseClient.js    # Supabase client initialization
│   │   │   └── api.js               # Axios instance + API call helpers
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx        # Main analysis interface
│   │   │   ├── Archive.jsx          # Brief history timeline
│   │   │   └── Settings.jsx         # Store DNA configuration
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── backend/                         # 🐍  Python FastAPI Application
│   ├── main.py                      # App factory, CORS, router registration
│   ├── routers/
│   │   └── analysis.py              # POST /analyze — core pipeline endpoint
│   ├── services/
│   │   ├── math_engine.py           # Pandas CSV processing + IQR detection
│   │   ├── ai_bridge.py             # Gemini prompt assembly + API call
│   │   └── context_service.py       # Service-role Store DNA fetcher
│   ├── models/
│   │   └── schemas.py               # Pydantic request/response models
│   ├── dependencies/
│   │   └── auth.py                  # JWT verification FastAPI dependency
│   ├── requirements.txt
│   └── .env.example
│
└── README.md
```

---

## 🔐 Security Model

NexusIQ's security architecture follows a **defense-in-depth** approach with enforcement at every layer of the stack.

```
CLIENT REQUEST
     │
     ▼
┌─────────────────────────────────────────────────────┐
│  LAYER 1: Frontend (React)                           │
│  • Supabase Auth manages session tokens              │
│  • JWT attached to every API request header          │
│  • Only the anon key is present — no secrets         │
└────────────────────────┬────────────────────────────┘
                         │  Authorization: Bearer <JWT>
                         ▼
┌─────────────────────────────────────────────────────┐
│  LAYER 2: FastAPI Backend                            │
│  • Dependency Injection verifies JWT on every route  │
│  • Extracts user_id from verified token payload      │
│  • Rejects all requests with invalid/expired tokens  │
└────────────────────────┬────────────────────────────┘
                         │  Verified user_id
                         ▼
┌─────────────────────────────────────────────────────┐
│  LAYER 3: Supabase Service Role (Server-Side Only)   │
│  • Service key lives in backend .env exclusively     │
│  • Used only to fetch the requesting user's own data │
│  • Never returned to client; never logged            │
└────────────────────────┬────────────────────────────┘
                         │  Scoped query: WHERE user_id = $1
                         ▼
┌─────────────────────────────────────────────────────┐
│  LAYER 4: PostgreSQL Row Level Security              │
│  • RLS policies enforced at the database engine      │
│  • Frontend direct queries: users read own rows only │
│  • No application-layer bug can expose another       │
│    user's data — the database itself prevents it     │
└─────────────────────────────────────────────────────┘
```

| Threat | Mitigation |
|---|---|
| Unauthenticated API access | FastAPI Dependency Injection rejects requests without valid JWT |
| Cross-user data access (frontend) | RLS policies enforced at PostgreSQL — application-layer bypass is structurally impossible |
| Service key exposure | Key never leaves the backend `.env`; CORS restricts frontend origin |
| Prompt injection via CSV | Pydantic validates and sanitizes all data before Gemini receives it |
| Sensitive key in version control | `.env` and `.env.local` are in `.gitignore`; `.env.example` contains only placeholders |

---

## 🗺️ Roadmap

NexusIQ is actively evolving toward a full enterprise analytics platform. See [`ROADMAP.md`](ROADMAP.md) for the complete version-by-version plan.

| Version | Theme | Status |
|---|---|---|
| `v0.1` — MVP | 30-Second CEO Brief | ✅ **Shipped** |
| `v0.2` — Stickiness | Business Memory, Upload Archive, PDF Export | 🔨 In Progress |
| `v1.0` — Intelligence | Shopify OAuth, Revenue Forecast, SKU Heatmap | 📋 Planned |
| `v2.0` — Autonomous | Slack Alerts, Multi-Store, NexusIQ Health Score | 📋 Planned |
| `v3.0` — Enterprise | Proprietary ML Engine, Local LLM, Privacy-First Deployment | 🔬 Research |

---

## 🤝 Contributing

Contributions are welcome. To maintain code quality and architectural consistency, please follow the contribution workflow below.

```bash
# 1. Fork the repository and clone your fork
git clone https://github.com/your-username/nexusiq.git

# 2. Create a feature branch
git checkout -b feature/your-feature-name

# 3. Make your changes, following existing code style

# 4. Commit with a conventional commit message
git commit -m "feat: add weekly digest email generation"

# 5. Push to your fork and open a Pull Request
git push origin feature/your-feature-name
```

**Before opening a PR:**
- Ensure the backend starts cleanly with `uvicorn main:app --reload`
- Ensure the frontend builds without errors with `npm run build`
- Add or update docstrings for any new FastAPI routes or service functions
- Update `ROADMAP.md` if your contribution closes a planned feature

---

## 📄 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for full terms.

---

<div align="center">

**Built with precision. Designed for scale.**

*NexusIQ — Because your store deserves a strategist, not a spreadsheet.*

<br/>

[![GitHub Stars](https://img.shields.io/github/stars/your-username/nexusiq?style=social)](https://github.com/your-username/nexusiq)

</div>
