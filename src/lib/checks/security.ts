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

// Zero-width spaces/joiners, bidirectional overrides, word joiner, BOM — characters
// that render invisibly but are still read by the model, a common way to smuggle
// instructions past a human reviewer.
const HIDDEN_CHAR_PATTERN = /[\u200B-\u200F\u202A-\u202E\u2060-\u2064\uFEFF]/;

function scanText(text: string, patterns: { pattern: RegExp; label: string }[]): string[] {
  const hits = new Set<string>();
  for (const { pattern, label } of patterns) {
    if (pattern.test(text)) hits.add(label);
  }
  return [...hits];
}

// Runs injection heuristics over a single piece of model-facing text (a tool
// description, a parameter description, or the server's instructions).
function injectionFindings(location: string, text: string, toolName?: string): Finding[] {
  const findings: Finding[] = [];
  if (!text) return findings;

  const injectionHits = scanText(text, PROMPT_INJECTION_PATTERNS);
  if (injectionHits.length > 0) {
    findings.push({
      severity: "high",
      title: `${location} contains suspicious instruction-like text`,
      detail: `Matched: ${injectionHits.join(", ")}. This could be a prompt-injection vector targeting the LLM reading it.`,
      toolName,
    });
  }

  if (HIDDEN_CHAR_PATTERN.test(text)) {
    findings.push({
      severity: "high",
      title: `${location} contains hidden/invisible characters`,
      detail:
        "Zero-width or bidirectional-override characters can hide instructions from a human reviewer while remaining visible to the model.",
      toolName,
    });
  }

  return findings;
}

// Pulls the human/model-readable description out of each declared parameter so it
// can be scanned the same way a tool description is — parameter descriptions are
// injected into the model's context too.
function paramDescriptions(tool: Tool): { name: string; description: string }[] {
  const properties = tool.inputSchema?.properties;
  if (!properties || typeof properties !== "object") return [];

  const out: { name: string; description: string }[] = [];
  for (const [name, schema] of Object.entries(properties)) {
    if (schema && typeof schema === "object" && "description" in schema) {
      const description = (schema as { description?: unknown }).description;
      if (typeof description === "string") out.push({ name, description });
    }
  }
  return out;
}

function analyzeTool(tool: Tool): Finding[] {
  const findings: Finding[] = [];
  const description = tool.description ?? "";

  findings.push(...injectionFindings(`Tool "${tool.name}" description`, description, tool.name));

  for (const param of paramDescriptions(tool)) {
    findings.push(
      ...injectionFindings(
        `Tool "${tool.name}" parameter "${param.name}" description`,
        param.description,
        tool.name,
      ),
    );
  }

  const dangerHits = scanText(`${tool.name} ${description}`, DANGEROUS_CAPABILITY_PATTERNS);
  if (dangerHits.length > 0) {
    // Informational, not a penalty: a tool *having* a capability (fetch, write,
    // execute…) isn't a vulnerability — it's a prompt to review whether the
    // access is properly scoped. Scoring it would punish perfectly normal tools.
    findings.push({
      severity: "info",
      title: `Tool "${tool.name}" may expose a sensitive capability`,
      detail: `Possible capability: ${dangerHits.join(", ")}. Review whether this tool's access is properly scoped and consented to.`,
      toolName: tool.name,
    });
  }

  if (!tool.description || tool.description.trim().length < 10) {
    findings.push({
      severity: "low",
      title: `Tool "${tool.name}" has little or no description`,
      detail: "A missing or very short description makes it hard to audit what this tool actually does.",
      toolName: tool.name,
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

  // The server's instructions are injected into the model's context at connection
  // time, before any tool is even selected, so injection here is at least as
  // dangerous as in a tool description.
  const instructions = ctx.client.getInstructions();
  if (instructions) {
    findings.push(...injectionFindings("Server instructions", instructions));
  }

  if (ctx.url.protocol === "http:") {
    findings.push({
      severity: "high",
      title: "Server is reachable over plain HTTP",
      detail: "Traffic to this MCP server is not encrypted in transit. Use HTTPS to prevent eavesdropping and tampering.",
    });
  }

  // Info-only findings are advisory, so they don't make the check "warning" —
  // a server flagged solely for informational notes is still ok.
  const hasSerious = findings.some((f) => f.severity === "high" || f.severity === "critical");
  const hasConcern = findings.some((f) => f.severity === "low" || f.severity === "medium");

  return {
    id: "security",
    title: "Security Heuristics",
    status: hasSerious ? "error" : hasConcern ? "warning" : "ok",
    summary:
      findings.length === 0
        ? "No obvious red flags detected in tool descriptions, parameters, instructions, or transport."
        : `${findings.length} finding(s) detected.`,
    findings,
  };
}
