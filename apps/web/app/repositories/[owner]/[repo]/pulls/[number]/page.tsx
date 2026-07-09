import Link from "next/link";
import { AppShell, Badge, SectionTitle, StatCard } from "../../../../../components/app-shell";
import { contextItems, findings } from "../../../../../components/data";

type Props = {
  params: Promise<{
    owner: string;
    repo: string;
    number: string;
  }>;
};

const changedFiles = [
  {
    path: "apps/backend/src/auth/routes.ts",
    additions: 142,
    deletions: 18,
    risk: "High",
  },
  {
    path: "apps/backend/src/auth/tokens.ts",
    additions: 64,
    deletions: 4,
    risk: "Medium",
  },
  {
    path: "packages/db/prisma/schema.prisma",
    additions: 6,
    deletions: 1,
    risk: "Low",
  },
];

export default async function PullRequestPage({ params }: Props) {
  const { owner, repo, number } = await params;

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <SectionTitle
            title={`PR #${number}: Add refresh-token auth flow`}
            description={`${owner}/${repo} review run with findings, comments, related context, and changed-file risk.`}
          />
          <div className="flex flex-wrap gap-2">
            <Link
              className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              href={`/repositories/${owner}/${repo}`}
            >
              Back to repo
            </Link>
            <button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              Post comments
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Risk" value="High" detail="Security-sensitive code" />
          <StatCard label="Findings" value="5" detail="3 suggested comments" />
          <StatCard label="Changed files" value="9" detail="+248 / -31" />
          <StatCard label="Context hits" value="12" detail="5 strong matches" />
        </div>

        <section className="rounded-md border border-slate-200 bg-white p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-sm font-semibold">AI review summary</h2>
              <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
                The implementation follows the right access-token and
                refresh-token split. Before merge, harden refresh-token reuse,
                align cookie settings with deployment domains, and add coverage
                for expired access tokens.
              </p>
            </div>
            <Badge tone="red">High priority</Badge>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-md border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-4 py-3">
              <h2 className="text-sm font-semibold">Inline findings</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {findings.map((finding) => (
                <article className="p-4" key={finding.title}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold">{finding.title}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {finding.file}:{finding.line}
                      </p>
                    </div>
                    <Badge tone={finding.severity === "High" ? "red" : "yellow"}>
                      {finding.severity}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {finding.detail}
                  </p>
                  <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3 font-mono text-xs leading-6 text-slate-700">
                    Suggested: rotate refresh tokens, store only token hashes,
                    and reject reuse with session invalidation.
                  </div>
                </article>
              ))}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-md border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-4 py-3">
                <h2 className="text-sm font-semibold">Changed files</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {changedFiles.map((file) => (
                  <div className="p-4" key={file.path}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-medium">{file.path}</p>
                      <Badge
                        tone={
                          file.risk === "High"
                            ? "red"
                            : file.risk === "Medium"
                              ? "yellow"
                              : "green"
                        }
                      >
                        {file.risk}
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      +{file.additions} / -{file.deletions}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-md border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-4 py-3">
                <h2 className="text-sm font-semibold">RAG context</h2>
              </div>
              <div className="space-y-3 p-4">
                {contextItems.map((item) => (
                  <div
                    className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700"
                    key={item}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
