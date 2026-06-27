"use client";

import { useState } from "react";

export function ScorecardShare({
  scorecardUrl,
  embedSnippet,
  badgeSnippet,
}: {
  scorecardUrl: string;
  embedSnippet: string;
  badgeSnippet: string;
}) {
  const [copied, setCopied] = useState<"link" | "embed" | "badge" | null>(null);

  async function copy(text: string, which: "link" | "embed" | "badge") {
    await navigator.clipboard.writeText(text);
    setCopied(which);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          share this scorecard
        </p>
        <div className="flex gap-2">
          <input
            readOnly
            value={scorecardUrl}
            className="flex-1 truncate rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-700"
          />
          <button
            type="button"
            onClick={() => copy(scorecardUrl, "link")}
            className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-medium text-slate-900 transition-colors hover:border-slate-400 hover:bg-slate-100"
          >
            {copied === "link" ? "Copied!" : "Copy link"}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          embed on your site
        </p>
        <div className="flex gap-2">
          <textarea
            readOnly
            rows={3}
            value={embedSnippet}
            className="flex-1 resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-700"
          />
          <button
            type="button"
            onClick={() => copy(embedSnippet, "embed")}
            className="self-start rounded-lg border border-indigo-500 px-4 py-2 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-600 hover:text-white"
          >
            {copied === "embed" ? "Copied!" : "Copy embed code"}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          markdown badge (for your README)
        </p>
        <div className="flex gap-2">
          <textarea
            readOnly
            rows={2}
            value={badgeSnippet}
            className="flex-1 resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-700"
          />
          <button
            type="button"
            onClick={() => copy(badgeSnippet, "badge")}
            className="self-start rounded-lg border border-slate-300 px-4 py-2 text-xs font-medium text-slate-900 transition-colors hover:border-slate-400 hover:bg-slate-100"
          >
            {copied === "badge" ? "Copied!" : "Copy badge"}
          </button>
        </div>
      </div>
    </div>
  );
}
