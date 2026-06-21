import Link from "next/link";
import { ScannerForm } from "@/components/ScannerForm";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ url?: string }>;
}) {
  const { url } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col items-center bg-black px-6 py-16 font-mono">
      <div className="flex w-full max-w-4xl flex-col items-center gap-3 text-center">
        <h1 className="glow-green text-4xl font-bold tracking-tight text-[#39ff14]">
          &gt; MCPCheckup_
        </h1>
        <p className="max-w-xl text-sm text-[#39ff14]/70">
          Inspect any remote MCP server: handshake, capabilities, exposed tools,{" "}
          <span className="text-[#ff8c00]">security heuristics</span>, TLS/network posture, and
          license information &mdash; in one scan.
        </p>
        <Link
          href="/servers"
          className="text-xs font-medium text-[#ff8c00] underline-offset-4 hover:underline"
        >
          $ browse public MCP servers directory &rarr;
        </Link>
      </div>
      <div className="mt-10 w-full max-w-4xl">
        <ScannerForm initialUrl={url} />
      </div>

      <p className="mt-16 max-w-xl text-center text-xs text-[#39ff14]/40">
        $ MCPCheckup is itself an MCP server &mdash; point an MCP client at{" "}
        <code className="text-[#39ff14]/70">/api/mcp</code> to call{" "}
        <code className="text-[#39ff14]/70">scan_mcp_server</code> and{" "}
        <code className="text-[#39ff14]/70">create_scorecard</code> as tools.
      </p>
    </div>
  );
}
