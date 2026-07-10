import { AppShell, Badge, SectionTitle } from "../components/app-shell";

const rules = [
  "Block high-confidence security issues from auto-merge",
  "Comment only when confidence is above 0.72",
  "Treat auth, billing, and migrations as high-risk paths",
  "Include tests impacted by changed files in review context",
];

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <SectionTitle
          title="Settings"
          description="Configure provider connection, review rules, context indexing, and comment behavior."
        />

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-md border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold">Git provider</h2>
                <p className="mt-1 text-sm text-slate-500">
                  GitHub App installation and repository access.
                </p>
              </div>
              <Badge tone="green">Connected</Badge>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-medium text-slate-500">Owner</span>
                <input
                  className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm"
                  defaultValue="vivek"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-500">
                  Default branch
                </span>
                <input
                  className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm"
                  defaultValue="main"
                />
              </label>
            </div>
          </section>

          <section className="rounded-md border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold">Review automation</h2>
            <div className="mt-5 space-y-4">
              {[
                ["Review on PR open", true],
                ["Review on new commits", true],
                ["Post summary comment", true],
                ["Post every low-risk finding", false],
              ].map(([label, enabled]) => (
                <label
                  className="flex items-center justify-between gap-4 rounded-md border border-slate-200 p-3"
                  key={String(label)}
                >
                  <span className="text-sm font-medium">{label}</span>
                  <input
                    className="h-5 w-5 accent-orange-600"
                    defaultChecked={Boolean(enabled)}
                    type="checkbox"
                  />
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-md border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold">Context indexing</h2>
            <div className="mt-5 space-y-4">
              {[
                ["Code chunks", 82],
                ["Symbol summaries", 94],
                ["Repo maps", 100],
                ["Review memory", 76],
              ].map(([label, value]) => (
                <div key={String(label)}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{label}</span>
                    <span className="text-slate-500">{value}%</span>
                  </div>
                  <input
                    className="w-full accent-orange-600"
                    defaultValue={Number(value)}
                    max="100"
                    min="0"
                    type="range"
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-md border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold">Rules</h2>
            <div className="mt-5 space-y-3">
              {rules.map((rule) => (
                <div
                  className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700"
                  key={rule}
                >
                  {rule}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
