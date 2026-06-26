import Link from "next/link";
import { ScannerForm } from "@/components/ScannerForm";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ url?: string }>;
}) {
  const { url } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col items-center bg-black px-6 py-16">
      <div className="flex w-full max-w-4xl flex-col items-center gap-4 text-center">
        <h1 className="glow-green text-4xl font-bold tracking-tight text-[#4ade80]">
          &gt; MCPCheckup_
        </h1>
        <p className="max-w-xl text-sm text-white/70">
          Inspect any remote MCP server: handshake, capabilities, exposed tools,{" "}
          <span className="text-[#fb923c]">security heuristics</span>, TLS/network posture, and
          license information &mdash; in one scan.
        </p>
        <Link
          href="/servers"
          className="text-xs font-medium text-[#fb923c] underline-offset-4 hover:underline"
        >
          Browse public MCP servers directory &rarr;
        </Link>
        <Link
          href="/methodology"
          className="text-xs font-medium text-[#fb923c] underline-offset-4 hover:underline"
        >
          How scoring works &rarr;
        </Link>
        <p className="mt-4 rounded-lg border border-[#fb923c]/40 bg-[#fb923c]/5 px-4 py-2 text-xs text-[#fb923c]">
          Built your own MCP server? Scan it below and earn a live badge for your README.
        </p>
      </div>
      <div className="mt-10 w-full max-w-4xl">
        <ScannerForm initialUrl={url} />
      </div>

      <p className="mt-16 max-w-xl text-center text-xs text-white/60">
        MCPCheckup is itself an MCP server &mdash; point an MCP client at{" "}
        <code className="text-white/70">/api/mcp</code> to call{" "}
        <code className="text-white/70">scan_mcp_server</code> and{" "}
        <code className="text-white/70">create_scorecard</code> as tools.
      </p>
    </div>
  );
}
