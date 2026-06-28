import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { CheckResult, ScanResult, Severity } from "./types";

export type VerdictStatus = "ok" | "warn" | "bad" | "unknown";

export interface VerdictQuestion {
  /** Plain-language question an agent operator actually cares about. */
  label: string;
  status: VerdictStatus;
  /** One-line answer in plain language. */
  answer: string;
}

export interface Verdict {
  /** One or two sentences summarizing what the result means. */
  headline: string;
  questions: VerdictQuestion[];
}

const SEVERITY_ORDER: Severity[] = ["info", "low", "medium", "high", "critical"];

function worstSeverity(findings: CheckResult["findings"]): Severity | null {
  return (findings ?? []).reduce<Severity | null>((acc, f) => {
    if (!acc) return f.severity;
    return SEVERITY_ORDER.indexOf(f.severity) > SEVERITY_ORDER.indexOf(acc) ? f.severity : acc;
  }, null);
}

const isSerious = (s: Severity | null) => s === "high" || s === "critical";
const isConcern = (s: Severity | null) => s === "low" || s === "medium";

// "Is it safe to connect?" — transport security + prompt-injection in model-facing text.
function safeToConnect(security?: CheckResult, network?: CheckResult): VerdictQuestion {
  const label = "Is it safe to connect?";
  if (!security || security.status === "skipped") {
    return { label, status: "unknown", answer: "The connection failed, so transport and content couldn't be analyzed." };
  }
  const findings = [...(security.findings ?? []), ...(network?.findings ?? [])];
  const worst = worstSeverity(findings);
  const has = (re: RegExp) => findings.some((f) => re.test(f.title));

  if (isSerious(worst)) {
    const answer = has(/plain HTTP/i)
      ? "Reachable over plain HTTP — traffic, including any tokens, is unencrypted."
      : has(/instruction-like|hidden\/invisible/i)
        ? "Tool text or server instructions contain prompt-injection patterns."
        : has(/certificate is expired/i)
          ? "The TLS certificate is expired."
          : "Serious transport or content issues were detected.";
    return { label, status: "bad", answer };
  }
  if (isConcern(worst)) {
    return { label, status: "warn", answer: "Connects over HTTPS, but with minor transport or header gaps." };
  }
  return { label, status: "ok", answer: "HTTPS with sound transport, and no prompt-injection patterns in tool text." };
}

// "Could a tool do something dangerous?" — sensitive/destructive capabilities.
function dangerousTools(security: CheckResult | undefined, schema: CheckResult | undefined, tools: Tool[]): VerdictQuestion {
  const label = "Could a tool do something dangerous?";
  if (!security || security.status === "skipped") {
    return { label, status: "unknown", answer: "Tools couldn't be inspected because the connection failed." };
  }
  const misleading = (schema?.findings ?? []).some((f) => /looks destructive/i.test(f.title) && f.severity !== "low");
  if (misleading) {
    return { label, status: "bad", answer: "A tool looks destructive but declares it isn't — misleading to an agent that trusts the hint." };
  }
  const flagged = new Set<string>();
  for (const f of security.findings ?? []) {
    if (/sensitive capability/i.test(f.title) && f.toolName) flagged.add(f.toolName);
  }
  for (const t of tools) {
    if (t.annotations?.destructiveHint === true) flagged.add(t.name);
  }
  if (flagged.size > 0) {
    return {
      label,
      status: "warn",
      answer: `${flagged.size} tool${flagged.size > 1 ? "s" : ""} can take powerful or destructive actions — review their scope before granting access.`,
    };
  }
  return { label, status: "ok", answer: "No tools are flagged for sensitive or destructive capabilities." };
}

// "Can you trust it over time?" — rug-pull detection against the previous scan.
function trustOverTime(history?: CheckResult): VerdictQuestion {
  const label = "Can you trust it over time?";
  if (!history || history.status === "skipped") {
    return { label, status: "unknown", answer: "First scan of this server — there's no history yet to compare against." };
  }
  const worst = worstSeverity(history.findings);
  if (isSerious(worst)) {
    return { label, status: "bad", answer: "A tool's description or schema changed since the last scan — a possible rug pull." };
  }
  if (isConcern(worst)) {
    return { label, status: "warn", answer: "Tools were added or removed since the last scan." };
  }
  return { label, status: "ok", answer: "Nothing changed since the last scan." };
}

// "Are the usage terms clear?" — governance.
function usageTerms(license?: CheckResult): VerdictQuestion {
  const label = "Are the usage terms clear?";
  if (!license || license.status === "skipped") {
    return { label, status: "unknown", answer: "Usage terms couldn't be checked." };
  }
  if ((license.findings ?? []).length === 0 && license.status === "ok") {
    return { label, status: "ok", answer: "Publishes a license, terms of service, or privacy policy." };
  }
  return { label, status: "warn", answer: "No clear usage terms or security disclosure policy were found." };
}

// Splice an answer into a sentence: drop the trailing period and lowercase only
// the first character, so acronyms like HTTP/TLS keep their casing.
function asClause(answer: string): string {
  const trimmed = answer.replace(/\.$/, "");
  return trimmed.charAt(0).toLowerCase() + trimmed.slice(1);
}

function headlineFor(questions: VerdictQuestion[]): string {
  const [connect, ...rest] = questions;

  const first =
    connect.status === "ok"
      ? "This server is safe to connect to over HTTPS."
      : connect.status === "warn"
        ? "This server connects over HTTPS, with some minor transport gaps."
        : connect.status === "bad"
          ? `This server is risky to connect to: ${asClause(connect.answer)}.`
          : "MCPCheckup couldn't fully analyze this server — the connection failed or was incomplete.";

  const bad = rest.find((q) => q.status === "bad");
  const warn = rest.find((q) => q.status === "warn");
  const second = bad
    ? `The main thing to review: ${asClause(bad.answer)}.`
    : warn
      ? `Worth noting: ${asClause(warn.answer)}.`
      : "Nothing else stands out.";

  return `${first} ${second}`;
}

/** Derives a plain-language verdict and a small set of yes/no-style questions
 *  from a completed scan — the "tell me in one line, then let me dig in" layer. */
export function buildVerdict(result: ScanResult, tools: Tool[]): Verdict {
  const byId = (id: string) => result.checks.find((c) => c.id === id);

  const questions: VerdictQuestion[] = [
    safeToConnect(byId("security"), byId("network")),
    dangerousTools(byId("security"), byId("schema-quality"), tools),
    trustOverTime(byId("history")),
    usageTerms(byId("license")),
  ];

  return { headline: headlineFor(questions), questions };
}
