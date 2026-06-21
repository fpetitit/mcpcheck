# mcpcheck

A [webcheck.xyz](https://webcheck.xyz)-style scanner for remote [MCP](https://modelcontextprotocol.io) servers.

Enter the URL of an MCP server (Streamable HTTP or SSE transport) and get a dashboard of checks:

- **Connectivity & Handshake** — protocol negotiation, server info, advertised capabilities.
- **Tools, Resources & Prompts** — full inventory with schemas.
- **Security Heuristics** — prompt-injection-style wording in tool descriptions, tools that may expose sensitive capabilities (exec, filesystem, network), missing descriptions, plaintext transport.
- **Network & TLS** — certificate validity, HTTP security headers, CORS policy.
- **License Information** — presence of a LICENSE file or license mention in server instructions.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and paste an MCP server URL to scan.

## Notes

- Only `http://` and `https://` targets are accepted; scanning private/internal IP ranges or `localhost` is blocked to prevent SSRF.
- Security checks are heuristic, not a substitute for a manual security review.
