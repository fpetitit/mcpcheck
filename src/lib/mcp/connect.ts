import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import type { ScanContext } from "./types";

const CONNECT_TIMEOUT_MS = 10_000;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms),
    ),
  ]);
}

function getNegotiatedProtocolVersion(
  transport: StreamableHTTPClientTransport | SSEClientTransport,
): string | null {
  if (transport instanceof StreamableHTTPClientTransport) {
    return transport.protocolVersion ?? null;
  }
  // SSEClientTransport stores it on a non-public field; there is no public getter.
  return (transport as unknown as { _protocolVersion?: string })._protocolVersion ?? null;
}

async function tryConnect(
  makeTransport: () => StreamableHTTPClientTransport | SSEClientTransport,
): Promise<{ client: Client; protocolVersion: string | null }> {
  const client = new Client({ name: "mcpcheck", version: "0.1.0" });
  const transport = makeTransport();
  await withTimeout(client.connect(transport), CONNECT_TIMEOUT_MS, "MCP handshake");
  return { client, protocolVersion: getNegotiatedProtocolVersion(transport) };
}

// Optional Authorization header value (e.g. "Bearer xyz") forwarded to the
// server on every request, so callers can test tools on authenticated servers.
export async function connectToServer(url: URL, authorization?: string): Promise<ScanContext> {
  const start = Date.now();
  const requestInit = authorization
    ? { headers: { Authorization: authorization } }
    : undefined;

  try {
    const { client, protocolVersion } = await tryConnect(
      () => new StreamableHTTPClientTransport(url, { requestInit }),
    );
    return {
      url,
      client,
      connectError: null,
      transportKind: "streamable-http",
      handshakeMs: Date.now() - start,
      protocolVersion,
    };
  } catch (streamableError) {
    try {
      const sseStart = Date.now();
      const { client, protocolVersion } = await tryConnect(
        () => new SSEClientTransport(url, { requestInit }),
      );
      return {
        url,
        client,
        connectError: null,
        transportKind: "sse",
        handshakeMs: Date.now() - sseStart,
        protocolVersion,
      };
    } catch (sseError) {
      const message =
        streamableError instanceof Error ? streamableError.message : String(streamableError);
      const sseMessage = sseError instanceof Error ? sseError.message : String(sseError);
      return {
        url,
        client: null,
        connectError: `Streamable HTTP: ${message}; SSE: ${sseMessage}`,
        transportKind: null,
        handshakeMs: null,
        protocolVersion: null,
      };
    }
  }
}
