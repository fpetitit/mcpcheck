"use client";

import { useState } from "react";
import type { ScanResult } from "@/lib/mcp/types";
import { CheckCard } from "./CheckCard";

export function ScannerForm() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
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
