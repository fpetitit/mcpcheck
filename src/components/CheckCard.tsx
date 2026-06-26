"use client";

import { useState } from "react";
import type { CheckResult } from "@/lib/mcp/types";
import { SEVERITY_BORDER_TEXT } from "@/lib/severityStyle";
import { StatusBadge } from "./StatusBadge";

export function CheckCard({ check }: { check: CheckResult }) {
  // Per-tool findings are surfaced inline on each tool in the dedicated tools
  // section instead, so they're dropped here to avoid showing them twice.
  const serverLevelFindings = check.findings?.filter((f) => !f.toolName) ?? [];
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-[#27272a] bg-black shadow-[0_0_10px_rgba(255,255,255,0.06)]">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-5 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40">{expanded ? "▾" : "▸"}</span>
          <h3 className="text-sm font-semibold text-white">{check.title}</h3>
        </div>
        <StatusBadge status={check.status} />
      </button>

      {expanded && (
        <div className="flex flex-col gap-4 border-t border-[#27272a] px-5 py-4">
          <p className="text-sm text-white/60">{check.summary}</p>

          {check.error && (
            <p className="rounded-lg border border-red-400/60 bg-black p-2 text-xs text-red-400">
              {check.error}
            </p>
          )}

          {serverLevelFindings.length > 0 && (
            <ul className="flex flex-col gap-2">
              {serverLevelFindings.map((f, i) => (
                <li
                  key={i}
                  className={`border-l-2 pl-3 text-sm ${SEVERITY_BORDER_TEXT[f.severity] ?? "border-l-white/30"}`}
                >
                  <span className="font-medium">{f.title}</span>
                  <p className="text-white/65">{f.detail}</p>
                </li>
              ))}
            </ul>
          )}

          {check.findings && check.findings.length > serverLevelFindings.length && (
            <p className="text-xs text-white/40">
              {check.findings.length - serverLevelFindings.length} additional per-tool finding(s) shown in the tools section above.
            </p>
          )}

          {check.data && (
            <details className="text-xs text-white/50">
              <summary className="cursor-pointer select-none hover:text-white">Raw data</summary>
              <pre className="mt-2 max-h-64 overflow-auto rounded-lg border border-[#27272a] bg-black p-2 text-white/70">
                {JSON.stringify(check.data, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
