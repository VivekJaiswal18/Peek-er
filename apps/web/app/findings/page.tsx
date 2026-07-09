import { AppShell, Badge, SectionTitle } from "../components/app-shell";
import { findings } from "../components/data";

export default function FindingsPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <SectionTitle
          title="Findings"
          description="Review and triage AI-detected issues before they become posted pull request comments."
        />

        <div className="grid gap-4 md:grid-cols-4">
          {["All", "Security", "Reliability", "Testing"].map((filter) => (
            <button
              className="rounded-md border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
              key={filter}
            >
              {filter}
            </button>
          ))}
        </div>

        <section className="rounded-md border border-slate-200 bg-white">
          <div className="grid grid-cols-12 border-b border-slate-200 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <span className="col-span-6">Finding</span>
            <span className="col-span-2 hidden md:block">Category</span>
            <span className="col-span-2 hidden md:block">Severity</span>
            <span className="col-span-6 text-right md:col-span-2">Location</span>
          </div>
          <div className="divide-y divide-slate-100">
            {findings.map((finding) => (
              <article className="grid grid-cols-12 gap-3 px-4 py-4" key={finding.title}>
                <div className="col-span-12 md:col-span-6">
                  <p className="text-sm font-semibold">{finding.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {finding.detail}
                  </p>
                </div>
                <div className="col-span-4 hidden md:block">
                  <Badge tone="blue">{finding.category}</Badge>
                </div>
                <div className="col-span-4 hidden md:block">
                  <Badge tone={finding.severity === "High" ? "red" : "yellow"}>
                    {finding.severity}
                  </Badge>
                </div>
                <div className="col-span-12 text-left md:col-span-2 md:text-right">
                  <p className="break-words text-xs text-slate-500">
                    {finding.file}:{finding.line}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
