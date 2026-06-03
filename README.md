# AI Resume Analyzer

## Technical Assignment Submission

### Objective

This project is an AI-powered Resume Analyzer that evaluates resumes against a Job Description (JD) using structured resume parsing, semantic similarity matching, candidate ranking, and automated feedback generation.

The application was developed to satisfy the requirements outlined in the AI Engineer Technical Assignment.

---

## Assignment Requirements Coverage

| Requirement                | Status        |
| -------------------------- | ------------- |
| Upload Resume (PDF/DOCX)   | ✅ Implemented |
| Extract Resume Content     | ✅ Implemented |
| Structured Data Extraction | ✅ Implemented |
| Compare Resume with JD     | ✅ Implemented |
| Match Score Generation     | ✅ Implemented |
| Multi-Resume Processing    | ✅ Implemented |
| Embedding-Based Matching   | ✅ Implemented |
| Section-wise Scoring       | ✅ Implemented |
| Resume Ranking System      | ✅ Implemented |
| Feedback Suggestions       | ✅ Implemented |
| JWT Authentication         | ✅ Implemented |
| Error Handling & Logging   | ✅ Implemented |
| Performance Optimization   | ✅ Implemented |
| Basic RAG using Vector DB  | ✅ Implemented |

---

## Project Overview

The system enables recruiters or hiring teams to upload multiple resumes and compare them against a target Job Description.

The workflow includes:

1. Resume Upload
2. Resume Parsing
3. Structured Information Extraction
4. Embedding Generation
5. Semantic Similarity Analysis
6. Section-wise Evaluation
7. Candidate Ranking
8. AI Feedback Generation

---

## Architecture

```text
Resume Analyzer
│
├── Frontend (Next.js)
│   ├── Authentication
│   ├── Dashboard
│   ├── Resume Upload
│   ├── Ranking View
│   └── Candidate Insights
│
├── Backend (Node.js + Express)
│   ├── Authentication APIs
│   ├── Resume Processing
│   ├── Embedding Service
│   ├── Scoring Engine
│   └── Analysis APIs
│
├── PostgreSQL
│
├── Redis Cache
│
└── ChromaDB Vector Store
```

---

## Technology Stack

### Frontend

* Next.js
* TypeScript
* Tailwind CSS
* React Query
* Axios

### Backend

* Node.js
* Express.js
* TypeScript

### Database

* PostgreSQL
* Prisma ORM

### AI & NLP

* OpenAI Embeddings
* LangChain

### Vector Database

* ChromaDB

### Caching

* Redis

### Authentication

* JWT
* bcrypt

---

## Scoring Strategy

The candidate score is calculated using weighted evaluation across three dimensions:

| Section    | Weight |
| ---------- | ------ |
| Skills     | 40%    |
| Experience | 40%    |
| Education  | 20%    |

Overall Score:

```text
Overall Score =
(Skills × 0.4) +
(Experience × 0.4) +
(Education × 0.2)
```

---

## Key Features

### Resume Parsing

Extracts:

* Name
* Email
* Skills
* Experience
* Education

### Semantic Matching

Uses embeddings to compare:

* Resume Content
* Job Description

instead of relying solely on keyword matching.

### Candidate Ranking

Automatically ranks all uploaded candidates based on overall suitability.

### Feedback Generation

Provides:

* Strengths
* Missing Skills
* Improvement Suggestions

### Performance Optimization

Implemented:

* Redis Caching
* Efficient API Design
* Reusable Services
* Modular Architecture

### Vector Search (Bonus)

Implemented a basic Retrieval-Augmented Generation (RAG) workflow using ChromaDB.

---

## Setup Instructions

### 1. Clone Repository

```bash
git clone <repository-url>
cd resume-analyzer
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create:

```text
apps/api/.env
```

Add:

```env
PORT=5000

DATABASE_URL=postgresql://postgres:password@localhost:5432/resume_analyzer

JWT_SECRET=your-secret-key

OPENAI_API_KEY=your-openai-api-key

REDIS_URL=redis://localhost:6379
```

### 4. Setup Database

Create PostgreSQL database:

```sql
CREATE DATABASE resume_analyzer;
```

### 5. Run Prisma

```bash
cd apps/api

npx prisma generate

npx prisma migrate dev --name init
```

### 6. Start Backend

```bash
npm run dev
```

### 7. Start Frontend

```bash
cd ../web

npm run dev
```

Frontend:

```text
http://localhost:3000
```

Backend:

```text
http://localhost:5000
```

---

## Sample Test Scenario

### Job Description

Software Engineer with experience in:

* Node.js
* React
* TypeScript
* PostgreSQL
* REST APIs

### Resume Analysis Output

The system produces:

* Overall Match Score
* Skills Match Score
* Experience Match Score
* Education Match Score
* Candidate Rank
* Strengths
* Missing Skills
* Recommendations

---

## Assumptions

* Resumes are uploaded as PDF or DOCX files.
* Job Descriptions are provided as text.
* OpenAI API access is available.
* PostgreSQL and Redis services are accessible.

---

## Limitations

* Resume parsing accuracy depends on document formatting.
* Current scoring weights are fixed.
* Large-scale batch processing may require asynchronous job queues.
* Feedback quality depends on extracted resume information.

---

## Future Enhancements

* ATS Compatibility Score
* Interview Question Generation
* Resume Improvement Suggestions
* Multi-language Support
* Recruiter Collaboration Features
* Advanced Candidate Search

---

## Submission Notes

This solution was designed with a focus on:

* Clean Architecture
* Scalability
* Modular Services
* AI Integration
* Performance Optimization
* Maintainable Code Structure

All assignment requirements have been implemented, with additional support for semantic matching, candidate ranking, caching, and vector-based retrieval.
