import Link from "next/link";
import { ThemeToggle } from "./components/theme-toggle";

const features = [
  {
    title: "PR reviews that understand your repo",
    body: "Peek-er retrieves symbols, repo maps, code chunks, tests, and past findings before it writes a comment.",
  },
  {
    title: "High-signal findings",
    body: "Security, reliability, testing, and maintainability issues are ranked by severity and confidence.",
  },
  {
    title: "Ask questions about code",
    body: "Use repo chat to ask where behavior lives, what changed in a PR, and which files are affected.",
  },
  {
    title: "Review memory",
    body: "Store project conventions, ignored false positives, and team rules so future reviews get sharper.",
  },
];

const reviewRows = [
  ["apps/backend/src/auth/routes.ts", "High", "Refresh token reuse"],
  ["apps/backend/src/auth/cookies.ts", "Medium", "Cookie policy"],
  ["packages/db/prisma/schema.prisma", "Low", "Session model"],
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link className="flex items-center gap-3" href="/">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-emerald-600 text-sm font-semibold text-white">
              P
            </span>
            <span>
              <span className="block text-sm font-semibold">Peek-er</span>
              <span className="block text-xs text-slate-500 dark:text-slate-400">
                Agentic code review
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300 md:flex">
            <a href="#features">Features</a>
            <a href="#workflow">Workflow</a>
            <Link href="/dashboard">Dashboard</Link>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              className="hidden rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 sm:inline-flex"
              href="/login"
            >
              Login
            </Link>
            <Link
              className="rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
              href="/signup"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-20">
        <div className="flex flex-col justify-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
            AI code reviews for serious PRs
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-normal text-slate-950 dark:text-white sm:text-5xl lg:text-6xl">
            Peek-er
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            A CodeRabbit-style reviewer that indexes your repo, understands
            pull request context, posts useful comments, and lets your team ask
            questions about the codebase.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              className="rounded-md bg-emerald-600 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-emerald-700"
              href="/signup"
            >
              Start reviewing
            </Link>
            <Link
              className="rounded-md border border-slate-200 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              href="/login"
            >
              Login
            </Link>
          </div>
        </div>

        <div className="rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">PR #42 review</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  auth-refresh-token into main
                </p>
              </div>
              <span className="rounded border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700">
                High risk
              </span>
            </div>
          </div>
          <div className="grid gap-0 lg:grid-cols-[1fr_0.85fr]">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {reviewRows.map(([file, risk, title]) => (
                <div className="p-4" key={file}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-medium">{file}</p>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {risk}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    {title}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 lg:border-l lg:border-t-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Retrieved context
              </p>
              <div className="mt-3 space-y-3">
                {[
                  "Symbol: requireAuth",
                  "Repo map: Express + Prisma",
                  "Memory: httpOnly refresh cookie",
                  "Edge: routes -> token helpers",
                ].map((item) => (
                  <div
                    className="rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                    key={item}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="border-y border-slate-200 bg-white py-12 dark:border-slate-800 dark:bg-slate-900"
        id="features"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-normal">
              Built for repo-aware reviews
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              The reviewer combines PR diffs with semantic repo context instead
              of judging changed lines in isolation.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => (
              <article
                className="rounded-md border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950"
                key={feature.title}
              >
                <h3 className="text-sm font-semibold">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {feature.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8" id="workflow">
        <div className="grid gap-4 md:grid-cols-4">
          {["Connect repo", "Index context", "Review PR", "Ask questions"].map(
            (step, index) => (
              <div
                className="rounded-md border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
                key={step}
              >
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  0{index + 1}
                </p>
                <h3 className="mt-3 text-sm font-semibold">{step}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {[
                    "Install the GitHub app and choose repositories.",
                    "Store repo files, symbols, summaries, edges, and embeddings.",
                    "Create review runs with findings and posted comments.",
                    "Chat with the indexed repo and inspect source context.",
                  ][index]}
                </p>
              </div>
            ),
          )}
        </div>
      </section>
    </main>
  );
}
