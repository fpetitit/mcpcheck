import Ajv from "ajv";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { CheckResult, Finding } from "../mcp/types";

// readOnlyHint/destructiveHint/idempotentHint/openWorldHint are *hints*, not
// guarantees, but an agent's planner relies on them to decide whether a tool
// call needs confirmation or can be retried/parallelized safely. A tool with
// no annotations at all gives the agent nothing to reason about; a tool whose
// name/description scream "destructive" but says readOnlyHint:true is actively
// misleading, which is worse than saying nothing.
const DESTRUCTIVE_HINT_PATTERN =
  /\b(delete|remove|destroy|drop|purge|wipe|kill|terminate|truncate|format|reset)\b/i;

const ajv = new Ajv({ strict: false, allowUnionTypes: true });

function looksDestructive(tool: Tool): boolean {
  return DESTRUCTIVE_HINT_PATTERN.test(`${tool.name} ${tool.description ?? ""}`);
}

function analyzeAnnotations(tool: Tool): Finding[] {
  const findings: Finding[] = [];
  const annotations = tool.annotations;

  if (!annotations || Object.keys(annotations).length === 0) {
    findings.push({
      severity: "low",
      title: `Tool "${tool.name}" has no annotations`,
      detail:
        "No readOnlyHint/destructiveHint/idempotentHint/openWorldHint metadata is declared. " +
        "Agents have nothing to reason about before deciding whether a call is safe to retry, " +
        "needs confirmation, or can run unattended.",
    });
    return findings;
  }

  if (looksDestructive(tool) && annotations.destructiveHint === false) {
    findings.push({
      severity: "medium",
      title: `Tool "${tool.name}" looks destructive but declares destructiveHint: false`,
      detail:
        "The tool's name or description suggests it deletes, removes, or otherwise destroys data, " +
        "but it explicitly claims to be non-destructive. An agent trusting this hint could perform " +
        "an unsafe action without confirmation.",
    });
  } else if (looksDestructive(tool) && annotations.destructiveHint === undefined) {
    findings.push({
      severity: "low",
      title: `Tool "${tool.name}" looks destructive but doesn't declare destructiveHint`,
      detail:
        "The tool's name or description suggests a destructive action, but destructiveHint is " +
        "unset. Declaring it explicitly lets agents require confirmation before calling it.",
    });
  }

  if (annotations.readOnlyHint === true && annotations.destructiveHint === true) {
    findings.push({
      severity: "low",
      title: `Tool "${tool.name}" declares contradictory annotations`,
      detail: "readOnlyHint and destructiveHint are both true, which is self-contradictory.",
    });
  }

  return findings;
}

function analyzeSchemaValidity(tool: Tool): Finding[] {
  try {
    ajv.compile(tool.inputSchema as object);
    return [];
  } catch (err) {
    return [
      {
        severity: "high",
        title: `Tool "${tool.name}" has an invalid input schema`,
        detail:
          `The declared inputSchema is not a valid JSON Schema: ${err instanceof Error ? err.message : String(err)}. ` +
          "Clients/agents that validate arguments before calling the tool may reject every call, or " +
          "skip validation entirely and pass through unchecked input.",
      },
    ];
  }
}

export function checkSchemaQuality(tools: Tool[]): CheckResult {
  if (tools.length === 0) {
    return {
      id: "schema-quality",
      title: "Annotations & Schema Quality",
      status: "skipped",
      summary: "No tools to inspect.",
    };
  }

  const findings = tools.flatMap((tool) => [...analyzeAnnotations(tool), ...analyzeSchemaValidity(tool)]);
  const annotatedCount = tools.filter((t) => t.annotations && Object.keys(t.annotations).length > 0).length;

  const highest = findings.reduce<Finding["severity"] | null>((acc, f) => {
    const order: Finding["severity"][] = ["info", "low", "medium", "high", "critical"];
    if (!acc) return f.severity;
    return order.indexOf(f.severity) > order.indexOf(acc) ? f.severity : acc;
  }, null);

  return {
    id: "schema-quality",
    title: "Annotations & Schema Quality",
    status:
      findings.length === 0 ? "ok" : highest === "high" || highest === "critical" ? "error" : "warning",
    summary: `${annotatedCount}/${tools.length} tool(s) declare annotations. ${findings.length} finding(s).`,
    data: { annotatedCount, totalTools: tools.length },
    findings,
  };
}
