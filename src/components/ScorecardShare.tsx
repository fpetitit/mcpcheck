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
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-[#39ff14]/50">
          $ share this scorecard
        </p>
        <div className="flex gap-2">
          <input
            readOnly
            value={scorecardUrl}
            className="flex-1 truncate rounded border border-[#1a4d1a] bg-black px-3 py-2 font-mono text-xs text-[#39ff14]/80"
          />
          <button
            type="button"
            onClick={() => copy(scorecardUrl, "link")}
            className="rounded border border-[#39ff14]/40 px-4 py-2 text-xs font-medium text-[#39ff14] transition-colors hover:border-[#39ff14] hover:bg-[#39ff14]/10"
          >
            {copied === "link" ? "Copied!" : "Copy link"}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-[#39ff14]/50">
          $ embed on your site
        </p>
        <div className="flex gap-2">
          <textarea
            readOnly
            rows={3}
            value={embedSnippet}
            className="flex-1 resize-none rounded border border-[#1a4d1a] bg-black px-3 py-2 font-mono text-xs text-[#39ff14]/80"
          />
          <button
            type="button"
            onClick={() => copy(embedSnippet, "embed")}
            className="self-start rounded border border-[#ff8c00] px-4 py-2 text-xs font-medium text-[#ff8c00] transition-colors hover:bg-[#ff8c00] hover:text-black"
          >
            {copied === "embed" ? "Copied!" : "Copy embed code"}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-[#39ff14]/50">
          $ markdown badge (for your README)
        </p>
        <div className="flex gap-2">
          <textarea
            readOnly
            rows={2}
            value={badgeSnippet}
            className="flex-1 resize-none rounded border border-[#1a4d1a] bg-black px-3 py-2 font-mono text-xs text-[#39ff14]/80"
          />
          <button
            type="button"
            onClick={() => copy(badgeSnippet, "badge")}
            className="self-start rounded border border-[#39ff14]/40 px-4 py-2 text-xs font-medium text-[#39ff14] transition-colors hover:border-[#39ff14] hover:bg-[#39ff14]/10"
          >
            {copied === "badge" ? "Copied!" : "Copy badge"}
          </button>
        </div>
      </div>
    </div>
  );
}
