"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { ScanResult } from "@/lib/mcp/types";
import { EXAMPLE_SERVERS } from "@/lib/exampleServers";
import { gradeColor } from "@/lib/mcp/gradeColor";
import { CheckCard } from "./CheckCard";
import { AxisRadar } from "./AxisRadar";
import { ToolsList } from "./ToolsList";

export function ScannerForm({ initialUrl }: { initialUrl?: string }) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [badgeCopied, setBadgeCopied] = useState(false);

  async function copyBadgeSnippet(snippet: string) {
    await navigator.clipboard.writeText(snippet);
    setBadgeCopied(true);
    setTimeout(() => setBadgeCopied(false), 1500);
  }

  useEffect(() => {
    if (initialUrl) {
      runScan(initialUrl);
    }
  }, [initialUrl]);

  async function runScan(targetUrl: string) {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Scan failed.");
      } else {
        setResult(json as ScanResult);
      }
    } catch {
      setError("Network error while contacting the scan API.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    runScan(url);
  }

  function handleExampleClick(exampleUrl: string) {
    setUrl(exampleUrl);
    runScan(exampleUrl);
  }

  function handleSelfScan() {
    handleExampleClick(`${window.location.origin}/api/mcp`);
  }

  return (
    <div className="flex w-full max-w-4xl flex-col gap-8">
      <form onSubmit={handleSubmit} className="flex w-full gap-2">
        <input
          type="url"
          required
          placeholder="https://example.com/mcp"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 rounded-lg border border-[#27272a] bg-black px-4 py-3 font-mono text-sm text-white outline-none placeholder:text-white/40 focus:border-white focus:shadow-[0_0_8px_rgba(255,255,255,0.3)]"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg border border-[#fb923c] bg-black px-6 py-3 text-sm font-bold text-[#fb923c] transition-colors hover:bg-[#fb923c] hover:text-black disabled:opacity-50"
        >
          {loading ? "Scanning…" : "Scan"}
        </button>
      </form>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-white/60">
          try a known public MCP server
        </p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_SERVERS.map((server) => (
            <button
              key={server.url}
              type="button"
              title={server.description}
              disabled={loading}
              onClick={() => handleExampleClick(server.url)}
              className="rounded-lg border border-white/40 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:border-white hover:bg-white/10 hover:shadow-[0_0_6px_rgba(255,255,255,0.3)] disabled:opacity-50"
            >
              {server.name}
            </button>
          ))}
          <button
            type="button"
            title="Scan MCPCheckup's own MCP server, eating its own dog food."
            disabled={loading}
            onClick={handleSelfScan}
            className="rounded-lg border border-[#fb923c]/60 px-3 py-1.5 text-xs font-medium text-[#fb923c] transition-colors hover:border-[#fb923c] hover:bg-[#fb923c]/10 hover:shadow-[0_0_6px_rgba(251,146,60,0.4)] disabled:opacity-50"
          >
            Scan MCPCheckup itself
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-[#fb923c] bg-black p-4 text-sm text-[#fb923c]">
          {error}
        </p>
      )}

      {result && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-white/60">
              Scanned <span className="font-mono text-white">{result.target}</span> in{" "}
              {new Date(result.finishedAt).getTime() - new Date(result.startedAt).getTime()}ms
            </p>
            <div className="flex items-center gap-3">
              <span
                className="rounded-lg border px-3 py-1 text-sm font-bold"
                style={{ borderColor: gradeColor(result.grade), color: gradeColor(result.grade) }}
              >
                {result.grade} &middot; {result.score}/100
              </span>
              <Link
                href={`/scorecard?url=${encodeURIComponent(result.target)}`}
                className="rounded-lg border border-[#fb923c] px-3 py-1.5 text-xs font-bold text-[#fb923c] transition-colors hover:bg-[#fb923c] hover:text-black"
              >
                Get shareable scorecard &rarr;
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-dashed border-[#fb923c]/50 bg-[#fb923c]/5 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-bold uppercase tracking-wide text-[#fb923c]">
                is this your MCP server?
              </p>
              <p className="text-xs text-[#fb923c]/80">
                Flex the score. Drop this badge in your README and let it auto-update on every rescan.
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/badge?url=${encodeURIComponent(result.target)}`}
                alt={`MCPCheckup badge for ${result.target}`}
                className="mt-2 h-5 w-fit"
              />
            </div>
            <button
              type="button"
              onClick={() =>
                copyBadgeSnippet(
                  `[![MCPCheckup](${window.location.origin}/api/badge?url=${encodeURIComponent(result.target)})](${window.location.origin}/scorecard?url=${encodeURIComponent(result.target)})`,
                )
              }
              className="shrink-0 rounded-lg border border-[#fb923c] px-4 py-2 text-xs font-bold text-[#fb923c] transition-colors hover:bg-[#fb923c] hover:text-black"
            >
              {badgeCopied ? "Copied! Go paste it." : "Copy badge for README"}
            </button>
          </div>

          <div className="flex flex-col items-center gap-2 rounded-lg border border-[#27272a] bg-black p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-white/60">
              score breakdown by axis
            </p>
            <AxisRadar axes={result.axes} color={gradeColor(result.grade)} />
          </div>

          {(() => {
            const tools = (result.checks.find((c) => c.id === "inventory")?.data?.tools ?? []) as Tool[];
            if (tools.length === 0) return null;
            const toolFindings = result.checks
              .filter((c) => c.id === "security" || c.id === "schema-quality")
              .flatMap((c) => c.findings ?? []);
            return (
              <div className="flex flex-col gap-2 rounded-lg border border-[#27272a] bg-black p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-white/60">
                  tools ({tools.length}) &middot; security &amp; schema findings inline
                </p>
                <ToolsList tools={tools} findings={toolFindings} target={result.target} />
              </div>
            );
          })()}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {result.checks.map((check) => (
              <CheckCard key={check.id} check={check} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
