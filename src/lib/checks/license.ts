import type { CheckResult, ScanContext } from "../mcp/types";

const CANDIDATE_PATHS = ["/LICENSE", "/LICENSE.md", "/LICENSE.txt", "/.well-known/security.txt"];

async function probePath(base: URL, path: string): Promise<{ path: string; status: number } | null> {
  try {
    const target = new URL(path, base);
    const res = await fetch(target, { method: "GET", redirect: "follow" });
    if (res.ok) return { path, status: res.status };
    return null;
  } catch {
    return null;
  }
}

export async function checkLicense(ctx: ScanContext): Promise<CheckResult> {
  const root = new URL("/", ctx.url);
  const probes = await Promise.all(CANDIDATE_PATHS.map((p) => probePath(root, p)));
  const found = probes.filter((p): p is { path: string; status: number } => p !== null);

  const instructions = ctx.client?.getInstructions() ?? null;
  const mentionsLicense = instructions ? /licen[sc]e/i.test(instructions) : false;

  const hasInfo = found.length > 0 || mentionsLicense;

  return {
    id: "license",
    title: "License Information",
    status: hasInfo ? "ok" : "warning",
    summary: hasInfo
      ? `License information found at: ${found.map((f) => f.path).join(", ") || "server instructions"}.`
      : "No license file or license mention found.",
    data: {
      foundPaths: found.map((f) => f.path),
      mentionedInInstructions: mentionsLicense,
    },
    findings: hasInfo
      ? []
      : [
          {
            severity: "info",
            title: "No license information published",
            detail: "Could not find a LICENSE file or license reference. Usage terms for this MCP server are unclear.",
          },
        ],
  };
}
