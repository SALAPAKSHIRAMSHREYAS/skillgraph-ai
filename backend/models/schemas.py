"""
Pydantic schemas for the SkillGraph AI API contract.
These shapes are fixed and frontend-aligned — do not add fields without marking them optional.
"""

import re
from typing import List, Literal
from pydantic import BaseModel, field_validator

# GitHub username: alphanumeric + hyphens, no leading/trailing hyphen, 1-39 chars
_GITHUB_USERNAME_RE = re.compile(r"^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$|^[a-zA-Z0-9]$")


# ---------------------------------------------------------------------------
# Request
# ---------------------------------------------------------------------------

class AuditRequest(BaseModel):
    username: str

    @field_validator("username")
    @classmethod
    def username_must_be_valid(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("username must not be empty")
        if len(v) > 39:
            raise ValueError("username exceeds GitHub's 39-character limit")
        if not _GITHUB_USERNAME_RE.match(v):
            raise ValueError(
                "username contains invalid characters — "
                "only alphanumeric and hyphens allowed, no leading/trailing hyphens"
            )
        return v


# ---------------------------------------------------------------------------
# Response sub-models
# ---------------------------------------------------------------------------

class SkillScore(BaseModel):
    subject: str
    score: int  # 0-100


class TechStackItem(BaseModel):
    name: str
    confidence: int  # 0-100


class Anomaly(BaseModel):
    type: Literal["success", "info", "danger"]
    title: str
    desc: str


class VerificationQuestion(BaseModel):
    q: str
    context: str


class RepoSummary(BaseModel):
    name: str
    lang: str
    commits: int
    originality: str   # e.g. "Low Risk", "Medium Risk", "High Risk"
    complexity: str    # e.g. "A", "B", "C", "D", or "N/A"
    status: str        # e.g. "analyzed", "skipped", "error"


# ---------------------------------------------------------------------------
# Top-level response
# ---------------------------------------------------------------------------

class AuditResponse(BaseModel):
    username: str
    authenticityScore: int          # 0-100
    complexityGrade: str            # A / B / C / D / N/A
    riskLevel: str                  # Low Risk / Medium Risk / High Risk
    riskMessage: str
    totalRepos: int
    totalCommits: int
    linesAnalyzed: str              # "N/A" for MVP
    skills: List[SkillScore]
    techStack: List[TechStackItem]
    anomalies: List[Anomaly]
    questions: List[VerificationQuestion]
    repos: List[RepoSummary]


# ---------------------------------------------------------------------------
# LLM evidence intermediate shape (internal only)
# ---------------------------------------------------------------------------

class LLMEvidence(BaseModel):
    skills: List[SkillScore] = []
    techStack: List[TechStackItem] = []
    anomalies: List[Anomaly] = []
    questions: List[VerificationQuestion] = []
