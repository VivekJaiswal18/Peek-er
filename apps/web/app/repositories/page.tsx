import Link from "next/link";
import { AppShell, Badge, SectionTitle } from "../components/app-shell";
import { repositories } from "../components/data";

export default function RepositoriesPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <SectionTitle
            title="Repositories"
            description="Connect repos, inspect indexing status, and start manual reviews for active pull requests."
          />
          <button className="w-fit rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
            Connect GitHub repo
          </button>
        </div>

        <div className="rounded-md border border-slate-200 bg-white">
          <div className="grid grid-cols-12 border-b border-slate-200 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <span className="col-span-5">Repository</span>
            <span className="col-span-2 hidden md:block">Language</span>
            <span className="col-span-2 hidden md:block">Open PRs</span>
            <span className="col-span-3 text-right">Status</span>
          </div>
          <div className="divide-y divide-slate-100">
            {repositories.map((repo) => (
              <Link
                className="grid grid-cols-12 items-center gap-3 px-4 py-4 hover:bg-slate-50"
                href={`/repositories/${repo.owner}/${repo.name}`}
                key={`${repo.owner}/${repo.name}`}
              >
                <div className="col-span-9 md:col-span-5">
                  <p className="text-sm font-semibold">
                    {repo.owner}/{repo.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Last run {repo.lastRun}
                  </p>
                </div>
                <p className="col-span-2 hidden text-sm text-slate-600 md:block">
                  {repo.language}
                </p>
                <p className="col-span-2 hidden text-sm text-slate-600 md:block">
                  {repo.openPulls}
                </p>
                <div className="col-span-3 flex justify-end">
                  <Badge
                    tone={
                      repo.risk === "High"
                        ? "red"
                        : repo.risk === "Medium"
                          ? "yellow"
                          : "green"
                    }
                  >
                    {repo.status}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
