import { LATEST_PROTOCOL_VERSION } from "@modelcontextprotocol/sdk/types.js";
import type { CheckResult, ScanContext } from "../mcp/types";

const UPCOMING_VERSION = "2026-07-28";
const UPCOMING_RELEASE_NOTE =
  "MCP's next major spec version, 2026-07-28, is in release candidate as of mid-2026 and due for " +
  "final publication on that date. It introduces a stateless protocol core (no more initialize " +
  "handshake or sticky sessions, so servers can run behind a plain round-robin load balancer), a " +
  "new Extensions framework (including MCP Apps and Tasks), several OAuth/OIDC hardening changes, " +
  "and starts a 12-month deprecation window for Roots, Sampling, and Logging.";

export async function checkProtocolVersion(ctx: ScanContext): Promise<CheckResult> {
  if (!ctx.client) {
    return {
      id: "protocol-version",
      title: "Protocol Version",
      status: "skipped",
      summary: "Skipped because the connection failed.",
    };
  }

  const negotiated = ctx.protocolVersion;
  const isLatestKnown = negotiated === LATEST_PROTOCOL_VERSION;

  return {
    id: "protocol-version",
    title: "Protocol Version",
    status: negotiated ? "ok" : "warning",
    summary: negotiated
      ? `Server negotiated MCP protocol version ${negotiated}.`
      : "Could not determine the negotiated protocol version.",
    data: {
      negotiatedVersion: negotiated,
      latestKnownVersion: LATEST_PROTOCOL_VERSION,
      isLatestKnown,
    },
    findings: [
      {
        severity: "info",
        title: `Upcoming spec version: ${UPCOMING_VERSION}`,
        detail: UPCOMING_RELEASE_NOTE,
      },
    ],
  };
}
