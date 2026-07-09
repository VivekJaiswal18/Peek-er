import Link from "next/link";
import { AppShell, Badge, SectionTitle } from "../../../../components/app-shell";
import { contextItems } from "../../../../components/data";

type Props = {
  params: Promise<{
    owner: string;
    repo: string;
  }>;
};

const messages = [
  {
    role: "user",
    body: "Where is refresh token verification implemented?",
  },
  {
    role: "assistant",
    body:
      "Refresh token verification belongs in auth routes through verifyRefreshToken, then compares the raw cookie token against the stored refreshTokenHash.",
  },
  {
    role: "user",
    body: "What should the reviewer check before this auth PR merges?",
  },
  {
    role: "assistant",
    body:
      "Check cookie policy, token rotation, logout without a valid access token, and tests for missing, malformed, expired, and valid tokens.",
  },
];

export default async function RepoChatPage({ params }: Props) {
  const { owner, repo } = await params;

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <SectionTitle
            title={`Ask ${owner}/${repo}`}
            description="Question-answering over repo maps, symbols, code chunks, findings, and review memory."
          />
          <Link
            className="w-fit rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            href={`/repositories/${owner}/${repo}`}
          >
            Back to repo
          </Link>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.8fr]">
          <section className="flex min-h-[620px] flex-col rounded-md border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-4 py-3">
              <h2 className="text-sm font-semibold">Repo chat</h2>
            </div>
            <div className="flex-1 space-y-4 p-4">
              {messages.map((message, index) => (
                <div
                  className={`max-w-[86%] rounded-md border p-4 text-sm leading-6 ${
                    message.role === "user"
                      ? "ml-auto border-slate-900 bg-slate-950 text-white"
                      : "border-slate-200 bg-slate-50 text-slate-700"
                  }`}
                  key={`${message.role}-${index}`}
                >
                  {message.body}
                </div>
              ))}
            </div>
            <form className="border-t border-slate-200 p-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  className="h-11 flex-1 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  placeholder="Ask about architecture, files, tests, or a finding"
                />
                <button className="rounded-md bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                  Send
                </button>
              </div>
            </form>
          </section>

          <aside className="space-y-6">
            <section className="rounded-md border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <h2 className="text-sm font-semibold">Retrieved sources</h2>
                <Badge tone="green">5 hits</Badge>
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
            <section className="rounded-md border border-slate-200 bg-white p-4">
              <h2 className="text-sm font-semibold">Index coverage</h2>
              <div className="mt-4 space-y-3">
                {["Files", "Symbols", "Summaries", "Embeddings"].map(
                  (label, index) => (
                    <div key={label}>
                      <div className="mb-1 flex justify-between text-xs text-slate-500">
                        <span>{label}</span>
                        <span>{[98, 94, 86, 82][index]}%</span>
                      </div>
                      <div className="h-2 rounded bg-slate-100">
                        <div
                          className="h-2 rounded bg-emerald-500"
                          style={{ width: `${[98, 94, 86, 82][index]}%` }}
                        />
                      </div>
                    </div>
                  ),
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
