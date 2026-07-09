import { z } from "zod";
import type {ReviewFinding}  from "./state";
import { ChatOpenAI } from "@langchain/openai";

const FindingSchema = z.object({
  findings: z.array(
    z.object({
      filePath: z.string(),
      line: z.number(),
      severity: z.enum(["critical", "high", "medium", "low"]),
      category: z.literal("bug"),
      title: z.string(),
      body: z.string(),
      confidence: z.number().min(0).max(1),
    })
  ),
});

const model = new ChatOpenAI({
  model: "openai/gpt-oss-120b:free",
  streamUsage: false,
  apiKey: process.env.OPENROUTER_API_KEY,
  temperature: 0,
  configuration: {
  baseURL: "https://openrouter.ai/api/v1",
   defaultHeaders: {
      "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "http://localhost:3000",
      "X-OpenRouter-Title": process.env.OPENROUTER_APP_NAME || "Peek-er",
    },
}}).withStructuredOutput(FindingSchema);

type BugAgentState = {
  repoName: string;
  pullNumber: number;
  diff: string;
  changedFiles: Array<{
    path: string;
    patch: string;
  }>;
};

export async function bugAgent(state: BugAgentState): Promise<{ findings: ReviewFinding[] }> {
  const result = await model.invoke([
    {
      role: "system",
      content: `
You are a bug-finding code reviewer.
Only report real correctness issues.
Do not nitpick style.
Only comment on lines present in the diff.
If uncertain, return no finding.
`,
    },
    {
      role: "user",
      content: `
Repository: ${state.repoName}
Pull Request: #${state.pullNumber}

Diff:
${state.diff}

Changed files:
${JSON.stringify(state.changedFiles, null, 2)}
`,
    },
  ]);

  return {
    findings: result.findings,
  };
}