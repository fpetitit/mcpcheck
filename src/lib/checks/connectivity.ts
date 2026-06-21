import type { CheckResult, ScanContext } from "../mcp/types";

export async function checkConnectivity(ctx: ScanContext): Promise<CheckResult> {
  if (!ctx.client) {
    return {
      id: "connectivity",
      title: "Connectivity & Handshake",
      status: "error",
      summary: "Unable to establish an MCP connection.",
      error: ctx.connectError ?? "Unknown connection error",
    };
  }

  const serverVersion = ctx.client.getServerVersion();
  const capabilities = ctx.client.getServerCapabilities();
  const instructions = ctx.client.getInstructions();

  return {
    id: "connectivity",
    title: "Connectivity & Handshake",
    status: "ok",
    summary: `Connected via ${ctx.transportKind} in ${ctx.handshakeMs}ms.`,
    data: {
      transport: ctx.transportKind,
      handshakeMs: ctx.handshakeMs,
      serverInfo: serverVersion ?? null,
      capabilities: capabilities ?? null,
      instructions: instructions ?? null,
    },
  };
}
