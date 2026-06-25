"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ScanResult } from "@/lib/mcp/types";
import { EXAMPLE_SERVERS } from "@/lib/exampleServers";
import { gradeColor } from "@/lib/mcp/gradeColor";
import { CheckCard } from "./CheckCard";
import { AxisRadar } from "./AxisRadar";

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
          className="flex-1 rounded border border-[#1a4d1a] bg-black px-4 py-3 font-mono text-sm text-[#39ff14] outline-none placeholder:text-[#39ff14]/40 focus:border-[#39ff14] focus:shadow-[0_0_8px_rgba(57,255,20,0.4)]"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded border border-[#ff8c00] bg-black px-6 py-3 text-sm font-bold text-[#ff8c00] transition-colors hover:bg-[#ff8c00] hover:text-black disabled:opacity-50"
        >
          {loading ? "Scanning…" : "Scan"}
        </button>
      </form>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-[#39ff14]/50">
          $ try a known public MCP server
        </p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_SERVERS.map((server) => (
            <button
              key={server.url}
              type="button"
              title={server.description}
              disabled={loading}
              onClick={() => handleExampleClick(server.url)}
              className="rounded border border-[#39ff14]/40 px-3 py-1.5 text-xs font-medium text-[#39ff14] transition-colors hover:border-[#39ff14] hover:bg-[#39ff14]/10 hover:shadow-[0_0_6px_rgba(57,255,20,0.4)] disabled:opacity-50"
            >
              {server.name}
            </button>
          ))}
          <button
            type="button"
            title="Scan MCPCheckup's own MCP server, eating its own dog food."
            disabled={loading}
            onClick={handleSelfScan}
            className="rounded border border-[#ff8c00]/60 px-3 py-1.5 text-xs font-medium text-[#ff8c00] transition-colors hover:border-[#ff8c00] hover:bg-[#ff8c00]/10 hover:shadow-[0_0_6px_rgba(255,140,0,0.4)] disabled:opacity-50"
          >
            Scan MCPCheckup itself
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded border border-[#ff8c00] bg-black p-4 text-sm text-[#ff8c00]">
          {error}
        </p>
      )}

      {result && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[#39ff14]/60">
              Scanned <span className="text-[#39ff14]">{result.target}</span> in{" "}
              {new Date(result.finishedAt).getTime() - new Date(result.startedAt).getTime()}ms
            </p>
            <div className="flex items-center gap-3">
              <span
                className="rounded border px-3 py-1 text-sm font-bold"
                style={{ borderColor: gradeColor(result.grade), color: gradeColor(result.grade) }}
              >
                {result.grade} &middot; {result.score}/100
              </span>
              <Link
                href={`/scorecard?url=${encodeURIComponent(result.target)}`}
                className="rounded border border-[#ff8c00] px-3 py-1.5 text-xs font-bold text-[#ff8c00] transition-colors hover:bg-[#ff8c00] hover:text-black"
              >
                Get shareable scorecard &rarr;
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded border border-dashed border-[#ff8c00]/50 bg-[#ff8c00]/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-bold uppercase tracking-wide text-[#ff8c00]">
                $ is this your MCP server?
              </p>
              <p className="text-xs text-[#ff8c00]/80">
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
              className="shrink-0 rounded border border-[#ff8c00] px-4 py-2 text-xs font-bold text-[#ff8c00] transition-colors hover:bg-[#ff8c00] hover:text-black"
            >
              {badgeCopied ? "Copied! Go paste it." : "Copy badge for README"}
            </button>
          </div>

          <div className="flex flex-col items-center gap-2 rounded border border-[#1a4d1a] bg-black p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-[#39ff14]/50">
              $ score breakdown by axis
            </p>
            <AxisRadar axes={result.axes} color={gradeColor(result.grade)} />
          </div>
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
