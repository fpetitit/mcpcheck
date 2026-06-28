// One-line "why this matters" rationale per check, surfaced inline in the result
// so the reasoning from the methodology page is available at the point of need.
export const CHECK_WHY: Record<string, string> = {
  connectivity:
    "If a server can't complete an MCP handshake, an agent can't use it at all — this is the baseline everything else builds on.",
  "protocol-version":
    "The negotiated protocol version determines which MCP features and safety guarantees an agent can rely on.",
  inventory:
    "What the server actually exposes — and whether it matches what it claimed in its handshake. A server that lies about its capabilities is a red flag.",
  security:
    "Tool descriptions and instructions are injected straight into an LLM's context, so manipulative or hidden text here can hijack any agent that connects.",
  network:
    "Weak transport (expired TLS, plain HTTP, wide-open CORS) exposes traffic — including any auth tokens — to eavesdropping or tampering.",
  history:
    "A tool an agent already trusts can silently change what it does (a “rug pull”); comparing against past scans is the only way to catch it.",
  "context-footprint":
    "Every tool and prompt the server declares costs context tokens on every turn, whether or not it's used — bloated manifests slow and dilute the agent.",
  "schema-quality":
    "Annotations and valid schemas let an agent reason about whether a call is safe to retry or needs confirmation; without them it's flying blind.",
  license:
    "Knowing the usage terms (license, ToS, privacy, security disclosure) matters before you depend on a hosted server in production.",
  monetization:
    "Surfacing a pay-per-call model lets an operator know a tool call may cost real money before an agent makes it.",
};
