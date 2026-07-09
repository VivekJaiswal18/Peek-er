import type { ChangedFile } from "./state";

export type AgentName =
  | "summary"
  | "dependency"
  | "security"
  | "performance"
  | "test"
  | "bug";

export type ChangePlan = {
  agents: AgentName[];
  reasons: Partial<Record<AgentName, string>>;
  contexts: Partial<Record<AgentName, ChangedFile[]>>;
};

export function planAgents(changedFiles: ChangedFile[]): ChangePlan {
  const agents = new Set<AgentName>(["summary"]);
  const reasons: Partial<Record<AgentName, string>> = {};
  const contexts: Partial<Record<AgentName, ChangedFile[]>> = {};

  const addAgent = (
    agent: AgentName,
    reason: string,
    files: ChangedFile[]
  ) => {
    agents.add(agent);
    reasons[agent] = reason;
    contexts[agent] = [...(contexts[agent] ?? []), ...files];
  };

  const dependencyFiles = changedFiles.filter((file) =>
    [
      "package.json",
      "package-lock.json",
      "pnpm-lock.yaml",
      "yarn.lock",
      "requirements.txt",
      "poetry.lock",
      "Pipfile",
      "go.mod",
      "go.sum",
      "Cargo.toml",
      "Cargo.lock",
    ].some((name) => file.path.endsWith(name))
  );

  if (dependencyFiles.length > 0) {
    addAgent(
      "dependency",
      "Dependency manifest or lockfile changed.",
      dependencyFiles
    );
  }

  const securityFiles = changedFiles.filter((file) =>
    /auth|login|session|jwt|permission|rbac|middleware|csrf|cors/i.test(
      file.path + "\n" + file.patch
    )
  );

  if (securityFiles.length > 0) {
    addAgent(
      "security",
      "Authentication, authorization, or security-sensitive code changed.",
      securityFiles
    );
  }

  const performanceFiles = changedFiles.filter((file) =>
    /query|select|join|loop|cache|pagination|batch|n\+1|useMemo|index/i.test(
      file.path + "\n" + file.patch
    )
  );

  if (performanceFiles.length > 0) {
    addAgent(
      "performance",
      "Potential performance-sensitive code changed.",
      performanceFiles
    );
  }

  const testFiles = changedFiles.filter((file) =>
    /\.(test|spec)\.|__tests__|tests\//i.test(file.path)
  );

  const sourceFiles = changedFiles.filter((file) =>
    /\.(ts|tsx|js|jsx|py|go|rs|java|kt|rb|php)$/i.test(file.path)
  );

  if (sourceFiles.length > 0) {
    addAgent("bug", "Source code changed.", sourceFiles);
  }

  if (sourceFiles.length > 0 && testFiles.length === 0) {
    addAgent(
      "test",
      "Source files changed without corresponding test changes.",
      sourceFiles
    );
  }

  return {
    agents: [...agents],
    reasons,
    contexts,
  };
}
