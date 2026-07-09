import {
  Annotation,
  type AnnotationRoot,
  type BaseChannel,
  type LastValue,
  type OverwriteValue,
} from "@langchain/langgraph";

export type ChangedFile = {
  path: string;
  patch: string;
};

export type ReviewFinding = {
  filePath: string;
  line: number;
  severity: "critical" | "high" | "medium" | "low";
  category: "bug" | "security" | "performance" | "test" | "maintainability";
  title: string;
  body: string;
  confidence: number;
};

export type ReviewAgentState = {
  jobId: string;
  repoName: string;
  pullNumber: number;
  diff: string;
  changedFiles: ChangedFile[];
  summary: string;
  findings: ReviewFinding[];
};

type ReviewStateDefinition = {
  jobId: LastValue<string>;
  repoName: LastValue<string>;
  pullNumber: LastValue<number>;
  diff: LastValue<string>;
  changedFiles: LastValue<ChangedFile[]>;
  summary: BaseChannel<string, string | OverwriteValue<string>>;
  findings: BaseChannel<
    ReviewFinding[],
    ReviewFinding[] | OverwriteValue<ReviewFinding[]>
  >;
};

export const ReviewState: AnnotationRoot<ReviewStateDefinition> =
  Annotation.Root({
  jobId: Annotation<string>(),
  repoName: Annotation<string>(),
  pullNumber: Annotation<number>(),
  diff: Annotation<string>(),
  changedFiles: Annotation<ChangedFile[]>(),
  // changedFiles: Annotation<Array<{ path: string; patch:  string }>>(),
  summary: Annotation<string>({
    reducer: (_current: string, update: string) => update,
    default: () => "",
  }),
  findings: Annotation<ReviewFinding[]>({
    reducer: (current: ReviewFinding[], update: ReviewFinding[]) => current.concat(update),
    default: () => [],
  }),
});
