import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { CheckResult, Finding } from "../mcp/types";
import type { ScanHistoryEntry } from "../history/store";

const SCORE_DROP_WARNING = 10;
const SCORE_DROP_ERROR = 25;

// The core "rug pull" threat model: an agent (or its user) approves a tool once
// based on its name/description/schema, then keeps calling it on trust. If the
// server later swaps in a different implementation behind the same tool name —
// a wider input schema, a description that now asks for something it didn't
// before — nothing about the live connection signals that to the agent. Only
// comparing against a *previous* scan of the same target can catch it.
function toolFingerprint(tool: Tool): string {
  return JSON.stringify({ description: tool.description ?? "", inputSchema: tool.inputSchema });
}

function previousTools(previous: ScanHistoryEntry): Tool[] {
  const inventory = previous.result.checks.find((c) => c.id === "inventory");
  return (inventory?.data?.tools as Tool[] | undefined) ?? [];
}

export function checkHistory(previous: ScanHistoryEntry | null, currentTools: Tool[], currentScore: number): CheckResult {
  if (!previous) {
    return {
      id: "history",
      title: "Change History",
      status: "skipped",
      summary: "No prior scan of this target to compare against.",
    };
  }

  const findings: Finding[] = [];
  const prevTools = previousTools(previous);
  const prevByName = new Map(prevTools.map((t) => [t.name, t]));
  const currentByName = new Map(currentTools.map((t) => [t.name, t]));

  for (const [name, tool] of currentByName) {
    const prevTool = prevByName.get(name);
    if (!prevTool) {
      findings.push({
        severity: "info",
        title: `New tool "${name}" since last scan`,
        detail: `This tool was not present in the scan from ${previous.scannedAt}.`,
      });
      continue;
    }
    if (toolFingerprint(prevTool) !== toolFingerprint(tool)) {
      findings.push({
        severity: "high",
        title: `Tool "${name}" changed since last scan`,
        detail:
          `The description and/or input schema for "${name}" differs from the scan taken at ${previous.scannedAt}. ` +
          "An agent or user that already trusts this tool by name would not notice the change. " +
          "Review the diff before continuing to trust this tool.",
      });
    }
  }

  for (const name of prevByName.keys()) {
    if (!currentByName.has(name)) {
      findings.push({
        severity: "low",
        title: `Tool "${name}" removed since last scan`,
        detail: `This tool was present in the scan from ${previous.scannedAt} but is no longer offered.`,
      });
    }
  }

  const scoreDrop = previous.score - currentScore;
  if (scoreDrop >= SCORE_DROP_ERROR) {
    findings.push({
      severity: "high",
      title: `Score dropped ${scoreDrop} points since last scan`,
      detail: `Score went from ${previous.score} (${previous.grade}) to ${currentScore} at ${previous.scannedAt}.`,
    });
  } else if (scoreDrop >= SCORE_DROP_WARNING) {
    findings.push({
      severity: "medium",
      title: `Score dropped ${scoreDrop} points since last scan`,
      detail: `Score went from ${previous.score} (${previous.grade}) to ${currentScore} at ${previous.scannedAt}.`,
    });
  }

  const highest = findings.reduce<Finding["severity"] | null>((acc, f) => {
    const order: Finding["severity"][] = ["info", "low", "medium", "high", "critical"];
    if (!acc) return f.severity;
    return order.indexOf(f.severity) > order.indexOf(acc) ? f.severity : acc;
  }, null);

  return {
    id: "history",
    title: "Change History",
    status: findings.length === 0 ? "ok" : highest === "high" || highest === "critical" ? "error" : "warning",
    summary:
      findings.length === 0
        ? `No changes detected since the last scan (${previous.scannedAt}).`
        : `${findings.length} change(s) detected since the last scan (${previous.scannedAt}).`,
    findings,
  };
}
