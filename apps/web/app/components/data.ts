export const repositories = [
  {
    owner: "vivek",
    name: "peek-er",
    language: "TypeScript",
    risk: "Medium",
    status: "Reviewing",
    health: 86,
    openPulls: 4,
    findings: 18,
    lastRun: "8 min ago",
  },
  {
    owner: "acme",
    name: "billing-api",
    language: "Go",
    risk: "High",
    status: "Needs attention",
    health: 71,
    openPulls: 7,
    findings: 34,
    lastRun: "22 min ago",
  },
  {
    owner: "northstar",
    name: "web-console",
    language: "React",
    risk: "Low",
    status: "Clean",
    health: 94,
    openPulls: 2,
    findings: 6,
    lastRun: "1 hr ago",
  },
];

export const pullRequests = [
  {
    number: 42,
    title: "Add refresh-token auth flow",
    author: "vivek",
    branch: "auth-refresh-token",
    base: "main",
    status: "Review complete",
    risk: "High",
    files: 9,
    findings: 5,
    comments: 3,
    summary:
      "The auth flow is close, but logout, token rotation, and cookie settings need hardening before merge.",
  },
  {
    number: 41,
    title: "Index repo symbols for semantic search",
    author: "maya",
    branch: "repo-rag-index",
    base: "main",
    status: "Running",
    risk: "Medium",
    files: 14,
    findings: 3,
    comments: 1,
    summary:
      "Symbol extraction is working. The reviewer is checking chunk boundaries and generated-file filtering.",
  },
  {
    number: 39,
    title: "Wire Kafka webhook worker",
    author: "arjun",
    branch: "kafka-worker",
    base: "main",
    status: "Queued",
    risk: "Low",
    files: 6,
    findings: 1,
    comments: 0,
    summary:
      "Waiting for dependency context from the backend worker and shared Kafka package.",
  },
];

export const findings = [
  {
    severity: "High",
    category: "Security",
    file: "apps/backend/src/auth/routes.ts",
    line: 88,
    title: "Refresh token reuse is not detected",
    detail:
      "A stolen refresh token can be replayed until the latest token hash is replaced. Consider detecting reuse and clearing active sessions.",
  },
  {
    severity: "Medium",
    category: "Reliability",
    file: "apps/backend/src/auth/cookies.ts",
    line: 9,
    title: "Cookie policy depends on deployment topology",
    detail:
      "Cross-site frontend/backend deployments need SameSite=None and secure cookies, while local dev can use lax cookies.",
  },
  {
    severity: "Medium",
    category: "Testing",
    file: "apps/backend/src/auth/middleware.ts",
    line: 15,
    title: "Missing expired-token route coverage",
    detail:
      "Add tests for missing, malformed, expired, and valid access tokens to protect the auth boundary.",
  },
  {
    severity: "Low",
    category: "Maintainability",
    file: "packages/db/prisma/schema.prisma",
    line: 12,
    title: "Single refresh-token hash limits device sessions",
    detail:
      "A separate Session table would support multiple devices, revocation, and better audit trails later.",
  },
];

export const contextItems = [
  "Repo map: Express backend, Next.js web app, Prisma DB package, Kafka worker",
  "Symbol: requireAuth validates JWT access token and attaches req.user",
  "Memory: project uses httpOnly refresh cookie and in-memory access token",
  "Edge: auth routes call token helpers and Prisma user update",
  "Similar file: apps/backend/src/index.ts mounts /auth router",
];
