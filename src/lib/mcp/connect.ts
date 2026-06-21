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

async function tryConnect(
  url: URL,
  makeTransport: () => StreamableHTTPClientTransport | SSEClientTransport,
): Promise<Client> {
  const client = new Client({ name: "mcpcheck", version: "0.1.0" });
  const transport = makeTransport();
  await withTimeout(client.connect(transport), CONNECT_TIMEOUT_MS, "MCP handshake");
  return client;
}

export async function connectToServer(url: URL): Promise<ScanContext> {
  const start = Date.now();

  try {
    const client = await tryConnect(url, () => new StreamableHTTPClientTransport(url));
    return {
      url,
      client,
      connectError: null,
      transportKind: "streamable-http",
      handshakeMs: Date.now() - start,
    };
  } catch (streamableError) {
    try {
      const sseStart = Date.now();
      const client = await tryConnect(url, () => new SSEClientTransport(url));
      return {
        url,
        client,
        connectError: null,
        transportKind: "sse",
        handshakeMs: Date.now() - sseStart,
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
      };
    }
  }
}
