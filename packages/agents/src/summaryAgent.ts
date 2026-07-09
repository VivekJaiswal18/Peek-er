import type { ReviewState } from "./state";
import { ChatOpenAI } from "@langchain/openai";

const model = new ChatOpenAI({
  model: "gpt-4.1-mini",
  temperature: 0.2,
});

export async function summaryAgent(state: typeof ReviewState.State) {
  const response = await model.invoke([
    {
      role: "system",
      content:
        "You are a senior code reviewer. Summarize the PR clearly and briefly.",
    },
    {
      role: "user",
      content: `
Repository: ${state.repoName}
PR: #${state.pullNumber}

Diff:
${state.diff}

Return:
1. What changed
2. Risk level
3. Areas reviewers should inspect
`,
    },
  ]);

  return {
    summary: String(response.content),
  };
}