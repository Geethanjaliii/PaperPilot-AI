
# PaperPilot AI – AI-Powered Research Operating System

<p align="center">
  <b>Discover • Analyze • Compare • Synthesize • Cite Research Papers using AI</b>
</p>

<p align="center">
  An enterprise-grade AI research platform for literature discovery, paper comparison, synthesis, conversational querying, and citation generation using FastAPI, Gemini AI, LangGraph, RAG, and Next.js.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.11-blue?style=for-the-badge&logo=python"/>
  <img src="https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi"/>
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js"/>
  <img src="https://img.shields.io/badge/Gemini-AI-orange?style=for-the-badge&logo=google"/>
  <img src="https://img.shields.io/badge/LangGraph-Agentic_AI-purple?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge"/>
</p>

---

# 🚀 Overview

PaperPilot AI is an AI-powered Research Operating System designed to help researchers, students, engineers, and knowledge workers accelerate academic research workflows.

The platform combines:

- Literature discovery from multiple academic sources
- AI-generated literature reviews
- Methodology comparison between papers
- Conversational research assistant
- Citation generation
- Bookmark collections and research organization
- AI-powered synthesis and reasoning workflows

Instead of manually reading dozens of papers, PaperPilot AI acts as an intelligent research co-pilot that assists throughout the entire research lifecycle.

---

# ✨ Features

## 🔍 Multi-Source Paper Search
- Search papers using keywords, authors, or topics
- Integrates with:
  - arXiv
  - Semantic Scholar
- Intelligent paper retrieval and ranking
- Metadata extraction and persistence

---

## 📚 AI Literature Review Generator
Generate comprehensive literature reviews automatically.

Features:

- Introduction generation
- Methodology comparison
- Findings synthesis
- Research gaps identification
- Future directions
- Citation-aware summarization

---

## ⚖️ Paper Comparison Engine
Compare papers side-by-side across:

- Architecture
- Methodology
- Training Objectives
- Datasets
- Metrics
- Strengths
- Limitations
- Use Cases

---

## 💬 Ask Papers (Research Chat)
Perplexity-style conversational research assistant.

Features:

- Conversational querying
- Inline citations
- Source grounding
- Follow-up questions
- Deep research mode
- Context-aware responses

---

## 📝 Citation Generator
Generate citations in multiple formats:

- APA 7th Edition
- IEEE
- BibTeX

Features:

- Copy individual citations
- Export all citations
- Citation history tracking

---

## 📁 Research Collections
Organize papers using:

- Bookmark collections
- Folders
- Tags
- Search filters
- Research workspaces

---

## 📊 Analytics Dashboard
Monitor research activity through:

- Papers indexed
- Reviews generated
- Saved collections
- Search history
- Recent activities

---

## 📱 Responsive Research Workspace
Fully responsive:

- Desktop
- Tablet
- Mobile

Modern dark-mode research interface inspired by:

- Perplexity
- Linear
- Notion
- Vercel Dashboard

---

# 🏗️ System Architecture

## Architecture Flow

```text
                   ┌──────────────────────┐
                   │      Next.js 15      │
                   │    Research Frontend │
                   └──────────┬───────────┘
                              │
                              │ Axios API Client
                              ▼
                 ┌──────────────────────────┐
                 │      FastAPI Backend     │
                 │      REST Endpoints      │
                 └──────────┬───────────────┘
                            │
       ┌────────────────────┼──────────────────┐
       │                    │                  │
       ▼                    ▼                  ▼
  Gemini AI            SQLite DB          ChromaDB
       │                    │                  │
       └────────────────────┼──────────────────┘
                            │
                            ▼
             arXiv + Semantic Scholar APIs
```

---

# 📸 Application Screenshots

## Dashboard

<p align="center">
  <img src="./screenshots/dashboard.png" width="1000"/>
</p>

---

## Search Papers

<p align="center">
  <img src="./screenshots/search.png" width="1000"/>
</p>

---

## Literature Review

<p align="center">
  <img src="./screenshots/literature-review.png" width="1000"/>
</p>

---

## Compare Papers

<p align="center">
  <img src="./screenshots/compare.png" width="1000"/>
</p>

---

## Ask Papers

<p align="center">
  <img src="./screenshots/ask-papers.png" width="1000"/>
</p>

---

## Citations

<p align="center">
  <img src="./screenshots/citations.png" width="1000"/>
</p>

---

## Saved Papers

<p align="center">
  <img src="./screenshots/saved-papers.png" width="1000"/>
</p>

---

## Pricing

<p align="center">
  <img src="./screenshots/pricing.png" width="1000"/>
</p>

---

## History

<p align="center">
  <img src="./screenshots/history.png" width="1000"/>
</p>

---

# 🛠 Tech Stack

## Frontend

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Zustand
- React Query
- Axios
- Lucide React
- shadcn/ui

---

## Backend

- FastAPI
- Python 3.11
- SQLAlchemy
- SQLite
- ChromaDB
- LangGraph
- Pydantic
- HTTPX

---

## AI & Research Services

- Gemini AI
- RAG Architecture
- Sentence Transformers
- arXiv API
- Semantic Scholar API

---

# 📂 Project Structure

```text
PaperPilot-AI
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── agents/
│   │   └── utils/
│   └── tests/
│
├── frontend/
│   └── src/
│       ├── app/
│       ├── components/
│       ├── hooks/
│       ├── store/
│       ├── lib/
│       └── types/
│
└── screenshots/
```

---

# 📡 API Endpoints

## Health

```http
GET /health
```

---

## Search Papers

```http
POST /api/v1/search
```

---

## Generate Literature Review

```http
POST /api/v1/review
```

---

## Compare Papers

```http
POST /api/v1/compare
```

---

## Ask Papers

```http
POST /api/v1/query
```

---

## Generate Citations

```http
POST /api/v1/citations
```

---

## Papers Cache

```http
GET /api/v1/papers
GET /api/v1/papers/{id}
```

---

# ⚙️ Installation

# 1️⃣ Clone Repository

```bash
git clone https://github.com/Geethanjaliii/PaperPilot-AI.git

cd PaperPilot-AI
```

---

# 2️⃣ Backend Setup

```bash
cd backend

python -m venv .venv
```

Windows

```bash
.venv\Scripts\activate
```

Linux / Mac

```bash
source .venv/bin/activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

Create `.env`

```env
GEMINI_API_KEY=
DATABASE_URL=
CHROMA_DB_PATH=./data/chroma
PAPERS_DB_PATH=./data/papers.db
```

Run server

```bash
uvicorn app.main:app --reload
```

Backend URL

```text
http://127.0.0.1:8000
```

Swagger

```text
http://127.0.0.1:8000/docs
```

---

# 3️⃣ Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend URL

```text
http://localhost:3000
```

---

# 🌍 Environment Variables

## Backend

```env
GEMINI_API_KEY=
DATABASE_URL=
PAPERS_DB_PATH=
CHROMA_DB_PATH=
```

## Frontend

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

# 🧪 Testing

Backend Tests

```bash
pytest
```

Production Build

```bash
npm run build
```

---

# 🚀 Deployment

## Backend

Recommended:

- Railway
- Render
- AWS ECS
- Google Cloud Run

Docker

```bash
docker build -t paperpilot-backend .

docker run -p 8000:8000 paperpilot-backend
```

---

## Frontend

```bash
npm run build
```

Recommended:

- Vercel
- Netlify
- AWS Amplify

---

# 🔮 Future Enhancements

- Authentication & User Accounts
- Team Workspaces
- Shared Research Collections
- PDF Upload & Semantic Search
- Research Knowledge Graph
- Vector-Based Citation Recommendation
- Research Timeline Generation
- AI Research Agent Workflows
- Multi-Agent Collaboration
- Real-Time Collaboration
- Export to Notion
- Export to Overleaf
- Google Drive Integration
- Zotero Integration

---

# 📈 Project Highlights

✅ Multi-Agent AI Research Platform

✅ AI Literature Review Generation

✅ Side-by-Side Methodology Comparison

✅ Conversational Research Assistant

✅ Citation Generation Engine

✅ RAG + LangGraph Architecture

✅ FastAPI + Next.js Full-Stack System

✅ SQLite + ChromaDB Persistence

✅ Production-Hardened Backend

✅ Modern Enterprise Research Dashboard

---

# ✍️ Author

**Geethanjali V N**

GitHub:
https://github.com/Geethanjaliii

Project Repository:
https://github.com/Geethanjaliii/PaperPilot-AI

---

# 📄 License

This project is licensed under the MIT License.
