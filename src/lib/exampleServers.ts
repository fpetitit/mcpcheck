export interface ExampleServer {
  name: string;
  url: string;
  description: string;
}

export const EXAMPLE_SERVERS: ExampleServer[] = [
  {
    name: "DeepWiki",
    url: "https://mcp.deepwiki.com/mcp",
    description: "Ask questions about any public GitHub repo's wiki/docs.",
  },
  {
    name: "Cloudflare Docs",
    url: "https://docs.mcp.cloudflare.com/sse",
    description: "Search and browse Cloudflare's developer documentation.",
  },
  {
    name: "Semgrep",
    url: "https://mcp.semgrep.ai/sse",
    description: "Run Semgrep static analysis rules against code snippets.",
  },
  {
    name: "Context7",
    url: "https://mcp.context7.com/mcp",
    description: "Fetch up-to-date library/framework documentation for LLM context.",
  },
];
