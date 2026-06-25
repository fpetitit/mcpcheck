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
        <p className="text-xs font-medium uppercase tracking-wide text-[#4ade80]/50">
          share this scorecard
        </p>
        <div className="flex gap-2">
          <input
            readOnly
            value={scorecardUrl}
            className="flex-1 truncate rounded-lg border border-[#1f3a28] bg-black px-3 py-2 font-mono text-xs text-[#4ade80]/80"
          />
          <button
            type="button"
            onClick={() => copy(scorecardUrl, "link")}
            className="rounded-lg border border-[#4ade80]/40 px-4 py-2 text-xs font-medium text-[#4ade80] transition-colors hover:border-[#4ade80] hover:bg-[#4ade80]/10"
          >
            {copied === "link" ? "Copied!" : "Copy link"}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-[#4ade80]/50">
          embed on your site
        </p>
        <div className="flex gap-2">
          <textarea
            readOnly
            rows={3}
            value={embedSnippet}
            className="flex-1 resize-none rounded-lg border border-[#1f3a28] bg-black px-3 py-2 font-mono text-xs text-[#4ade80]/80"
          />
          <button
            type="button"
            onClick={() => copy(embedSnippet, "embed")}
            className="self-start rounded-lg border border-[#fb923c] px-4 py-2 text-xs font-medium text-[#fb923c] transition-colors hover:bg-[#fb923c] hover:text-black"
          >
            {copied === "embed" ? "Copied!" : "Copy embed code"}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-[#4ade80]/50">
          markdown badge (for your README)
        </p>
        <div className="flex gap-2">
          <textarea
            readOnly
            rows={2}
            value={badgeSnippet}
            className="flex-1 resize-none rounded-lg border border-[#1f3a28] bg-black px-3 py-2 font-mono text-xs text-[#4ade80]/80"
          />
          <button
            type="button"
            onClick={() => copy(badgeSnippet, "badge")}
            className="self-start rounded-lg border border-[#4ade80]/40 px-4 py-2 text-xs font-medium text-[#4ade80] transition-colors hover:border-[#4ade80] hover:bg-[#4ade80]/10"
          >
            {copied === "badge" ? "Copied!" : "Copy badge"}
          </button>
        </div>
      </div>
    </div>
  );
}
