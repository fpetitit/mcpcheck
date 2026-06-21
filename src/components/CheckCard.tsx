import type { CheckResult } from "@/lib/mcp/types";
import { StatusBadge } from "./StatusBadge";

const SEVERITY_STYLES: Record<string, string> = {
  info: "border-l-[#39ff14]/40 text-[#39ff14]/80",
  low: "border-l-[#39ff14] text-[#39ff14]",
  medium: "border-l-[#ff8c00] text-[#ff8c00]",
  high: "border-l-[#ff8c00] text-[#ff8c00]",
  critical: "border-l-red-500 text-red-500",
};

export function CheckCard({ check }: { check: CheckResult }) {
  return (
    <div className="flex flex-col gap-3 rounded border border-[#1a4d1a] bg-black p-5 font-mono shadow-[0_0_10px_rgba(57,255,20,0.08)]">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-[#39ff14]">{check.title}</h3>
        <StatusBadge status={check.status} />
      </div>
      <p className="text-sm text-[#39ff14]/60">{check.summary}</p>

      {check.error && (
        <p className="rounded border border-red-500/60 bg-black p-2 text-xs text-red-500">
          {check.error}
        </p>
      )}

      {check.findings && check.findings.length > 0 && (
        <ul className="flex flex-col gap-2">
          {check.findings.map((f, i) => (
            <li
              key={i}
              className={`border-l-2 pl-3 text-xs ${SEVERITY_STYLES[f.severity] ?? "border-l-[#39ff14]/30"}`}
            >
              <span className="font-medium">{f.title}</span>
              <p className="text-[#39ff14]/50">{f.detail}</p>
            </li>
          ))}
        </ul>
      )}

      {check.data && (
        <details className="text-xs text-[#39ff14]/50">
          <summary className="cursor-pointer select-none hover:text-[#39ff14]">Raw data</summary>
          <pre className="mt-2 max-h-64 overflow-auto rounded border border-[#1a4d1a] bg-black p-2 text-[#39ff14]/70">
            {JSON.stringify(check.data, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
