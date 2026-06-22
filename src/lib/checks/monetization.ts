import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { CheckResult, ScanContext } from "../mcp/types";

// MCPCheckup never invokes a server's tools, so it can never observe an actual
// HTTP 402 response. This only looks for the server *documenting* a pay-per-call
// model in text an agent would already read (tool descriptions, instructions),
// which is the only signal available without crossing that line.
const PAYMENT_HINT_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /\bx402\b/i, label: "x402 protocol mention" },
  { pattern: /\b(usdc|stablecoin)\b[^.]{0,40}\bpay(ment|ing)?\b|\bpay(ment|ing)?\b[^.]{0,40}\b(usdc|stablecoin)\b/i, label: "stablecoin payment mention" },
  { pattern: /\bpay[- ]?per[- ]?(call|use|query|request|invocation)\b/i, label: "pay-per-call pricing mention" },
  { pattern: /\bhttp\s*402\b|\b402\s*payment required\b/i, label: "HTTP 402 payment-required mention" },
];

function scanText(text: string): string[] {
  const hits = new Set<string>();
  for (const { pattern, label } of PAYMENT_HINT_PATTERNS) {
    if (pattern.test(text)) hits.add(label);
  }
  return [...hits];
}

export function checkMonetization(ctx: ScanContext, tools: Tool[]): CheckResult {
  const hits = new Set<string>();

  for (const tool of tools) {
    scanText(`${tool.name} ${tool.description ?? ""}`).forEach((h) => hits.add(h));
  }

  const instructions = ctx.client?.getInstructions() ?? "";
  scanText(instructions).forEach((h) => hits.add(h));

  const detected = hits.size > 0;

  return {
    id: "monetization",
    title: "Monetization Signals (x402)",
    status: "ok",
    summary: detected
      ? `Server documents a pay-per-call model: ${[...hits].join(", ")}.`
      : "No pay-per-call monetization (e.g. x402) documented in tool descriptions or instructions.",
    data: { detected, hits: [...hits] },
    findings: detected
      ? [
          {
            severity: "info",
            title: "Server documents per-call payment",
            detail:
              `Detected: ${[...hits].join(", ")}. This is a neutral signal, not a security finding — ` +
              "a paid tool is not inherently riskier than a free one, but an agent calling it may incur real costs.",
          },
        ]
      : [],
  };
}
