import type { CheckResult } from "@/lib/mcp/types";
import { StatusBadge } from "./StatusBadge";

const SEVERITY_STYLES: Record<string, string> = {
  info: "border-l-[#4ade80]/40 text-[#4ade80]/80",
  low: "border-l-[#4ade80] text-[#4ade80]",
  medium: "border-l-[#fb923c] text-[#fb923c]",
  high: "border-l-[#fb923c] text-[#fb923c]",
  critical: "border-l-red-400 text-red-400",
};

export function CheckCard({ check }: { check: CheckResult }) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-[#1f3a28] bg-black p-6 shadow-[0_0_10px_rgba(74,222,128,0.08)]">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-[#4ade80]">{check.title}</h3>
        <StatusBadge status={check.status} />
      </div>
      <p className="text-sm text-[#4ade80]/60">{check.summary}</p>

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
              <p className="text-[#4ade80]/65">{f.detail}</p>
            </li>
          ))}
        </ul>
      )}

      {check.data && (
        <details className="text-xs text-[#4ade80]/50">
          <summary className="cursor-pointer select-none hover:text-[#4ade80]">Raw data</summary>
          <pre className="mt-2 max-h-64 overflow-auto rounded-lg border border-[#1f3a28] bg-black p-2 text-[#4ade80]/70">
            {JSON.stringify(check.data, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
