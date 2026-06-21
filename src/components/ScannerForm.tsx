"use client";

import { useState } from "react";
import type { ScanResult } from "@/lib/mcp/types";
import { EXAMPLE_SERVERS } from "@/lib/exampleServers";
import { CheckCard } from "./CheckCard";

export function ScannerForm() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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
          className="flex-1 rounded-lg border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {loading ? "Scanning…" : "Scan"}
        </button>
      </form>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
          Try a known public MCP server
        </p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_SERVERS.map((server) => (
            <button
              key={server.url}
              type="button"
              title={server.description}
              disabled={loading}
              onClick={() => handleExampleClick(server.url)}
              className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:border-zinc-500 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {server.name}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}

      {result && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-zinc-500">
            Scanned <span className="font-mono">{result.target}</span> in{" "}
            {new Date(result.finishedAt).getTime() - new Date(result.startedAt).getTime()}ms
          </p>
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
