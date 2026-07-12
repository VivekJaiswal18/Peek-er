# Peek-er

Agentic, repository-aware AI code review for GitHub pull requests.

Peek-er is an agentic-ai TypeScript monorepo for connecting GitHub repositories, indexing repository context, running multiple specialized review agents, deduplicating their findings, and presenting the result in a focused review workspace. The product UI includes a landing page, review dashboard, repository management, findings triage, pull-request review, repository chat, and settings.

## Contents

- [Product capabilities](#product-capabilities)
- [Current implementation status](#current-implementation-status)
- [System architecture](#system-architecture)
- [Review lifecycle](#review-lifecycle)
- [Agent architecture](#agent-architecture)
- [Technology stack](#technology-stack)
- [Repository structure](#repository-structure)
- [Data model](#data-model)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [GitHub App setup](#github-app-setup)
- [API and web routes](#api-and-web-routes)
- [Kafka contracts](#kafka-contracts)
- [Development commands](#development-commands)
- [Docker and deployment](#docker-and-deployment)
- [Security notes](#security-notes)
- [Known gaps and roadmap](#known-gaps-and-roadmap)
- [Contributing](#contributing)

## Product capabilities

- GitHub App installation flow with repository selection.
- Repository and pull-request review dashboard.
- Risk, review health, findings, context hits, and review activity views.
- Three-pane pull-request workspace with changed files, AI findings, suggested patches, agent activity, and retrieved context.
- Finding categories for correctness, security, performance, testing, and maintainability.
- Repository chat interface and project-level review settings.
- Repository context model for files, symbols, dependency edges, repository maps, and agent memory.
- LangGraph-based parallel review orchestration.
- Kafka contracts for ingestion, review, and comment jobs.
- PostgreSQL persistence through Prisma.
- AWS ECS/Fargate controller scaffold for isolated repository ingestion tasks.
- Responsive charcoal/orange product design, dark mode, and an interactive peeking mascot.

<!-- ## Current implementation status

| Area                         | Status                   | Notes                                                                                                                                                     |
| ---------------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Marketing and application UI | Implemented              | Next.js routes and responsive design are complete. Most displayed review data currently comes from `apps/web/app/components/data.ts`.                     |
| Signup API                   | Partial                  | Creates users, hashes passwords, issues JWTs, and sets a refresh-token cookie. Login, refresh, logout, and frontend session persistence are not complete. |
| GitHub App install redirect  | Implemented              | `/api/github/connect` redirects through `GITHUB_APP_INSTALL_URL` or `GITHUB_APP_SLUG`.                                                                    |
| GitHub installation webhook  | Partial                  | Installation persistence exists. Signature verification and GitHub-compatible webhook authentication still need implementation.                           |
| PostgreSQL schema            | Implemented              | Users, installations, repositories, PRs, review runs, findings, comments, and repository context are modeled.                                             |
| Kafka library                | Partial                  | Producers, consumers, payload types, and TLS setup exist. Topic naming and message envelopes need normalization.                                          |
| Agent graph                  | Implemented as a package | Summary, bug, and security agents run in parallel before deterministic deduplication. It is not yet invoked by the worker.                                |
| Ingestion controller         | Partial                  | Consumes ingestion jobs and is intended to launch isolated AWS Fargate tasks. GitHub token request handling needs correction.                             |
| Isolated indexing task       | Scaffolded               | The task image installs Git, but `apps/kafka-worker/src/kafka-worker.ts` does not yet clone or index repositories.                                        |
| Automated tests              | Not implemented          | Add unit, integration, contract, and end-to-end coverage before production use.                                                                           | -->

## System architecture

```mermaid
flowchart LR
    User[Developer / Reviewer]
    GitHub[GitHub App and Webhooks]

    subgraph Client[Web application]
        Web[Next.js 16 / React 19]
        Install[GitHub install redirect]
    end

    subgraph API[Application API]
        Backend[Express 5 API]
        Auth[JWT and cookie auth]
    end

    subgraph Messaging[Asynchronous jobs]
        Kafka[(Kafka)]
        Controller[Kafka worker / ECS controller]
        Task[Isolated Fargate indexing task]
    end

    subgraph Intelligence[Review intelligence]
        Graph[LangGraph review graph]
        Summary[Summary agent]
        Bug[Bug agent]
        Security[Security agent]
        Dedupe[Confidence filter and dedupe]
        Models[OpenAI / OpenRouter models]
    end

    subgraph Data[Persistence and context]
        Postgres[(PostgreSQL)]
        Prisma[Prisma 7]
        Context[Files, symbols, edges, maps, memory]
    end

    User --> Web
    Web --> Backend
    Web --> Install
    Install --> GitHub
    GitHub --> Backend
    Backend --> Auth
    Backend --> Prisma
    Prisma --> Postgres
    Backend -. ingestion and review jobs .-> Kafka
    Kafka -.-> Controller
    Controller -. RunTask .-> Task
    Task -. clone and index .-> Context
    Context --> Postgres
    Kafka -. review job .-> Graph
    Graph --> Summary
    Graph --> Bug
    Graph --> Security
    Summary --> Models
    Bug --> Models
    Security --> Models
    Summary --> Dedupe
    Bug --> Dedupe
    Security --> Dedupe
    Dedupe -. results and comments .-> Postgres
    Dedupe -. pull-request review .-> GitHub
```

Solid lines represent implemented direct integrations. Dotted lines represent partially implemented or planned end-to-end connections.

## Review lifecycle

The intended pull-request lifecycle is:

```mermaid
sequenceDiagram
    actor Developer
    participant GH as GitHub
    participant API as Express API
    participant DB as PostgreSQL / Prisma
    participant K as Kafka
    participant W as Review worker
    participant A as LangGraph agents

    Developer->>GH: Open or update pull request
    GH->>API: Pull-request webhook
    API->>DB: Upsert PR and create queued ReviewRun
    API->>K: Publish PrReviewRequestPayload
    K->>W: Deliver review job
    W->>GH: Fetch diff and changed files
    W->>DB: Retrieve repository context
    W->>A: Invoke parallel review graph
    A-->>W: Summary and deduplicated findings
    W->>DB: Store summary, risk, findings, and comments
    W->>K: Publish comment job
    K->>W: Deliver comment job
    W->>GH: Post summary and inline comments
    GH-->>Developer: Display Peek-er review
```

The schema and message contracts support this flow, but the complete webhook-to-review-to-comment path is not wired yet.

## Agent architecture

`packages/agents` uses LangGraph state channels to run specialized agents in parallel.

```mermaid
flowchart TD
    Start([Changed files and PR diff])
    Planner[Heuristic agent planner]
    Summary[Summary agent\ngpt-4.1-mini]
    Bug[Bug agent\nOpenRouter structured output]
    Security[Security agent\ngpt-4.1 structured output]
    Dedupe[Deduplicate by file, line, category, and title]
    Confidence[Keep confidence >= 0.70]
    Result([Review summary and findings])

    Start --> Planner
    Start --> Summary
    Start --> Bug
    Start --> Security
    Summary --> Dedupe
    Bug --> Dedupe
    Security --> Dedupe
    Dedupe --> Confidence
    Confidence --> Result
```

The compiled graph currently starts `summary`, `bug_review`, and `security_review` concurrently. `planAgents()` also contains heuristics for dependency, performance, test, bug, and security routing, but dynamic graph routing is not connected to the compiled graph yet.

Agent state contains:

- Job ID, repository name, and pull-request number.
- Full diff and changed-file patches.
- A reducer-backed summary.
- Reducer-backed findings from all review agents.

Each finding includes a file, line, severity, category, title, explanation, and confidence score.

## Tech stack

| Layer               | Technology                         | Purpose                                                             |
| ------------------- | ---------------------------------- | ------------------------------------------------------------------- |
| Monorepo            | pnpm workspaces, Turborepo 2       | Dependency management, task orchestration, and caching.             |
| Language            | TypeScript 5.9 / 6.x               | Shared types and application code.                                  |
| Frontend            | Next.js 16, React 19               | App Router UI, server/client components, and GitHub redirect route. |
| Styling             | Tailwind CSS 4, PostCSS            | Responsive product UI and dark mode.                                |
| API                 | Express 5                          | Authentication, GitHub webhook handling, and review API scaffold.   |
| Authentication      | JWT, bcrypt, HTTP-only cookies     | Access/refresh tokens and password hashing.                         |
| Database            | PostgreSQL                         | Durable application and review state.                               |
| ORM                 | Prisma 7 with `@prisma/adapter-pg` | Schema, migrations, generated client, and database access.          |
| Messaging           | KafkaJS                            | Repository ingestion, PR review, and comment job transport.         |
| Agent orchestration | LangGraph, LangChain               | Parallel stateful review workflows.                                 |
| Model providers     | OpenAI and OpenRouter              | Summary, bug, and security analysis.                                |
| Validation          | Zod                                | Structured model output schemas and payload validation foundation.  |
| Cloud worker        | AWS SDK for ECS                    | Launching isolated Fargate tasks for repository processing.         |
| Containers          | Docker, Node 22 Alpine             | Web, API, controller worker, and task-worker images.                |
| Quality             | ESLint 9, Prettier 3, TypeScript   | Linting, formatting, and static checking.                           |

## Repository structure

```text
Peek-er/
├── apps/
│   ├── web/                 # Next.js product and marketing UI
│   │   ├── app/             # App Router pages and shared components
│   │   └── public/          # Static assets and mascot source
│   ├── backend/             # Express API, JWT auth, GitHub webhook
│   └── kafka-worker/        # Kafka consumer and ECS task launcher
├── packages/
│   ├── agents/              # LangGraph review agents and state
│   ├── db/                  # Prisma schema, migrations, and client
│   ├── kafka/               # Kafka client, topics, contracts, producers/consumers
│   ├── ui/                  # Shared React primitives
│   ├── eslint-config/       # Shared ESLint configurations
│   └── typescript-config/   # Shared TypeScript configurations
├── package.json             # Root commands
├── pnpm-workspace.yaml      # Workspace boundaries
└── turbo.json               # Task graph and cached outputs
```

### Workspace responsibilities

| Workspace           | Package name   | Responsibility                                                                                       |
| ------------------- | -------------- | ---------------------------------------------------------------------------------------------------- |
| `apps/web`          | `web`          | Marketing site, authentication UI, dashboard, repositories, findings, PR review, chat, and settings. |
| `apps/backend`      | `backend`      | HTTP API on port `8080`.                                                                             |
| `apps/kafka-worker` | `kafka-worker` | Ingestion consumer and AWS ECS controller.                                                           |
| `packages/db`       | `@repo/db`     | Shared Prisma client and database schema.                                                            |
| `packages/kafka`    | `@repo/kafka`  | Shared Kafka client and typed job contracts.                                                         |
| `packages/agents`   | `agents`       | Review state, graph, planner, and agents.                                                            |
| `packages/ui`       | `@repo/ui`     | Shared React components.                                                                             |

## Data model

```mermaid
erDiagram
    User ||--o{ Repository : owns
    User ||--o{ ReviewRun : starts
    GitInstallation ||--o{ Repository : grants_access
    Repository ||--o{ PullRequest : contains
    PullRequest ||--o{ ReviewRun : reviewed_by
    ReviewRun ||--o{ ReviewFinding : produces
    ReviewRun ||--o{ ReviewComment : posts
    Repository ||--o{ RepoFile : indexes
    Repository ||--o{ RepoSymbol : extracts
    Repository ||--o{ RepoEdge : maps
    Repository ||--o{ RepoMap : summarizes
    Repository ||--o{ AgentMemory : remembers

    User {
        int id PK
        string email UK
        string password
        string refreshToken
    }
    GitInstallation {
        int id PK
        string installationId UK
        string accountLogin
        string accountType
    }
    Repository {
        int id PK
        int userId FK
        int gitInstallationId FK
        string providerRepoId
        string owner
        string name
    }
    PullRequest {
        int id PK
        int repositoryId FK
        int number
        string baseSha
        string headSha
    }
    ReviewRun {
        int id PK
        int pullRequestId FK
        string status
        string model
        string riskLevel
    }
    ReviewFinding {
        int id PK
        int reviewRunId FK
        string severity
        string category
        string fingerprint
    }
    ReviewComment {
        int id PK
        int reviewRunId FK
        string status
        string providerCommentId
    }
```

Repository context is normalized into:

- `RepoFile`: path, blob SHA, content hash, language, generated-file marker.
- `RepoSymbol`: named symbol, type, line range, summary, and external embedding ID.
- `RepoEdge`: imports, calls, inheritance, implementation, read, and write relationships.
- `RepoMap`: a commit-specific textual repository map.
- `AgentMemory`: repository-scoped conventions or knowledge from users, agents, repositories, and reviews.

## Getting started

### Prerequisites

- Node.js 22 recommended; the root manifest supports Node.js 18 or newer.
- Corepack and pnpm 9.
- PostgreSQL.
- A Kafka broker. The current client expects TLS certificate variables even when `KAFKA_SSL` is not set.
- Optional: GitHub App credentials for repository installation and ingestion.
- Optional: OpenAI and OpenRouter API keys for running review agents.
- Optional: AWS credentials and ECS resources for the ingestion controller.

### 1. Install dependencies

```bash
corepack enable
pnpm install
```

### 2. Configure the database

Create `packages/db/.env`:

```dotenv
DATABASE_URL=postgresql://postgres:postgres@your_own_one_please
```

Generate the Prisma client and apply development migrations:

```bash
pnpm --filter @repo/db exec prisma generate
pnpm --filter @repo/db exec prisma migrate dev
```

For a production database, apply committed migrations with:

```bash
pnpm --filter @repo/db exec prisma migrate deploy
```

### 3. Configure the applications

Use the variable reference below. Do not commit real secrets or private keys.

### 4. Build shared packages and applications

```bash
pnpm build
```

### 5. Start local services

In separate terminals:

```bash
# Next.js on http://localhost:3000
pnpm --filter web dev

# Express on http://localhost:8080
pnpm --filter backend dev
```

To run the Kafka controller after building it:

```bash
pnpm --filter kafka-worker build
node apps/kafka-worker/dist/index.js
```

## Environment variables

### Web (`apps/web/.env.local`)

| Variable                 | Required                    | Description                                                                       |
| ------------------------ | --------------------------- | --------------------------------------------------------------------------------- |
| `APP_URL`                | Production                  | Public web app origin used to build GitHub setup callback redirects.              |
| `NEXT_PUBLIC_API_URL`    | Yes                         | Browser-visible API origin used by signup and login.                              |
| `BACKEND_URL`            | Yes                         | Server-side API origin used by the GitHub callback and repository loader.         |
| `GITHUB_APP_SLUG`        | One GitHub install variable | GitHub App slug used to build `https://github.com/apps/{slug}/installations/new`. |
| `GITHUB_APP_INSTALL_URL` | One GitHub install variable | Explicit installation URL; takes precedence over the slug.                        |

If neither variable is configured, the install endpoint returns the user to `/repositories?github=not-configured` and the UI displays a configuration warning.

### API (`apps/backend/.env`)

| Variable                | Required   | Description                                                            |
| ----------------------- | ---------- | ---------------------------------------------------------------------- |
| `DATABASE_URL`          | Yes        | PostgreSQL connection URL consumed by `@repo/db`.                      |
| `ACCESS_TOKEN_SECRET`   | Yes        | Secret used to sign and verify six-hour access tokens.                 |
| `REFRESH_TOKEN_SECRET`  | Yes        | Secret used to sign ten-day refresh tokens.                            |
| `WEB_APP_URL`           | Yes        | Allowed credentialed CORS origin; defaults to `http://localhost:3000`. |
| `COOKIE_DOMAIN`         | Production | Shared parent domain when web and API use separate subdomains.         |
| `GITHUB_APP_ID`         | Yes        | GitHub App ID used to sign App JWTs.                                   |
| `GITHUB_PRIVATE_KEY`    | Yes        | PEM or base64-encoded GitHub App private key.                          |
| `GITHUB_WEBHOOK_SECRET` | Yes        | Secret used to verify `X-Hub-Signature-256`.                           |
| `KAFKA_BROKER`          | For Kafka  | Comma-separated broker addresses.                                      |
| `KAFKA_SSL`             | For Kafka  | Set to `true` to enable the configured TLS object.                     |
| `KAFKA_CA_CERT`         | For Kafka  | Base64-encoded CA certificate.                                         |
| `KAFKA_ACCESS_CERT`     | For Kafka  | Base64-encoded client certificate.                                     |
| `KAFKA_ACCESS_KEY`      | For Kafka  | Base64-encoded client private key.                                     |

### Agents (`packages/agents/.env` or process environment)

| Variable              | Required                    | Description                                           |
| --------------------- | --------------------------- | ----------------------------------------------------- |
| `OPENAI_API_KEY`      | For summary/security agents | Used implicitly by `ChatOpenAI`.                      |
| `OPENROUTER_API_KEY`  | For bug agent               | API key for the OpenRouter-compatible endpoint.       |
| `OPENROUTER_SITE_URL` | No                          | Attribution URL; defaults to `http://localhost:3000`. |
| `OPENROUTER_APP_NAME` | No                          | Attribution name; defaults to `Peek-er`.              |

### Kafka/ECS controller (`apps/kafka-worker/.env`)

| Variable                | Required    | Description                                     |
| ----------------------- | ----------- | ----------------------------------------------- |
| `DATABASE_URL`          | Yes         | PostgreSQL connection URL.                      |
| `KAFKA_BROKER`          | Yes         | Comma-separated Kafka brokers.                  |
| `KAFKA_SSL`             | Yes for TLS | Enables Kafka TLS.                              |
| `KAFKA_CA_CERT`         | Yes         | Base64-encoded CA certificate.                  |
| `KAFKA_ACCESS_CERT`     | Yes         | Base64-encoded client certificate.              |
| `KAFKA_ACCESS_KEY`      | Yes         | Base64-encoded client private key.              |
| `GITHUB_APP_ID`         | Yes         | Numeric GitHub App ID used as the JWT issuer.   |
| `GITHUB_PRIVATE_KEY`    | Yes         | Base64-encoded GitHub App RSA private key.      |
| `REGION`                | Yes         | AWS region for the ECS client.                  |
| `CLUSTER`               | Yes         | ECS cluster name or ARN.                        |
| `TASK_DEFINITION`       | Yes         | Fargate task definition name or ARN.            |
| `TASK_WORKER_CONTAINER` | Yes         | Container override name in the task definition. |
| `SUBNET`                | Yes         | Comma-separated subnet IDs.                     |
| `SECURITY_GROUPS`       | Yes         | Comma-separated security-group IDs.             |

Example encoding for certificates or the GitHub private key:

```bash
base64 -w 0 private-key.pem
```

On macOS, use `base64 < private-key.pem | tr -d '\n'`.

## GitHub App setup

1. Create a GitHub App under a user or organization.
2. Configure its installation URL through `GITHUB_APP_SLUG` or `GITHUB_APP_INSTALL_URL`.
3. Set the GitHub App **Setup URL** to `http://localhost:3000/api/github/callback` locally, or `https://your-web-domain/api/github/callback` in production, and enable **Redirect on update**.
4. Point the webhook URL at the publicly reachable API, for example `https://api.example.com/github/webhook`, and configure the same webhook secret in `GITHUB_WEBHOOK_SECRET`.
5. Subscribe to `Installation` and `Installation repositories` events. Pull-request events will also be required when the review-trigger path is implemented.
6. Grant the permissions required by the intended worker flow:
   - Repository contents: read.
   - Metadata: read.
   - Pull requests: write if Peek-er will post reviews and inline comments.
7. Store the App ID and private key in both the API environment and any controller that requests installation tokens.
8. Apply the latest Prisma migration, sign in to Peek-er, and use **Connect GitHub repository** on `/repositories`.

## API and web routes

### API endpoints

| Method | Route                   | Authentication          | Current behavior                                                                                            |
| ------ | ----------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------- |
| `POST` | `/signup`               | Public                  | Creates a user and sets HTTP-only access and refresh cookies.                                               |
| `POST` | `/login`                | Public                  | Verifies credentials and refreshes both authentication cookies.                                             |
| `POST` | `/logout`               | Public                  | Clears authentication cookies.                                                                              |
| `GET`  | `/me`                   | Access cookie or bearer | Returns the current user.                                                                                   |
| `POST` | `/github/installations` | Access cookie or bearer | Verifies the installation with GitHub, associates it with the user, and synchronizes selected repositories. |
| `GET`  | `/github/installations` | Access cookie or bearer | Lists the current user's GitHub installations.                                                              |
| `GET`  | `/github/repositories`  | Access cookie or bearer | Lists synchronized GitHub repositories.                                                                     |
| `POST` | `/github/webhook`       | GitHub HMAC signature   | Records installation changes and resynchronizes repository access.                                          |
| `POST` | `/review-run`           | Access cookie or bearer | Placeholder for creating and publishing a PR review job.                                                    |

The API listens on port `8080` and currently allows credentialed CORS requests from `http://localhost:3000`.

### Web routes

| Route                                         | Purpose                                                                 |
| --------------------------------------------- | ----------------------------------------------------------------------- |
| `/`                                           | Marketing landing page.                                                 |
| `/signup`, `/login`                           | Authentication UI.                                                      |
| `/dashboard`                                  | Review overview and activity metrics.                                   |
| `/repositories`                               | Connected repository management and GitHub installation.                |
| `/repositories/[owner]/[repo]`                | Repository-level pull requests and health.                              |
| `/repositories/[owner]/[repo]/pulls/[number]` | Detailed agentic PR review workspace.                                   |
| `/repositories/[owner]/[repo]/chat`           | Repository question-and-answer UI.                                      |
| `/findings`                                   | Finding triage and filtering.                                           |
| `/settings`                                   | Provider, automation, indexing, and rule settings.                      |
| `/api/github/connect`                         | Server route that redirects to GitHub App installation.                 |
| `/api/github/callback`                        | GitHub Setup URL callback that completes and persists the installation. |

## Kafka contracts

Typed payloads live in `packages/kafka/src/kafka.producer.ts` and `kafka.consumer.ts`.

### Repository ingestion payload

Includes the event and schema version, repository/installation/provider IDs, owner, repository name, default branch, clone URL, ingestion mode, requester, and request timestamp. Supported modes are `initial`, `incremental`, and `reindex`.

### Pull-request review payload

Includes the repository, PR, review-run, and installation IDs plus owner, repository, PR number, base/head SHAs, and request timestamp.

### Comment payload

Includes the repository, PR, review-run, and installation IDs plus the GitHub location and request timestamp.

The intended topics are:

| Constant          | Current value        | Purpose                             |
| ----------------- | -------------------- | ----------------------------------- |
| `INGEST_JOB`      | `ingest-job`         | Clone and index repository context. |
| `REVIEW_SUMMARY`  | `review-summary-job` | Review processing/result flow.      |
| `COMMENT_SUMMARY` | `review-comment-job` | Posting comments to the provider.   |

> [!NOTE]
> The current producers also use literal `review-job` and `review-summary` topic names, while both review and comment consumers subscribe to `review-summary-job` and expect a `{ payload }` envelope. Normalize topic names and message envelopes before running the full pipeline.

## Development commands

Run commands from the repository root.

| Command                           | Description                                                 |
| --------------------------------- | ----------------------------------------------------------- |
| `pnpm dev`                        | Run all workspaces that define a persistent `dev` task.     |
| `pnpm build`                      | Build the monorepo according to the Turbo dependency graph. |
| `pnpm lint`                       | Run available workspace lint tasks.                         |
| `pnpm check-types`                | Run available workspace type checks.                        |
| `pnpm format`                     | Format TypeScript, TSX, and Markdown with Prettier.         |
| `pnpm --filter web dev`           | Run only the frontend on port `3000`.                       |
| `pnpm --filter web build`         | Create a production frontend build.                         |
| `pnpm --filter backend dev`       | Build and run the API on port `8080`.                       |
| `pnpm --filter @repo/db build`    | Generate Prisma Client and compile the database package.    |
| `pnpm --filter @repo/kafka build` | Compile Kafka contracts and utilities.                      |
| `pnpm --filter agents build`      | Compile the agent package.                                  |

The frontend additionally provides strict `lint` and `check-types` scripts. Backend, worker, Kafka, agents, and database packages currently rely primarily on their TypeScript build.

## Docker and deployment

Four container definitions are present:

| File                                       | Image responsibility                                                   |
| ------------------------------------------ | ---------------------------------------------------------------------- |
| `apps/web/Dockerfile`                      | Multi-stage Next.js standalone production server on port `3000`.       |
| `apps/backend/Dockerfile`                  | Builds shared Kafka/database packages and runs Express on port `8080`. |
| `apps/kafka-worker/worker.dockerfile`      | Builds the long-running Kafka/ECS controller.                          |
| `apps/kafka-worker/task-worker.dockerfile` | Adds Git and curl for an isolated repository clone/index task.         |

<!-- Example builds from the repository root:

```bash
docker build -f apps/web/Dockerfile -t peeker-web .
docker build -f apps/backend/Dockerfile -t peeker-backend .
docker build -f apps/kafka-worker/worker.dockerfile -t peeker-controller .
docker build -f apps/kafka-worker/task-worker.dockerfile -t peeker-task-worker .
```

The web image uses Next.js standalone output. The controller expects AWS credentials through the normal AWS SDK provider chain and launches Fargate tasks with a public IP, configured subnets, and security groups. -->

<!-- ## Security notes

Before a public deployment:

- Verify GitHub webhook signatures against the exact raw request body.
- Do not protect provider webhooks with end-user bearer-token middleware.
- Validate all webhook and API inputs with Zod before database or Kafka operations.
- Move allowed CORS origins into environment configuration.
- Use `secure: true` cookies in production and choose `SameSite` based on the deployed frontend/API topology.
- Do not persist raw refresh tokens. Store hashes, implement rotation and reuse detection, and model individual sessions/devices.
- Add refresh, logout, revocation, password-policy, rate-limit, and account-lockout flows.
- Return `401` for invalid authentication rather than the current `402` response.
- Never log GitHub installation tokens, JWTs, private keys, Kafka certificates, repository clone URLs containing credentials, or model prompts containing secrets.
- Give GitHub App and AWS IAM roles the minimum required permissions.
- Run cloned repositories in isolated, resource-limited tasks without executing repository code.
- Add secret scanning and redact sensitive content before sending diffs or repository context to model providers.
- Add tenant checks to every repository, PR, review, finding, and comment lookup. -->

## Known gaps and roadmap

High-priority work, based on the current source:

1. Replace the remaining dashboard, findings, PR, and chat mock data with authenticated API queries.
2. Add refresh-token rotation, revocation, protected-route middleware, and session/device management.
3. Move the installation/user relation to a workspace-aware join table for shared organization installations.
4. Fix GitHub installation-token request interpolation and request field naming in the controller.
5. Enable the ingestion producer after installation persistence.
6. Implement `kafka-worker.ts`: clone, parse, summarize, embed, and persist repository context without executing repository code.
7. Normalize Kafka topic constants, producer topic names, and consumer message envelopes.
8. Add a review worker that fetches PR diffs/context, invokes `reviewGraph`, stores findings, and schedules comments.
9. Connect `planAgents()` to dynamic graph routing and add dependency, performance, and test agents.
10. Post idempotent GitHub summary/inline comments and persist provider comment IDs.
11. Add observability: structured logs, traces, job retries, dead-letter topics, metrics, token usage, and cost reporting.
12. Add unit tests for planners/deduplication, API integration tests, Kafka contract tests, and GitHub end-to-end tests.
13. Add CI for formatting, linting, type checks, builds, migrations, tests, container scans, and dependency audits.

<!-- ## Contributing

1. Create a focused branch.
2. Keep shared contracts in the owning package instead of duplicating types across apps.
3. Run the relevant checks before opening a pull request:

   ```bash
   pnpm format
   pnpm lint
   pnpm check-types
   pnpm build
   ```

4. Include migrations for schema changes.
5. Document new environment variables and never commit secrets.
6. For Kafka changes, update producers, consumers, topic constants, and this README together. -->
