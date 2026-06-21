import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { CheckResult, Finding, ScanContext } from "../mcp/types";

const PROMPT_INJECTION_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /ignore (all|any|previous|prior) instructions/i, label: "instruction override phrasing" },
  { pattern: /system prompt/i, label: "reference to system prompt" },
  { pattern: /do not (tell|inform|mention) the user/i, label: "instruction to hide actions from the user" },
  { pattern: /you must always/i, label: "imperative override phrasing" },
  { pattern: /disregard/i, label: "disregard instruction phrasing" },
  { pattern: /<\s*(system|instructions?)\s*>/i, label: "embedded fake system/instruction tag" },
];

const DANGEROUS_CAPABILITY_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /\b(exec|execute|eval|shell|bash|subprocess|spawn)\b/i, label: "code/command execution" },
  { pattern: /\b(rm |delete|unlink|remove)\b.*\b(file|directory|folder)\b/i, label: "destructive file operations" },
  { pattern: /\bsudo\b/i, label: "privilege escalation" },
  { pattern: /\b(curl|fetch|http request|arbitrary url)\b/i, label: "arbitrary network requests" },
  { pattern: /\bwrite\b.*\bfile\b/i, label: "filesystem write access" },
];

function scanText(text: string, patterns: { pattern: RegExp; label: string }[]): string[] {
  const hits = new Set<string>();
  for (const { pattern, label } of patterns) {
    if (pattern.test(text)) hits.add(label);
  }
  return [...hits];
}

function analyzeTool(tool: Tool): Finding[] {
  const findings: Finding[] = [];
  const haystack = `${tool.description ?? ""}`;

  const injectionHits = scanText(haystack, PROMPT_INJECTION_PATTERNS);
  if (injectionHits.length > 0) {
    findings.push({
      severity: "high",
      title: `Tool "${tool.name}" description contains suspicious instruction-like text`,
      detail: `Matched: ${injectionHits.join(", ")}. This could be a prompt-injection vector targeting the LLM reading this description.`,
    });
  }

  const dangerHits = scanText(`${tool.name} ${haystack}`, DANGEROUS_CAPABILITY_PATTERNS);
  if (dangerHits.length > 0) {
    findings.push({
      severity: "medium",
      title: `Tool "${tool.name}" may expose a sensitive capability`,
      detail: `Possible capability: ${dangerHits.join(", ")}. Review whether this tool's access is properly scoped and consented to.`,
    });
  }

  if (!tool.description || tool.description.trim().length < 10) {
    findings.push({
      severity: "low",
      title: `Tool "${tool.name}" has little or no description`,
      detail: "A missing or very short description makes it hard to audit what this tool actually does.",
    });
  }

  return findings;
}

export async function checkSecurity(
  ctx: ScanContext,
  tools: Tool[],
): Promise<CheckResult> {
  if (!ctx.client) {
    return {
      id: "security",
      title: "Security Heuristics",
      status: "skipped",
      summary: "Skipped because the connection failed.",
    };
  }

  const findings = tools.flatMap(analyzeTool);

  if (ctx.url.protocol === "http:") {
    findings.push({
      severity: "high",
      title: "Server is reachable over plain HTTP",
      detail: "Traffic to this MCP server is not encrypted in transit. Use HTTPS to prevent eavesdropping and tampering.",
    });
  }

  const highest = findings.reduce<Finding["severity"] | null>((acc, f) => {
    const order: Finding["severity"][] = ["info", "low", "medium", "high", "critical"];
    if (!acc) return f.severity;
    return order.indexOf(f.severity) > order.indexOf(acc) ? f.severity : acc;
  }, null);

  return {
    id: "security",
    title: "Security Heuristics",
    status: findings.length === 0 ? "ok" : highest === "high" || highest === "critical" ? "error" : "warning",
    summary:
      findings.length === 0
        ? "No obvious red flags detected in tool descriptions or transport."
        : `${findings.length} finding(s) detected.`,
    findings,
  };
}
