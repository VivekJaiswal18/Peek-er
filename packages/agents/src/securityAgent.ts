// packages/agents/src/agents/securityAgent.ts
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";

const SecurityFindingSchema = z.object({
  findings: z.array(
    z.object({
      filePath: z.string(),
      line: z.number(),
      severity: z.enum(["critical", "high", "medium", "low"]),
      category: z.literal("security"),
      title: z.string(),
      body: z.string(),
      confidence: z.number().min(0).max(1),
    })
  ),
});

const model = new ChatOpenAI({
  model: "gpt-4.1",
  temperature: 0,
}).withStructuredOutput(SecurityFindingSchema);

export async function securityAgent(state: any) {
  const result = await model.invoke([
    {
      role: "system",
      content: `
You are a security reviewer.
Look for auth bypasses, injection, unsafe deserialization, secret leaks,
SSRF, XSS, SQL injection, insecure crypto, and permission bugs.
Only return findings with concrete evidence from the diff.
`,
    },
    {
      role: "user",
      content: JSON.stringify(state.changedFiles, null, 2),
    },
  ]);

  return {
    findings: result.findings,
  };
}