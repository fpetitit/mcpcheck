"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ScanResult } from "@/lib/mcp/types";
import { EXAMPLE_SERVERS } from "@/lib/exampleServers";
import { gradeColor } from "@/lib/mcp/gradeColor";
import { CheckCard } from "./CheckCard";

export function ScannerForm({ initialUrl }: { initialUrl?: string }) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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
