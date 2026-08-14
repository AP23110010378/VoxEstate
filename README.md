# 🎙️ VoxEstate — Multi-Tenant Agentic Voice Orchestrator

> An AI-powered SaaS platform that automates real estate lead qualification using conversational voice agents, LangGraph orchestration, and real-time CRM updates.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![LangGraph](https://img.shields.io/badge/LangGraph-Agentic-FF6B6B?style=for-the-badge)](https://www.langchain.com/langgraph)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/atlas)

---

## ✨ What is VoxEstate?

VoxEstate is a **multi-tenant voice AI platform** built for real estate agencies. Instead of having human agents spend hours cold-calling leads, VoxEstate deploys an autonomous AI caller that:

1. **Dials leads automatically** via Vapi.ai's conversational voice AI
2. **Holds a natural phone conversation** using a custom prompt per agency
3. **Evaluates the transcript** with an OpenAI LLM to classify leads
4. **Updates the CRM dashboard in real-time** — leads flip from `PENDING` → `QUALIFIED` or `NOT_INTERESTED`

Built as a full-stack, production-ready system with Docker, async Python, and a polished React UI.

---

## ⚡ Key Features

| Feature | Description |
|---|---|
| 🏢 **Multi-Tenant** | Each agency gets its own AI persona, prompt, and lead pipeline |
| 🤖 **Agentic Pipeline** | LangGraph state graph orchestrates dispatch → evaluation → DB update |
| 📞 **Voice AI Calling** | Vapi.ai triggers real outbound phone calls with sub-second latency |
| 🧠 **LLM Evaluation** | GPT-4o-mini classifies transcripts as `QUALIFIED` / `NOT_INTERESTED` / `FAILED` |
| ⚡ **Real-Time Webhooks** | Post-call evaluation runs asynchronously via webhook handlers |
| 📊 **Live Dashboard** | React frontend polls every 5s for status updates — no page refresh needed |
| 🐳 **Docker Ready** | Multi-stage Dockerfile for production GCP Cloud Run deployment |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        VoxEstate System                         │
│                                                                 │
│  React Dashboard                                                │
│       │                                                         │
│       ▼                                                         │
│  FastAPI Backend ──► LangGraph Agent                            │
│       │                    │                                    │
│       │            ┌───────┴────────┐                           │
│       │            ▼               ▼                            │
│       │      dispatch_node   evaluation_node                    │
│       │            │               │                            │
│       │            ▼               ▼                            │
│       │        Vapi.ai API    OpenAI GPT-4o          │
│       │        (Voice Call)   (Transcript LLM)       │
│       │                               │                         │
│       │                               ▼                         │
│       └───────────────────── state_update_node                  │
│                                       │                         │
│                                       ▼                         │
│                                  MongoDB Atlas                  │
└─────────────────────────────────────────────────────────────────┘
```

### LangGraph State Graph

The backend intelligence is orchestrated via a **LangGraph state machine**:

- **`dispatch_node`** — Fetches `PENDING` leads, injects company-specific prompt, triggers Vapi outbound call
- **`evaluation_node`** — Receives post-call transcript via webhook, uses GPT-4o-mini to classify outcome
- **`state_update_node`** — Persists `QUALIFIED` / `NOT_INTERESTED` / `FAILED` to MongoDB with a full call log

```
START → dispatch_node → [Vapi call happens] → webhook → evaluation_node → state_update_node → END
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | FastAPI (Python 3.11), LangGraph, Motor (async MongoDB driver) |
| **Frontend** | React 19 (Vite), TailwindCSS v4, Framer Motion, Lucide Icons |
| **Database** | MongoDB Atlas |
| **Voice AI** | Vapi.ai |
| **LLM** | OpenAI GPT-4o-mini |
| **Deployment** | Docker → GCP Cloud Run (backend) / Vercel (frontend) |

---

## ⚙️ Local Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- A MongoDB Atlas cluster (free tier works)
- A Vapi.ai account (for live calling)
- An OpenAI API key

### 1. Clone & Configure Environment

```bash
git clone https://github.com/YOUR_USERNAME/propvoice.git
cd propvoice
```

Copy the example env file and fill in your credentials:

```bash
cp .env.example backend/.env
```

```ini
# backend/.env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/voiceagent
VAPI_API_KEY=your_vapi_key
VAPI_ASSISTANT_ID=your_assistant_id
VAPI_PHONE_NUMBER_ID=your_phone_number_id
OPENAI_API_KEY=your_openai_api_key
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
```

### 2. Backend Setup

```bash
cd backend

# Create & activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Seed the database with sample companies & leads
# ⚠️ Update phone numbers in seed.py with real numbers you can answer
python seed.py

# Start the server
uvicorn main:app --reload
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🧪 Testing the Flow

1. With both servers running, open `http://localhost:5173`
2. Select a company (e.g., **Sunrise Realty**)
3. Click **Launch Campaign** — the AI dials the first `PENDING` lead
4. Answer the call on your phone and have a conversation
5. After hanging up, watch the dashboard — the lead status updates automatically via webhook

---

## 🐳 Docker & GCP Cloud Run Deployment

The backend includes a production-ready, multi-stage `Dockerfile`:

```dockerfile
# Stage 1: Install dependencies
FROM python:3.11-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Stage 2: Production image
FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /install /usr/local
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Deploy to GCP Cloud Run

```bash
# Authenticate & set project
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Build and push image
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/propvoice-backend ./backend

# Deploy
gcloud run deploy propvoice-backend \
  --image gcr.io/YOUR_PROJECT_ID/propvoice-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars MONGODB_URI="...",VAPI_API_KEY="...",OPENAI_API_KEY="..."
```

### Deploy Frontend to Vercel

```bash
cd frontend
npm run build
# Push to GitHub and connect repo to Vercel
# Set VITE_API_URL=https://your-cloud-run-backend-url in Vercel environment variables
```

---

## 📁 Project Structure

```
propvoice/
├── backend/
│   ├── agent/
│   │   ├── graph.py          # LangGraph state machine definition
│   │   ├── nodes.py          # dispatch, evaluation, state_update nodes
│   │   └── state.py          # VoiceAgentState TypedDict
│   ├── models/
│   │   ├── company.py        # Company Pydantic model
│   │   ├── customer.py       # Customer/lead model
│   │   └── call_log.py       # Call log model
│   ├── routers/
│   │   ├── campaigns.py      # POST /campaign/start
│   │   ├── companies.py      # GET /companies
│   │   ├── customers.py      # GET /customers
│   │   └── webhooks.py       # POST /webhook/vapi (post-call)
│   ├── services/
│   │   ├── vapi_service.py   # Vapi.ai API integration
│   │   └── openai_service.py # OpenAI transcript evaluation
│   ├── config.py             # pydantic-settings env loader
│   ├── database.py           # Motor async MongoDB client
│   ├── main.py               # FastAPI app entry point
│   ├── seed.py               # DB seeder script
│   ├── Dockerfile            # Multi-stage production Docker image
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── api/client.js     # Axios API client
│       ├── components/       # StatsBar, LeadsTable, TenantSelector, etc.
│       └── pages/            # LandingPage, Dashboard
├── docker-compose.yml
├── .env.example
└── .gitignore
```

---

## 🔌 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/companies` | List all tenant companies |
| `GET` | `/customers?company_id=<id>` | Get leads for a company |
| `POST` | `/campaign/start` | Launch AI calling campaign |
| `POST` | `/webhook/vapi` | Vapi post-call webhook receiver |

---

## 📄 License

MIT License — feel free to fork, extend, and build on top of this.
