# PaperPilot AI – AI-Powered Research Operating System

PaperPilot AI is an AI-powered research operating system that accelerates academic literature discovery, synthesis, comparison, and citation generation. The platform transforms scattered research papers into actionable insights through intelligent search, AI-generated literature reviews, side-by-side comparisons, and conversational research assistance.

---

## 🚀 Features

### 🔍 Intelligent Research Paper Search

* Search across multiple academic databases simultaneously
* arXiv and Semantic Scholar integration
* Advanced filtering by year, field, and publication type
* Real-time paper retrieval and indexing
* Save papers directly into collections

### 📚 AI-Powered Literature Review Generation

* Generate structured literature reviews from research topics
* Automatic synthesis of findings across multiple papers
* Methodology comparison and trend analysis
* Research gap identification
* Citation-aware review generation

### ⚖️ Paper Comparison Engine

* Side-by-side methodology comparison
* Architecture and dataset comparison
* Performance metrics analysis
* Strengths and limitations breakdown
* Future research direction comparison

### 💬 Ask Papers (Perplexity-Style Research Assistant)

* Conversational interface for research questions
* Context-aware answers grounded in papers
* Inline citations and source references
* Follow-up question suggestions
* Deep Research mode

### 📝 Citation Generator

Generate academic citations in multiple formats:

* APA 7th Edition
* IEEE
* BibTeX

Features:

* Batch citation generation
* Copy individual citations
* Export citation collections
* Citation history tracking

### ⭐ Research Library & Collections

* Bookmark papers
* Organize papers into collections
* Custom tags and folders
* Search saved papers
* Research workspace management

### 📊 Analytics Dashboard

* Papers indexed
* Literature reviews generated
* Questions asked
* Comparisons created
* Research activity timeline
* Personalized recommendations

### 📱 Responsive Research Workspace

* Desktop-first research dashboard
* Tablet and mobile support
* Dark premium interface
* Smooth animations and interactions
* Real-time API status indicators

---

## 🛠️ Tech Stack

### Frontend

* Framework: Next.js 15 (App Router)
* Language: TypeScript
* Styling: Tailwind CSS
* Animations: Framer Motion
* State Management: Zustand
* Data Fetching: React Query
* HTTP Client: Axios
* Icons: Lucide React

### Backend

* Framework: FastAPI (Python 3.11)
* Database: SQLite (WAL Mode)
* ORM: SQLAlchemy
* Validation: Pydantic
* Vector Database: ChromaDB
* HTTP Client: HTTPX

### AI & Research Services

* Gemini 2.5 Flash
* Retrieval-Augmented Generation (RAG)
* Sentence Transformers
* arXiv API
* Semantic Scholar API

---

## 📐 System Architecture

Frontend (Next.js 15)
↓
FastAPI Backend
↓
Gemini AI + RAG Layer
↓
Chroma Vector Database
↓
SQLite Persistence Layer
↓
arXiv + Semantic Scholar APIs

---

## 🔄 Research Workflow

Search Papers
↓
Save Papers to Collections
↓
Generate Literature Reviews
↓
Compare Methodologies
↓
Ask Questions over Papers
↓
Generate Citations
↓
Export Research Outputs

---

## 🚀 Core Modules

### 🔍 Search Papers

* Multi-source academic search
* Filters and sorting
* Paper metadata extraction
* Save and export options

### 📚 Literature Review

* Topic-based synthesis
* Review sections generation
* Methodology analysis
* Citation references

### ⚖️ Compare Papers

* Side-by-side comparison matrix
* Metrics comparison
* Architecture breakdown
* Limitations analysis

### 💬 Ask Papers

* Perplexity-style interface
* Source-backed answers
* Follow-up questions
* Deep Research mode

### 📝 Citations

* APA generation
* IEEE generation
* BibTeX export
* Citation management

### ⭐ Saved Papers

* Collections
* Bookmarks
* Tags
* Research organization

### 📊 Dashboard & History

* Research analytics
* Activity logs
* Recommendations
* Research progress tracking

---

## 📸 Application Screenshots

### Dashboard

Dashboard Screenshot

### Search Papers

Search Screenshot

### Literature Review

Literature Review Screenshot

### Compare Papers

Compare Papers Screenshot

### Ask Papers

Ask Papers Screenshot

### Citations

Citations Screenshot

### Saved Papers

Saved Papers Screenshot

### Pricing

Pricing Screenshot

### History

History Screenshot

---

## 📦 Installation & Configuration

### Prerequisites

* Python 3.11+
* Node.js 18+
* Gemini API Key

---

## 1️⃣ Backend Setup

```bash
cd backend

python -m venv .venv

# Windows
.venv\Scripts\activate

pip install -r requirements.txt
```

Create a `.env` file:

```env
GOOGLE_API_KEY=your_gemini_api_key
```

Run the server:

```bash
uvicorn app.main:app --reload
```

Backend URL:

```
http://localhost:8000
```

Swagger Documentation:

```
http://localhost:8000/docs
```

---

## 2️⃣ Frontend Setup

```bash
cd frontend

npm install
npm run dev
```

Frontend URL:

```
http://localhost:3000
```

---

## 📡 API Endpoints

### System

GET /health

### Research Operations

POST /api/v1/search
POST /api/v1/review
POST /api/v1/compare
POST /api/v1/query
POST /api/v1/citations

### Paper Management

GET /api/v1/papers
GET /api/v1/papers/{id}

---

## 🛡️ Production Hardening

### Security

* Sanitized exception handling
* Configurable CORS rules
* Secret isolation via `.gitignore`

### Reliability

* Exponential retry and backoff
* HTTP 429 quota handling
* Retry-After response support
* Dynamic HTTP client binding

### Performance

* Async I/O offloading
* Chroma vector indexing
* SQLite WAL mode
* Connection reuse and pooling

### Persistence

* Automatic JSON → SQLite migration
* Deterministic UUID generation
* Multi-worker safe storage

---

## 🧪 Verification & Testing

### Backend Tests

```bash
pytest
```

Results:

```
27 passed in 14.60s
```

### Frontend

```bash
npm run build
```

Results:

```
✓ Compiled successfully
✓ TypeScript checks passed
✓ Static pages generated
```

---

## 🔮 Future Enhancements

* PDF document ingestion
* DOI lookup support
* Collaborative research workspaces
* Research knowledge graphs
* Agentic AI workflows
* Cloud deployment
* Authentication and subscriptions
* Team collaboration features
* Export to DOCX and PDF
* Research graph visualizations

---

## 📈 Project Highlights

* AI-Powered Research Operating System
* Multi-Source Academic Search Engine
* Literature Review Generation Pipeline
* Side-by-Side Research Comparison Engine
* Perplexity-Style Research Assistant
* Citation Management Platform
* RAG + Gemini Integration
* Next.js + FastAPI Full-Stack Architecture
* Production-Hardened Backend
* Responsive Premium Research Dashboard

---

## ✍️ Author

**Geethanjali V N**

Computer Science Engineering Student • AI & Cloud Enthusiast • Backend Developer

GitHub: https://github.com/Geethanjalii

Project Repository:
https://github.com/Geethanjalii/PaperPilot-AI

---

## 📄 License

This project is licensed under the MIT License.
