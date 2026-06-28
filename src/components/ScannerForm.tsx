"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { ScanResult } from "@/lib/mcp/types";
import { EXAMPLE_SERVERS } from "@/lib/exampleServers";
import { gradeColor } from "@/lib/mcp/gradeColor";
import { buildVerdict } from "@/lib/mcp/verdict";
import { CheckCard } from "./CheckCard";
import { AxisRadar } from "./AxisRadar";
import { ToolsList } from "./ToolsList";
import { VerdictSummary } from "./VerdictSummary";
import { TopFixes } from "./TopFixes";

export function ScannerForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlParam = searchParams.get("url") ?? "";

  const [url, setUrl] = useState(urlParam);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [badgeCopied, setBadgeCopied] = useState(false);
  const [expandedChecks, setExpandedChecks] = useState<Set<string>>(new Set());
  const [trackedParam, setTrackedParam] = useState(urlParam);

  // When the ?url= param changes (deep link, back/forward, or a new scan), reset
  // the view to match it during render — the actual (async) scan is kicked off by
  // the effect below. Adjusting state in render is React's recommended pattern
  // over a state-syncing effect.
  if (urlParam !== trackedParam) {
    setTrackedParam(urlParam);
    setUrl(urlParam);
    setResult(null);
    setError(null);
    setExpandedChecks(new Set());
  }

  function toggleCheck(id: string) {
    setExpandedChecks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function copyBadgeSnippet(snippet: string) {
    await navigator.clipboard.writeText(snippet);
    setBadgeCopied(true);
    setTimeout(() => setBadgeCopied(false), 1500);
  }

  // The scanned target is driven entirely by the ?url= query param: scans are
  // therefore bookmarkable, and browser back/forward replays them.
  useEffect(() => {
    if (urlParam) {
      runScan(urlParam);
    }
  }, [urlParam]);

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
        setExpandedChecks(new Set());
      }
    } catch {
      setError("Network error while contacting the scan API.");
    } finally {
      setLoading(false);
    }
  }

  // Navigating to ?url=<target> is what triggers a scan (via the effect above),
  // which is what makes each scan a real, shareable history entry. Re-scanning
  // the same target is the one case the URL won't change, so we run it directly.
  function goScan(targetUrl: string) {
    const trimmed = targetUrl.trim();
    if (!trimmed) return;
    if (trimmed === urlParam) {
      runScan(trimmed);
    } else {
      router.push(`/?url=${encodeURIComponent(trimmed)}`);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    goScan(url);
  }

  function handleExampleClick(exampleUrl: string) {
    setUrl(exampleUrl);
    goScan(exampleUrl);
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
          className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-3 font-mono text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg border border-indigo-500 bg-white px-6 py-3 text-sm font-bold text-indigo-600 transition-colors hover:bg-indigo-600 hover:text-white disabled:opacity-50"
        >
          {loading ? "Scanning…" : "Scan"}
        </button>
      </form>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
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
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-900 transition-colors hover:border-slate-400 hover:bg-slate-100 disabled:opacity-50"
            >
              {server.name}
            </button>
          ))}
          <button
            type="button"
            title="Scan MCPCheckup's own MCP server, eating its own dog food."
            disabled={loading}
            onClick={handleSelfScan}
            className="rounded-lg border border-indigo-300 px-3 py-1.5 text-xs font-medium text-indigo-600 transition-colors hover:border-indigo-500 hover:bg-indigo-100 disabled:opacity-50"
          >
            Scan MCPCheckup itself
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </p>
      )}

      {result && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500">
              Scanned <span className="font-mono text-slate-900">{result.target}</span> in{" "}
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
                className="rounded-lg border border-indigo-500 px-3 py-1.5 text-xs font-bold text-indigo-600 transition-colors hover:bg-indigo-600 hover:text-white"
              >
                Get shareable scorecard &rarr;
              </Link>
            </div>
          </div>

          {(() => {
            const tools = (result.checks.find((c) => c.id === "inventory")?.data?.tools ?? []) as Tool[];
            return <VerdictSummary verdict={buildVerdict(result, tools)} />;
          })()}

          <div className="flex flex-col gap-3 rounded-lg border border-dashed border-indigo-300 bg-indigo-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">
                is this your MCP server?
              </p>
              <p className="text-xs text-indigo-600/80">
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
              className="shrink-0 rounded-lg border border-indigo-500 px-4 py-2 text-xs font-bold text-indigo-600 transition-colors hover:bg-indigo-600 hover:text-white"
            >
              {badgeCopied ? "Copied! Go paste it." : "Copy badge for README"}
            </button>
          </div>

          <div className="flex flex-col items-center gap-2 rounded-lg border border-slate-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              score breakdown by axis
            </p>
            <AxisRadar axes={result.axes} color={gradeColor(result.grade)} />
          </div>

          <TopFixes result={result} />

          {(() => {
            const tools = (result.checks.find((c) => c.id === "inventory")?.data?.tools ?? []) as Tool[];
            if (tools.length === 0) return null;
            const toolFindings = result.checks
              .filter((c) => c.id === "security" || c.id === "schema-quality")
              .flatMap((c) => c.findings ?? []);
            return (
              <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  tools ({tools.length}) &middot; security &amp; schema findings inline
                </p>
                <ToolsList tools={tools} findings={toolFindings} target={result.target} />
              </div>
            );
          })()}

          <div className="flex flex-col gap-2">
            {(() => {
              const allExpanded = result.checks.every((c) => expandedChecks.has(c.id));
              return (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedChecks(allExpanded ? new Set() : new Set(result.checks.map((c) => c.id)))
                    }
                    className="text-xs text-slate-400 underline-offset-2 hover:text-slate-900 hover:underline"
                  >
                    {allExpanded ? "Collapse all" : "Expand all"}
                  </button>
                </div>
              );
            })()}
            {result.checks.map((check) => (
              <CheckCard
                key={check.id}
                check={check}
                expanded={expandedChecks.has(check.id)}
                onToggle={() => toggleCheck(check.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
