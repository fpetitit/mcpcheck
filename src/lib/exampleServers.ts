export interface ExampleServer {
  name: string;
  url: string;
  publisher: string;
  category: string;
  description: string;
}

export const EXAMPLE_SERVERS: ExampleServer[] = [
  {
    name: "DeepWiki",
    url: "https://mcp.deepwiki.com/mcp",
    publisher: "Cognition",
    category: "Docs & code search",
    description: "Ask questions about any public GitHub repo's wiki/docs.",
  },
  {
    name: "Cloudflare Docs",
    url: "https://docs.mcp.cloudflare.com/sse",
    publisher: "Cloudflare",
    category: "Docs & code search",
    description: "Search and browse Cloudflare's developer documentation.",
  },
  {
    name: "Semgrep",
    url: "https://mcp.semgrep.ai/sse",
    publisher: "Semgrep",
    category: "Security & code analysis",
    description: "Run Semgrep static analysis rules against code snippets.",
  },
  {
    name: "Context7",
    url: "https://mcp.context7.com/mcp",
    publisher: "Upstash",
    category: "Docs & code search",
    description: "Fetch up-to-date library/framework documentation for LLM context.",
  },
];
