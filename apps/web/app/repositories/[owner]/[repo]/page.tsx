import Link from "next/link";
import { AppShell, Badge, SectionTitle, StatCard } from "../../../components/app-shell";
import { contextItems, findings, pullRequests } from "../../../components/data";

type Props = {
  params: Promise<{
    owner: string;
    repo: string;
  }>;
};

export default async function RepositoryPage({ params }: Props) {
  const { owner, repo } = await params;

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <SectionTitle
            title={`${owner}/${repo}`}
            description="Repository intelligence, pull request review queue, and semantic context used by the AI reviewer."
          />
          <div className="flex flex-wrap gap-2">
            <Link
              className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              href={`/repositories/${owner}/${repo}/chat`}
            >
              Ask repo
            </Link>
            <button className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
              Run review
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Indexed files" value="642" detail="31 changed today" />
          <StatCard label="Symbols" value="1,247" detail="94% extracted" />
          <StatCard label="Open PRs" value="4" detail="2 high confidence" />
          <StatCard label="Repo health" value="86%" detail="Medium risk" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
          <section className="rounded-md border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h2 className="text-sm font-semibold">Pull requests</h2>
              <Badge tone="blue">Webhook connected</Badge>
            </div>
            <div className="divide-y divide-slate-100">
              {pullRequests.map((pr) => (
                <Link
                  className="block p-4 hover:bg-slate-50"
                  href={`/repositories/${owner}/${repo}/pulls/${pr.number}`}
                  key={pr.number}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold">
                        #{pr.number} {pr.title}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {pr.files} files changed, {pr.findings} findings,{" "}
                        {pr.comments} comments
                      </p>
                    </div>
                    <Badge
                      tone={
                        pr.risk === "High"
                          ? "red"
                          : pr.risk === "Medium"
                            ? "yellow"
                            : "green"
                      }
                    >
                      {pr.status}
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
              <h2 className="text-sm font-semibold">Retrieved context</h2>
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
        </div>

        <section className="rounded-md border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="text-sm font-semibold">Recent findings</h2>
          </div>
          <div className="grid gap-3 p-4 md:grid-cols-2">
            {findings.map((finding) => (
              <div className="rounded-md border border-slate-200 p-4" key={finding.title}>
                <div className="flex items-center justify-between gap-3">
                  <Badge tone={finding.severity === "High" ? "red" : "yellow"}>
                    {finding.category}
                  </Badge>
                  <span className="text-xs text-slate-500">
                    {finding.file}:{finding.line}
                  </span>
                </div>
                <p className="mt-3 text-sm font-semibold">{finding.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {finding.detail}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
