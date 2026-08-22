# SkillGraph AI — Backend & ML Engine

Developer-profile auditing service. Given a GitHub username it fetches
repository, commit, and language data; scores commit hygiene; analyzes
Python code complexity via AST; and optionally uses Gemini to produce
human-readable skill evidence.

---

## Project structure

```
skillgraph-backend/
├── main.py                  # FastAPI app + /health + /api/audit
├── services/
│   ├── github_client.py     # Async GitHub REST fetchers
│   ├── ast_analyzer.py      # Python AST complexity engine
│   ├── commit_scorer.py     # Commit-date heuristics
│   └── llm_evidence.py      # Gemini evidence generation (optional)
├── models/
│   └── schemas.py           # Pydantic request / response models
├── tests/
│   ├── test_commit_scorer.py
│   ├── test_ast_analyzer.py
│   ├── test_github_client.py
│   ├── test_llm_evidence.py
│   └── test_api.py
├── .env.example
├── .gitignore
├── pytest.ini
├── requirements.txt
└── README.md
```

---

## Setup

### 1. Create and activate a virtual environment

```bash
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment variables

```bash
cp .env.example .env
# Edit .env — set GITHUB_TOKEN (required for good rate limits)
# GEMINI_API_KEY is optional; LLM step is skipped when absent
```

---

## Run

```bash
uvicorn main:app --reload --port 8000
```

The API is now available at `http://localhost:8000`.

---

## API reference

### Health check

```
GET /health
```

Response:
```json
{"status": "ok"}
```

### Audit a GitHub user

```
POST /api/audit
Content-Type: application/json

{"username": "torvalds"}
```

Example response:
```json
{
  "username": "torvalds",
  "authenticityScore": 82,
  "complexityGrade": "B",
  "riskLevel": "Low Risk",
  "riskMessage": "Aggregate commit pattern across 5 repos.",
  "totalRepos": 8,
  "totalCommits": 214,
  "linesAnalyzed": "N/A",
  "skills": [],
  "techStack": [],
  "anomalies": [],
  "questions": [],
  "repos": [
    {
      "name": "linux",
      "lang": "C",
      "commits": 100,
      "originality": "Low Risk",
      "complexity": "N/A",
      "status": "analyzed"
    }
  ]
}
```

### curl example

```bash
curl -X POST http://localhost:8000/api/audit \
  -H "Content-Type: application/json" \
  -d '{"username": "torvalds"}'
```

---

## Run tests

```bash
pytest
```

---

## Known limitations (MVP)

- **Python only**: AST analysis covers `.py` files exclusively. Other languages return `N/A` complexity.
- **Heuristic authenticity**: The commit-date score is an indicator of iterative development, not proof of authorship.
- **`linesAnalyzed` is always `"N/A"`**: Full line counting is left for a post-hackathon iteration.
- **Rate limits**: Without a `GITHUB_TOKEN` the GitHub API limits unauthenticated requests to 60/hour.
- **Gemini availability**: If `GEMINI_API_KEY` is absent or rate-limited, skills/techStack/anomalies/questions return as empty arrays.
- **Repo/file caps**: Only the 5 most recently updated repos and up to 10 Python files per repo are analyzed for demo speed.
