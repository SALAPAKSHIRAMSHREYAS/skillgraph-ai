export type Severity = "critical" | "warning" | "info"
export type RepoStatus = "verified" | "flagged" | "review"

export type Anomaly = {
  id: string
  severity: Severity
  title: string
  detail: string
  meta: string
}

export type Repo = {
  name: string
  language: string
  originality: number
  status: RepoStatus
  commits: number
  lastPush: string
}

export type Profile = {
  handle: string
  displayName: string
  role: string
  location: string
  score: number
  verdict: string
  grade: string
  gradeNote: string
  cadence: {
    risk: number
    label: string
    note: string
  }
  footprint: {
    repos: number
    commits: number
    files: number
    astNodes: number
  }
  skills: { subject: string; verified: number; claimed: number }[]
  anomalies: Anomaly[]
  questions: { q: string; a: string }[]
  repositories: Repo[]
}

export const PROFILES: Record<string, Profile> = {
  "@authentic-dev": {
    handle: "@authentic-dev",
    displayName: "Ada Renwick",
    role: "Senior Platform Engineer",
    location: "Lisbon, PT",
    score: 92,
    verdict: "Portfolio corroborated by AST lineage and organic commit history.",
    grade: "A",
    gradeNote: "Cyclomatic mean 4.1 · low duplication",
    cadence: {
      risk: 12,
      label: "Low risk",
      note: "418 commits across 96 distinct days",
    },
    footprint: {
      repos: 24,
      commits: 4187,
      files: 9312,
      astNodes: 1284900,
    },
    skills: [
      { subject: "Systems", verified: 88, claimed: 90 },
      { subject: "Frontend", verified: 94, claimed: 95 },
      { subject: "Testing", verified: 81, claimed: 78 },
      { subject: "Infra", verified: 76, claimed: 82 },
      { subject: "Data", verified: 69, claimed: 74 },
      { subject: "Security", verified: 84, claimed: 80 },
    ],
    anomalies: [
      {
        id: "a1",
        severity: "info",
        title: "Vendored dependency detected",
        detail: "packages/ui/vendor/date-utils.ts matches an upstream MIT source. Attribution header present and correct.",
        meta: "AST lineage · 2 files",
      },
      {
        id: "a2",
        severity: "warning",
        title: "Coverage gap in payments module",
        detail: "billing/reconcile.ts holds branch complexity 14 with no accompanying test file in the same tree.",
        meta: "Static analysis · confidence 0.71",
      },
      {
        id: "a3",
        severity: "info",
        title: "Consistent authorship signature",
        detail: "Commit diff entropy and identifier naming remain stable across 31 months of history.",
        meta: "Cadence model · 4187 commits",
      },
    ],
    questions: [
      {
        q: "Walk through the backpressure strategy in stream-router/src/queue.ts.",
        a: "Probing genuine ownership of the bounded-buffer implementation. Expect discussion of the high-water mark constant and why drops are preferred over unbounded memory growth in the ingest path.",
      },
      {
        q: "Why did you replace the optimistic cache with a versioned read in commit 8f2a1c?",
        a: "Tests whether the author recalls the stale-read incident referenced in the commit body. A verified author should surface the write-skew scenario without prompting.",
      },
      {
        q: "The reconcile module has complexity 14 and no tests. How would you decompose it?",
        a: "Follow-up on the flagged coverage gap. Looking for pragmatic seams — extracting the currency rounding and the ledger write into pure functions.",
      },
    ],
    repositories: [
      { name: "stream-router", language: "TypeScript", originality: 94, status: "verified", commits: 812, lastPush: "2d ago" },
      { name: "otel-lite", language: "Go", originality: 89, status: "verified", commits: 431, lastPush: "9d ago" },
      { name: "ui-primitives", language: "TypeScript", originality: 91, status: "verified", commits: 1204, lastPush: "1d ago" },
      { name: "billing-core", language: "TypeScript", originality: 72, status: "review", commits: 318, lastPush: "3w ago" },
      { name: "infra-modules", language: "HCL", originality: 85, status: "verified", commits: 264, lastPush: "5d ago" },
      { name: "sketch-notebook", language: "Python", originality: 61, status: "review", commits: 77, lastPush: "4mo ago" },
    ],
  },

  "@tutorial-cloner": {
    handle: "@tutorial-cloner",
    displayName: "M. Ostrander",
    role: "Claims: Full-Stack Engineer",
    location: "Unverified",
    score: 18,
    verdict: "Portfolio dominated by unattributed tutorial derivatives and single-dump history.",
    grade: "D",
    gradeNote: "Cyclomatic mean 1.6 · 74% duplication",
    cadence: {
      risk: 91,
      label: "Critical risk",
      note: "1,940 commits landed across 6 days",
    },
    footprint: {
      repos: 41,
      commits: 1940,
      files: 2106,
      astNodes: 184300,
    },
    skills: [
      { subject: "Systems", verified: 11, claimed: 85 },
      { subject: "Frontend", verified: 27, claimed: 96 },
      { subject: "Testing", verified: 4, claimed: 70 },
      { subject: "Infra", verified: 9, claimed: 88 },
      { subject: "Data", verified: 14, claimed: 92 },
      { subject: "Security", verified: 6, claimed: 80 },
    ],
    anomalies: [
      {
        id: "b1",
        severity: "critical",
        title: "Bulk import masquerading as authored work",
        detail: "31 repositories were initialised with a single commit containing 100% of the tree. No incremental history exists.",
        meta: "Cadence model · confidence 0.97",
      },
      {
        id: "b2",
        severity: "critical",
        title: "AST fingerprint match to public course material",
        detail: "next-shop/ matches a well-known e-commerce tutorial at 0.96 similarity including identical comment typos.",
        meta: "AST lineage · 214 files",
      },
      {
        id: "b3",
        severity: "warning",
        title: "Authorship signature discontinuity",
        detail: "Identifier casing and formatting style shift abruptly between adjacent directories in the same repository.",
        meta: "Style model · 7 repositories",
      },
      {
        id: "b4",
        severity: "warning",
        title: "README claims exceed verifiable surface",
        detail: "Profile claims Kubernetes operators and distributed tracing; no manifest, controller, or span instrumentation found.",
        meta: "Claim reconciliation",
      },
    ],
    questions: [
      {
        q: "next-shop/lib/cart.ts contains a bug on line 84 that the upstream tutorial also has. Explain it.",
        a: "High-signal probe. An author who wrote this code can describe the quantity mutation aliasing bug; a cloner will typically defend the code as intentional.",
      },
      {
        q: "Your entire k8s-operator repo landed in one commit. Describe the local test loop you used.",
        a: "Expect concrete tooling — kind, envtest, controller-runtime harness. Vague CI-only answers corroborate the bulk-import flag.",
      },
      {
        q: "Which parts of this portfolio are adapted from third-party material?",
        a: "Direct integrity question. Candid attribution materially improves the assessment; denial against a 0.96 AST match does not.",
      },
    ],
    repositories: [
      { name: "next-shop", language: "TypeScript", originality: 6, status: "flagged", commits: 1, lastPush: "5mo ago" },
      { name: "k8s-operator", language: "Go", originality: 9, status: "flagged", commits: 1, lastPush: "5mo ago" },
      { name: "ai-chat-clone", language: "TypeScript", originality: 4, status: "flagged", commits: 2, lastPush: "5mo ago" },
      { name: "portfolio-site", language: "JavaScript", originality: 44, status: "review", commits: 31, lastPush: "2mo ago" },
      { name: "algo-practice", language: "Python", originality: 58, status: "review", commits: 96, lastPush: "6w ago" },
      { name: "devops-scripts", language: "Shell", originality: 12, status: "flagged", commits: 3, lastPush: "5mo ago" },
    ],
  },

  "@lazy-architect": {
    handle: "@lazy-architect",
    displayName: "Toby Marsh",
    role: "Claims: Staff Architect",
    location: "Remote",
    score: 54,
    verdict: "Authentic authorship, but claimed seniority is not supported by shipped complexity.",
    grade: "C",
    gradeNote: "Cyclomatic mean 2.3 · scaffolding-heavy",
    cadence: {
      risk: 46,
      label: "Elevated risk",
      note: "612 commits, 68% inside two-week bursts",
    },
    footprint: {
      repos: 18,
      commits: 612,
      files: 1487,
      astNodes: 312450,
    },
    skills: [
      { subject: "Systems", verified: 41, claimed: 92 },
      { subject: "Frontend", verified: 66, claimed: 74 },
      { subject: "Testing", verified: 22, claimed: 80 },
      { subject: "Infra", verified: 58, claimed: 95 },
      { subject: "Data", verified: 37, claimed: 78 },
      { subject: "Security", verified: 31, claimed: 72 },
    ],
    anomalies: [
      {
        id: "c1",
        severity: "warning",
        title: "Scaffolding-to-logic ratio inverted",
        detail: "81% of added lines are generator output or configuration. Hand-written business logic is confined to 4 files.",
        meta: "AST composition",
      },
      {
        id: "c2",
        severity: "warning",
        title: "Architecture claims lack runtime surface",
        detail: "Repositories describe event-driven design; no consumer, retry, or dead-letter handling is present in the codebase.",
        meta: "Claim reconciliation",
      },
      {
        id: "c3",
        severity: "info",
        title: "Organic but bursty cadence",
        detail: "Commit distribution is genuine and incremental, clustered into short high-intensity windows.",
        meta: "Cadence model · 612 commits",
      },
    ],
    questions: [
      {
        q: "Your services claim event-driven design. Where is the retry and dead-letter path?",
        a: "Tests whether the architecture described in documentation was ever implemented. Expect either an honest 'not yet built' or a pointer to infrastructure outside the repos.",
      },
      {
        q: "Which files in this portfolio did you write by hand rather than generate?",
        a: "Calibrates the scaffolding ratio finding. A credible answer converges on the same small set of logic files the analyser isolated.",
      },
      {
        q: "Testing sits at 22% verified against an 80% claim. What is your position on coverage?",
        a: "Looking for a considered tradeoff rather than an aspiration. Staff-level answers reference risk-weighted coverage, not blanket targets.",
      },
    ],
    repositories: [
      { name: "platform-gateway", language: "TypeScript", originality: 63, status: "review", commits: 148, lastPush: "3w ago" },
      { name: "event-mesh-poc", language: "Go", originality: 51, status: "review", commits: 62, lastPush: "2mo ago" },
      { name: "design-docs", language: "MDX", originality: 88, status: "verified", commits: 211, lastPush: "6d ago" },
      { name: "terraform-baseline", language: "HCL", originality: 34, status: "flagged", commits: 47, lastPush: "4mo ago" },
      { name: "admin-console", language: "TypeScript", originality: 71, status: "verified", commits: 104, lastPush: "1mo ago" },
      { name: "bench-harness", language: "Rust", originality: 45, status: "review", commits: 40, lastPush: "5mo ago" },
    ],
  },
}

export const PERSONA_HANDLES = Object.keys(PROFILES)

export function resolveProfile(query: string): Profile | null {
  const normalized = query.trim().toLowerCase()
  const withAt = normalized.startsWith("@") ? normalized : `@${normalized}`
  return PROFILES[withAt] ?? null
}
