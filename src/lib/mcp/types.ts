export type Severity = "info" | "low" | "medium" | "high" | "critical";

export interface Finding {
  severity: Severity;
  title: string;
  detail: string;
}

export interface CheckResult {
  id: string;
  title: string;
  status: "ok" | "warning" | "error" | "skipped";
  summary: string;
  data?: Record<string, unknown>;
  findings?: Finding[];
  durationMs?: number;
  error?: string;
}

export interface ScanResult {
  target: string;
  startedAt: string;
  finishedAt: string;
  checks: CheckResult[];
}

export interface ScanContext {
  url: URL;
  client: import("@modelcontextprotocol/sdk/client/index.js").Client | null;
  connectError: string | null;
  transportKind: "streamable-http" | "sse" | null;
  handshakeMs: number | null;
  protocolVersion: string | null;
}
