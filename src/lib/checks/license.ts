import type { CheckResult, Finding, ScanContext } from "../mcp/types";

// A remote MCP server is a hosted service, not a GitHub repo: probing for a
// LICENSE file at the domain root (the old approach) almost never finds
// anything, even for perfectly legitimate servers, because that's a
// source-repo convention, not a web-app one. Terms of Service / Privacy
// Policy pages are the equivalent "usage terms" signal for a hosted service,
// so they're treated as equally valid evidence here.
const LICENSE_PATHS = ["/LICENSE", "/LICENSE.md", "/LICENSE.txt"];
const TERMS_PATHS = ["/terms", "/terms-of-service", "/tos", "/privacy", "/privacy-policy", "/legal"];
const SECURITY_PATHS = ["/.well-known/security.txt"];

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

async function probeAll(root: URL, paths: string[]): Promise<string[]> {
  const probes = await Promise.all(paths.map((p) => probePath(root, p)));
  return probes.filter((p): p is { path: string; status: number } => p !== null).map((p) => p.path);
}

export async function checkLicense(ctx: ScanContext): Promise<CheckResult> {
  const root = new URL("/", ctx.url);
  const [licensePaths, termsPaths, securityPaths] = await Promise.all([
    probeAll(root, LICENSE_PATHS),
    probeAll(root, TERMS_PATHS),
    probeAll(root, SECURITY_PATHS),
  ]);

  const instructions = ctx.client?.getInstructions() ?? null;
  const mentionsLicense = instructions ? /licen[sc]e/i.test(instructions) : false;
  const mentionsTerms = instructions ? /\b(terms of service|terms & conditions|privacy policy)\b/i.test(instructions) : false;

  const hasLicense = licensePaths.length > 0 || mentionsLicense;
  const hasTerms = termsPaths.length > 0 || mentionsTerms;
  const hasUsageTerms = hasLicense || hasTerms;
  const hasSecurityPolicy = securityPaths.length > 0;

  const foundPaths = [...licensePaths, ...termsPaths, ...securityPaths];

  const findings: Finding[] = [];
  if (!hasUsageTerms) {
    findings.push({
      severity: "info",
      title: "No license or usage terms published",
      detail:
        "Could not find a LICENSE file, Terms of Service / Privacy Policy page, or a license/terms " +
        "mention in the server's connection-time instructions. Usage terms for this MCP server are unclear.",
    });
  }
  if (!hasSecurityPolicy) {
    findings.push({
      severity: "info",
      title: "No security.txt vulnerability disclosure policy",
      detail:
        "No /.well-known/security.txt was found. Publishing one gives security researchers a clear, " +
        "low-friction way to report issues responsibly.",
    });
  }

  return {
    id: "license",
    title: "Usage Terms & Licensing",
    status: hasUsageTerms ? "ok" : "warning",
    summary: hasUsageTerms
      ? `Usage terms found at: ${foundPaths.length > 0 ? foundPaths.join(", ") : "server instructions"}.`
      : "No license, Terms of Service, or Privacy Policy found.",
    data: {
      licensePaths,
      termsPaths,
      securityPaths,
      mentionedInInstructions: mentionsLicense || mentionsTerms,
    },
    findings,
  };
}
