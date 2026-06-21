import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createMcpCheckupServer } from "@/lib/mcp/mcpServer";

async function handle(request: Request) {
  const baseUrl = new URL(request.url).origin;
  const transport = new WebStandardStreamableHTTPServerTransport();
  const server = createMcpCheckupServer(baseUrl);
  await server.connect(transport);
  return transport.handleRequest(request);
}

export { handle as GET, handle as POST, handle as DELETE };
