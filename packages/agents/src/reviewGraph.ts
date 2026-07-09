import { StateGraph, START, END } from "@langchain/langgraph";
import { ReviewState } from "./state";
import { summaryAgent } from "./summaryAgent";
import { bugAgent } from "./bugAgent";
import { securityAgent } from "./securityAgent";
import { dedupeAgent } from "./dedupe";

export const reviewGraph: any = new StateGraph(ReviewState)
  .addNode("summary", summaryAgent)
  .addNode("bug_review", bugAgent)
  .addNode("security_review", securityAgent)
  .addNode("dedupe", dedupeAgent)

  .addEdge(START, "summary")
  .addEdge(START, "bug_review")
  .addEdge(START, "security_review")

  .addEdge("summary", "dedupe")
  .addEdge("bug_review", "dedupe")
  .addEdge("security_review", "dedupe")

  .addEdge("dedupe", END)
  .compile();



//   function routeAgents(state: ReviewState): string[] {
//   return state.plan.agents;
// }





// import { reviewGraph } from "@peek/agents/reviewGraph";

// export async function processReviewJob(job: ReviewJob) {
//   const result = await reviewGraph.invoke({
//     jobId: job.id,
//     repoName: job.repoName,
//     pullNumber: job.pullNumber,
//     diff: job.diff,
//     changedFiles: job.changedFiles,
//   });

//   await saveReviewResult(job.id, result.summary, result.findings);
//   await publishGithubReview(job, result.summary, result.findings);
// }


// 3 options
// import { reviewGraph } from "@peek/agents/reviewGraph";

// export async function processReviewJob(job: ReviewJob) {
//   const result = await reviewGraph.invoke({
//     jobId: job.id,
//     repoName: job.repoName,
//     pullNumber: job.pullNumber,
//     diff: job.diff,
//     changedFiles: job.changedFiles,
//   });

//   await saveReviewResult(job.id, result.summary, result.findings);
//   await publishGithubReview(job, result.summary, result.findings);
// }

// const model = new ChatOpenAI({
//   model: "gpt-4.1",
//   temperature: 0,
// }).withStructuredOutput(FindingSchema);

// const result = await model.invoke([
//   { role: "system", content: "You are a bug reviewer..." },
//   { role: "user", content: JSON.stringify(state.changedFiles) },
// ]);
// async function bugAgent(state) {
//   const result = await callOpenAIForBugReview(state.changedFiles);

//   return {
//     findings: result.findings,
//   };
// }
