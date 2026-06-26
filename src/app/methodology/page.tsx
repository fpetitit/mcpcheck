import Link from "next/link";

export const metadata = {
  title: "Methodology — MCPCheckup",
  description: "How MCPCheckup scores a remote MCP server: every check, every axis, every weight.",
};

interface CheckDoc {
  id: string;
  title: string;
  axis: string;
  summary: string;
  details: string[];
}

const AXES = [
  {
    key: "security",
    label: "Security",
    weight: "45%",
    description:
      "Whether the server, and the context it injects into an LLM, can be trusted. This axis carries the most weight because a malicious or compromised MCP server can manipulate any agent connected to it, regardless of how well it behaves on every other axis.",
  },
  {
    key: "reliability",
    label: "Reliability",
    weight: "25%",
    description:
      "Whether the server does what its handshake claims: it connects, negotiates a protocol version, and honestly reports the capabilities it lists in `initialize`.",
  },
  {
    key: "ergonomics",
    label: "Agent Ergonomics",
    weight: "20%",
    description:
      "Whether the server's tools, resources, and prompts are well-shaped for an LLM to consume: not too costly in context tokens, with metadata that helps an agent reason about what's safe to call.",
  },
  {
    key: "governance",
    label: "Governance",
    weight: "10%",
    description: "Whether basic operational/legal information about the server is published.",
  },
];

const CHECKS: CheckDoc[] = [
  {
    id: "connectivity",
    title: "Connectivity & Handshake",
    axis: "Reliability",
    summary: "Can MCPCheckup establish an MCP connection at all, and how fast?",
    details: [
      "Attempts an MCP handshake over Streamable HTTP, falling back to SSE.",
      "Records the transport used, handshake latency, server info, declared capabilities, and any server instructions.",
      "If the connection fails outright, every other check downstream is skipped or marked accordingly — a server that can't be reached can't be scored on anything else.",
    ],
  },
  {
    id: "protocol-version",
    title: "Protocol Version",
    axis: "Reliability",
    summary: "Which version of the MCP spec did the server negotiate?",
    details: [
      "Compares the negotiated protocol version against the latest version known to the SDK.",
      "Flags servers that fail to negotiate any version.",
      "Surfaces an informational note about upcoming spec changes so server operators know what's coming.",
    ],
  },
  {
    id: "inventory",
    title: "Tools, Resources & Prompts",
    axis: "Reliability",
    summary: "What does the server expose, and does it match what it claimed to support?",
    details: [
      "Lists tools, resources, resource templates, and prompts.",
      "\"Capability honesty\": if the server's `initialize` response declares a capability (e.g. \"tools\") but the corresponding list call (`tools/list`) fails, that's flagged as a finding — the server is lying about what it supports. Simply not declaring a capability is not penalized.",
    ],
  },
  {
    id: "security",
    title: "Security Heuristics",
    axis: "Security",
    summary: "Is the model-facing text trying to manipulate the LLM reading it, and is the transport secure?",
    details: [
      "Tool descriptions are model-facing context, not documentation for a human — an LLM reads them before it ever decides which tool to call. This check scans tool descriptions, individual parameter descriptions, and the server's connection-time `instructions` for prompt-injection phrasing (e.g. \"ignore previous instructions\", \"do not tell the user\", fake `<system>` tags).",
      "Scans the same text for hidden/invisible Unicode characters (zero-width spaces, bidirectional overrides) that can hide instructions from a human reviewer while remaining fully readable to the model.",
      "Flags tool names/descriptions that suggest a sensitive capability (code execution, filesystem writes, arbitrary network requests, privilege escalation) so reviewers know to check the actual access scope.",
      "Flags tools with little or no description, since an unreviewable tool is a smaller version of the same problem.",
      "Flags plain HTTP transport (no TLS), since traffic — including any auth tokens — travels unencrypted.",
    ],
  },
  {
    id: "network",
    title: "Network & TLS",
    axis: "Security",
    summary: "Is the transport layer itself sound?",
    details: [
      "Checks the TLS certificate's validity window, flagging expired or soon-to-expire certificates.",
      "Checks for common HTTP security headers (HSTS, X-Content-Type-Options, X-Frame-Options, CSP).",
      "Flags a wide-open CORS policy (`Access-Control-Allow-Origin: *`), which lets any website call the server from a browser context.",
    ],
  },
  {
    id: "history",
    title: "Change History",
    axis: "Security",
    summary: "Has anything changed since the last time MCPCheckup scanned this exact server?",
    details: [
      "This is the only check that compares a scan against the past, and it exists specifically to catch \"rug pulls\": a tool an agent already trusts by name silently starts doing something different.",
      "Each scan is stored (when a database is configured). On the next scan of the same target, the current tool list is diffed against the most recent prior scan.",
      "A tool whose description or input schema changed since the last scan is flagged at high severity — nothing about a live MCP connection otherwise signals that change to an agent that already trusts the tool.",
      "Added tools, removed tools, and significant score drops since the last scan are also reported, at lower severity.",
      "Shows as \"skipped\" on the first scan of a target (nothing to compare against yet), or if no database is configured for this deployment.",
    ],
  },
  {
    id: "context-footprint",
    title: "Context Footprint",
    axis: "Agent Ergonomics",
    summary: "How many tokens of context does this server's manifest cost on every single turn?",
    details: [
      "Every tool, resource, resource template, and prompt the server declares gets serialized into the model's context before the conversation even starts — on every turn, whether or not any of it gets used.",
      "Counts tokens (via a GPT tokenizer) for the combined manifest and flags large totals at two thresholds (warning, then error).",
      "Separately flags individual tools whose own description/schema are unusually verbose, since trimming those pays off regardless of overall manifest size.",
    ],
  },
  {
    id: "schema-quality",
    title: "Annotations & Schema Quality",
    axis: "Agent Ergonomics",
    summary: "Can an agent reason about whether a tool call is safe, and is the input schema even valid?",
    details: [
      "Tool annotations (`readOnlyHint`, `destructiveHint`, `idempotentHint`, `openWorldHint`) are hints an agent's planner uses to decide whether a call needs confirmation or can be retried safely. A tool with none of these declared gives the agent nothing to reason about.",
      "Cross-checks a tool's name/description against its annotations: a tool that looks destructive (\"delete\", \"wipe\", \"purge\"...) but explicitly declares `destructiveHint: false` is actively misleading, which is worse than declaring nothing.",
      "Flags self-contradictory annotation combinations (e.g. `readOnlyHint: true` and `destructiveHint: true` at once).",
      "Validates that each tool's `inputSchema` is actually a well-formed JSON Schema (via Ajv) — an invalid schema means clients that validate arguments before calling the tool may reject every call, or skip validation entirely.",
    ],
  },
  {
    id: "license",
    title: "Usage Terms & Licensing",
    axis: "Governance",
    summary: "Are the usage terms for this server published anywhere?",
    details: [
      "A remote MCP server is a hosted service, not a GitHub repo, so a LICENSE file at the domain root (a source-repo convention) is rarely the right signal. This check treats a LICENSE file, a Terms of Service page, and a Privacy Policy page as equally valid evidence that usage terms exist, probing common paths for each (`/LICENSE`, `/terms`, `/privacy`, etc.).",
      "Also checks whether the server's connection-time instructions mention a license, terms of service, or privacy policy.",
      "Separately checks for a `/.well-known/security.txt` vulnerability disclosure policy, which gives security researchers a clear way to report issues responsibly.",
      "Both findings are informational: missing usage terms or a missing security.txt don't heavily penalize the score, but are flagged as unclear/missing governance signals.",
    ],
  },
  {
    id: "monetization",
    title: "Monetization Signals (x402)",
    axis: "Governance",
    summary: "Does the server document a pay-per-call model (e.g. the x402 protocol)?",
    details: [
      "MCPCheckup never invokes a server's tools, so it can never observe an actual HTTP 402 response. This check instead looks for the server documenting a pay-per-call model in text an agent would already read: tool names/descriptions and connection-time instructions.",
      "Looks for mentions of the x402 protocol, stablecoin/USDC payment language, \"pay-per-call\" pricing, or explicit HTTP 402 references.",
      "Purely informational and never penalizes the score: a paid tool is not inherently riskier than a free one, but it's useful for an agent operator to know a call may cost real money before it's made.",
    ],
  },
];

function statusPenaltyRow(status: string, penalty: number) {
  return (
    <tr className="border-t border-[#1f3a28]/60">
      <td className="py-1.5 pr-4 text-[#4ade80]/80">{status}</td>
      <td className="py-1.5 text-right text-[#4ade80]/60">-{penalty}</td>
    </tr>
  );
}

function findingPenaltyRow(severity: string, penalty: number) {
  return (
    <tr className="border-t border-[#1f3a28]/60">
      <td className="py-1.5 pr-4 text-[#4ade80]/80">{severity}</td>
      <td className="py-1.5 text-right text-[#4ade80]/60">{penalty === 0 ? "0" : `-${penalty}`}</td>
    </tr>
  );
}

export default function MethodologyPage() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-black px-6 py-16">
      <div className="flex w-full max-w-3xl flex-col items-center gap-3 text-center">
        <h1 className="glow-green text-3xl font-bold tracking-tight text-[#4ade80]">
          &gt; Methodology_
        </h1>
        <p className="max-w-2xl text-sm text-[#4ade80]/70">
          What MCPCheckup actually checks, how each finding turns into a penalty, and how the
          per-axis scores combine into the final grade.
        </p>
        <Link href="/" className="text-xs font-medium text-[#fb923c] underline-offset-4 hover:underline">
          &larr; back to the scanner
        </Link>
      </div>

      <div className="mt-12 w-full max-w-3xl rounded-lg border border-[#1f3a28] bg-black p-6">
        <h2 className="text-lg font-bold text-[#4ade80]">The core idea</h2>
        <p className="mt-3 text-sm leading-relaxed text-[#4ade80]/70">
          An MCP server&apos;s tool descriptions, parameter descriptions, and connection-time{" "}
          <code className="text-[#4ade80]/90">instructions</code> aren&apos;t passive documentation —
          they&apos;re text injected directly into an LLM&apos;s context, read and acted on before a
          human ever sees it. MCPCheckup treats &quot;quality&quot; accordingly: alongside
          conventional checks (does it connect, is TLS valid, is there a license), it specifically
          looks for content engineered to manipulate the model reading it, and for shapes that make
          an agent&apos;s job harder (bloated context, missing safety hints, dishonest capability
          claims).
        </p>
      </div>

      <div className="mt-8 w-full max-w-3xl rounded-lg border border-[#1f3a28] bg-black p-6">
        <h2 className="text-lg font-bold text-[#4ade80]">Scoring axes</h2>
        <p className="mt-3 text-sm text-[#4ade80]/70">
          Every check belongs to exactly one of four axes. Each axis is scored independently from
          0&ndash;100, then the overall score is a weighted average of the four axis scores.
        </p>
        <div className="mt-4 flex flex-col gap-4">
          {AXES.map((axis) => (
            <div key={axis.key} className="rounded-lg border border-[#1f3a28]/60 p-4">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-sm font-bold text-[#4ade80]">{axis.label}</h3>
                <span className="text-xs font-bold text-[#fb923c]">{axis.weight}</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[#4ade80]/60">{axis.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 w-full max-w-3xl rounded-lg border border-[#1f3a28] bg-black p-6">
        <h2 className="text-lg font-bold text-[#4ade80]">How penalties work</h2>
        <p className="mt-3 text-sm text-[#4ade80]/70">
          Each axis starts at 100. For every check in that axis, MCPCheckup subtracts a penalty for
          the check&apos;s overall status, plus a penalty for every individual finding it raised,
          based on severity. The result is clamped to 0&ndash;100.
        </p>
        <div className="mt-4 grid w-full grid-cols-1 gap-6 sm:grid-cols-2">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-[#4ade80]/60">
                <th className="pb-1.5 font-medium">Check status</th>
                <th className="pb-1.5 text-right font-medium">Penalty</th>
              </tr>
            </thead>
            <tbody>
              {statusPenaltyRow("error", 15)}
              {statusPenaltyRow("warning", 5)}
              {statusPenaltyRow("ok", 0)}
              {statusPenaltyRow("skipped", 0)}
            </tbody>
          </table>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-[#4ade80]/60">
                <th className="pb-1.5 font-medium">Finding severity</th>
                <th className="pb-1.5 text-right font-medium">Penalty</th>
              </tr>
            </thead>
            <tbody>
              {findingPenaltyRow("critical", 35)}
              {findingPenaltyRow("high", 20)}
              {findingPenaltyRow("medium", 10)}
              {findingPenaltyRow("low", 4)}
              {findingPenaltyRow("info", 0)}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-[#4ade80]/60">
          Grades: A &ge; 90, B &ge; 75, C &ge; 60, D &ge; 40, F below 40 &mdash; applied to the final
          weighted score.
        </p>
      </div>

      <div className="mt-8 w-full max-w-3xl rounded-lg border border-[#1f3a28] bg-black p-6">
        <h2 className="text-lg font-bold text-[#4ade80]">Every check</h2>
        <div className="mt-4 flex flex-col gap-5">
          {CHECKS.map((check) => (
            <div key={check.id} className="rounded-lg border border-[#1f3a28]/60 p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-sm font-bold text-[#4ade80]">{check.title}</h3>
                <span className="rounded-lg border border-[#fb923c]/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#fb923c]">
                  {check.axis}
                </span>
              </div>
              <p className="mt-2 text-xs text-[#4ade80]/70">{check.summary}</p>
              <ul className="mt-3 flex flex-col gap-1.5">
                {check.details.map((detail, i) => (
                  <li key={i} className="text-xs leading-relaxed text-[#4ade80]/60">
                    &middot; {detail}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <Link
        href="/"
        className="mt-10 rounded-lg border border-[#4ade80]/40 px-4 py-2 text-xs font-medium text-[#4ade80] transition-colors hover:border-[#4ade80] hover:bg-[#4ade80]/10"
      >
        &larr; back to the scanner
      </Link>
    </div>
  );
}
