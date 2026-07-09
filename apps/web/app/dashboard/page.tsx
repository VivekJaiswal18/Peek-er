import Link from "next/link";
import { AppShell, Badge, SectionTitle, StatCard } from "../components/app-shell";
import { findings, pullRequests, repositories } from "../components/data";

export default function Home() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <SectionTitle
            title="Review overview"
            description="Monitor AI review runs, risk, posted comments, and the repo context your reviewer is using."
          />
          <Link
            className="w-fit rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            href="/repositories/vivek/peek-er/pulls/42"
          >
            Open latest review
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Active repos" value="3" detail="2 reviewed today" />
          <StatCard label="Open PRs" value="13" detail="5 need attention" />
          <StatCard label="Findings" value="58" detail="9 high confidence" />
          <StatCard label="Context indexed" value="84%" detail="1,247 symbols" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
          <section className="rounded-md border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h2 className="text-sm font-semibold">Pull request queue</h2>
              <Link className="text-sm font-medium text-emerald-700" href="/repositories/vivek/peek-er">
                View repo
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {pullRequests.map((pr) => (
                <Link
                  className="block p-4 hover:bg-slate-50"
                  href={`/repositories/vivek/peek-er/pulls/${pr.number}`}
                  key={pr.number}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold">
                        #{pr.number} {pr.title}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {pr.branch} into {pr.base} by {pr.author}
                      </p>
                    </div>
                    <Badge tone={pr.risk === "High" ? "red" : pr.risk === "Medium" ? "yellow" : "green"}>
                      {pr.risk}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {pr.summary}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-md border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-4 py-3">
              <h2 className="text-sm font-semibold">Highest priority findings</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {findings.slice(0, 3).map((finding) => (
                <div className="p-4" key={finding.title}>
                  <div className="flex items-center justify-between gap-3">
                    <Badge tone={finding.severity === "High" ? "red" : "yellow"}>
                      {finding.severity}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      line {finding.line}
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-semibold">{finding.title}</p>
                  <p className="mt-1 truncate text-xs text-slate-500">
                    {finding.file}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          {repositories.map((repo) => (
            <Link
              className="rounded-md border border-slate-200 bg-white p-4 hover:border-emerald-300 hover:bg-emerald-50/30"
              href={`/repositories/${repo.owner}/${repo.name}`}
              key={`${repo.owner}/${repo.name}`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">
                  {repo.owner}/{repo.name}
                </p>
                <Badge tone={repo.risk === "High" ? "red" : repo.risk === "Medium" ? "yellow" : "green"}>
                  {repo.risk}
                </Badge>
              </div>
              <p className="mt-3 text-sm text-slate-500">
                {repo.openPulls} open PRs, {repo.findings} findings
              </p>
              <div className="mt-4 h-2 rounded bg-slate-100">
                <div
                  className="h-2 rounded bg-emerald-500"
                  style={{ width: `${repo.health}%` }}
                />
              </div>
            </Link>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
