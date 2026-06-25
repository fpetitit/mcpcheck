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
  {
    name: "AWS Knowledge",
    url: "https://knowledge-mcp.global.api.aws",
    publisher: "AWS",
    category: "Docs & code search",
    description: "Look up AWS service documentation, APIs, and best practices.",
  },
  {
    name: "Astro Docs",
    url: "https://mcp.docs.astro.build/mcp",
    publisher: "Astro",
    category: "Docs & code search",
    description: "Search the Astro web framework's documentation.",
  },
  {
    name: "GitMCP",
    url: "https://gitmcp.io/docs",
    publisher: "GitMCP",
    category: "Docs & code search",
    description: "Turns any public GitHub repo into a documentation MCP server.",
  },
  {
    name: "Hugging Face",
    url: "https://hf.co/mcp",
    publisher: "Hugging Face",
    category: "AI & ML",
    description: "Search and browse Hugging Face models, datasets, and spaces.",
  },
  {
    name: "Exa Search",
    url: "https://mcp.exa.ai/mcp",
    publisher: "Exa",
    category: "Search",
    description: "Web search and content retrieval built for AI agents.",
  },
  {
    name: "Wolfram",
    url: "https://agenttools.wolfram.com/mcp",
    publisher: "Wolfram Research",
    category: "Math & computation",
    description: "Run Wolfram Language computations, queries, and data lookups.",
  },
  {
    name: "OpenZeppelin",
    url: "https://mcp.openzeppelin.com/contracts/solidity/mcp",
    publisher: "OpenZeppelin",
    category: "Security & code analysis",
    description: "Look up audited smart-contract libraries and security patterns.",
  },
  {
    name: "Manifold Markets",
    url: "https://api.manifold.markets/v0/mcp",
    publisher: "Manifold",
    category: "Data & forecasting",
    description: "Query prediction-market odds and crowd forecasts.",
  },
];
