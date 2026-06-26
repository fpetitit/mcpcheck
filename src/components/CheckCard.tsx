import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { CheckResult } from "@/lib/mcp/types";
import { StatusBadge } from "./StatusBadge";
import { ToolsList } from "./ToolsList";

const SEVERITY_STYLES: Record<string, string> = {
  info: "border-l-[#4ade80]/40 text-[#4ade80]/80",
  low: "border-l-[#4ade80] text-[#4ade80]",
  medium: "border-l-[#fb923c] text-[#fb923c]",
  high: "border-l-[#fb923c] text-[#fb923c]",
  critical: "border-l-red-400 text-red-400",
};

export function CheckCard({ check }: { check: CheckResult }) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-[#27272a] bg-black p-6 shadow-[0_0_10px_rgba(255,255,255,0.06)]">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-white">{check.title}</h3>
        <StatusBadge status={check.status} />
      </div>
      <p className="text-sm text-white/60">{check.summary}</p>

      {check.error && (
        <p className="rounded-lg border border-red-400/60 bg-black p-2 text-xs text-red-400">
          {check.error}
        </p>
      )}

      {check.findings && check.findings.length > 0 && (
        <ul className="flex flex-col gap-2">
          {check.findings.map((f, i) => (
            <li
              key={i}
              className={`border-l-2 pl-3 text-sm ${SEVERITY_STYLES[f.severity] ?? "border-l-[#4ade80]/30"}`}
            >
              <span className="font-medium">{f.title}</span>
              <p className="text-white/65">{f.detail}</p>
            </li>
          ))}
        </ul>
      )}

      {check.id === "inventory" && Array.isArray(check.data?.tools) && check.data.tools.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-white/60">
            tools ({check.data.tools.length})
          </p>
          <ToolsList tools={check.data.tools as Tool[]} />
        </div>
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
  );
}
