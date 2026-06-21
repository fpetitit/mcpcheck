import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { scanMcpServer } from "./scanner";

function errorResult(prefix: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return { content: [{ type: "text" as const, text: `${prefix}: ${message}` }], isError: true };
}

export function createMcpCheckupServer(baseUrl: string) {
  const server = new McpServer({ name: "mcpcheckup", version: "0.1.0" });

  server.registerTool(
    "scan_mcp_server",
    {
      title: "Scan MCP server",
      description:
        "Run a full MCPCheckup scan against a remote MCP server: handshake, protocol version, " +
        "tool/resource/prompt inventory, security heuristics, network/TLS posture, and license info.",
      inputSchema: {
        url: z.string().url().describe("The MCP server endpoint to scan, e.g. https://example.com/mcp"),
      },
    },
    async ({ url }) => {
      try {
        const result = await scanMcpServer(url);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return errorResult("Scan failed", error);
      }
    },
  );

  server.registerTool(
    "create_scorecard",
    {
      title: "Create MCP scorecard",
      description:
        "Scan a remote MCP server and return a shareable scorecard: security score (0-100), letter " +
        "grade, a public scorecard page URL, and an Open Graph image URL for embedding or social sharing.",
      inputSchema: {
        url: z.string().url().describe("The MCP server endpoint to score, e.g. https://example.com/mcp"),
      },
    },
    async ({ url }) => {
      try {
        const result = await scanMcpServer(url);
        const scorecardUrl = `${baseUrl}/scorecard?url=${encodeURIComponent(url)}`;
        const ogImageUrl = `${baseUrl}/api/og?url=${encodeURIComponent(url)}`;
        const payload = {
          target: result.target,
          score: result.score,
          grade: result.grade,
          scorecardUrl,
          ogImageUrl,
          embedHtml: `<a href="${scorecardUrl}"><img src="${ogImageUrl}" alt="MCP scorecard for ${result.target}" width="600" /></a>`,
        };
        return { content: [{ type: "text", text: JSON.stringify(payload, null, 2) }] };
      } catch (error) {
        return errorResult("Scorecard creation failed", error);
      }
    },
  );

  return server;
}
