import { Suspense } from "react";
import Link from "next/link";
import { ScannerForm } from "@/components/ScannerForm";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-white px-6 py-16">
      <div className="flex w-full max-w-4xl flex-col items-center gap-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          MCPCheckup
        </h1>
        <p className="max-w-xl text-sm text-slate-600">
          Inspect any remote MCP server: handshake, capabilities, exposed tools,{" "}
          <span className="text-indigo-600">security heuristics</span>, TLS/network posture, and
          license information &mdash; in one scan.
        </p>
        <Link
          href="/servers"
          className="text-xs font-medium text-indigo-600 underline-offset-4 hover:underline"
        >
          Browse public MCP servers directory &rarr;
        </Link>
        <Link
          href="/methodology"
          className="text-xs font-medium text-indigo-600 underline-offset-4 hover:underline"
        >
          How scoring works &rarr;
        </Link>
        <p className="mt-4 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs text-indigo-600">
          Built your own MCP server? Scan it below and earn a live badge for your README.
        </p>
      </div>
      <div className="mt-10 w-full max-w-4xl">
        <Suspense
          fallback={
            <div className="h-[52px] w-full animate-pulse rounded-lg border border-slate-200 bg-white" />
          }
        >
          <ScannerForm />
        </Suspense>
      </div>

      <p className="mt-16 max-w-xl text-center text-xs text-slate-500">
        MCPCheckup is itself an MCP server &mdash; point an MCP client at{" "}
        <code className="text-slate-600">/api/mcp</code> to call{" "}
        <code className="text-slate-600">scan_mcp_server</code> and{" "}
        <code className="text-slate-600">create_scorecard</code> as tools.
      </p>
    </div>
  );
}
