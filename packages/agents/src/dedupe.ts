export async function dedupeAgent(state: any) {
  const seen = new Set<string>();

  const findings = state.findings.filter((finding: any) => {
    const key = [
      finding.filePath,
      finding.line,
      finding.category,
      finding.title.toLowerCase(),
    ].join(":");

    if (seen.has(key)) return false;
    seen.add(key);

    return finding.confidence >= 0.7;
  });

  return { findings };
}