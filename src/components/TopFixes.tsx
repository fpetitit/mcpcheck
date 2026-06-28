import type { ScanResult, Severity } from "@/lib/mcp/types";
import { getTopFixes } from "@/lib/mcp/topFixes";

const SEVERITY_CHIP: Record<Severity, string> = {
  critical: "border-red-200 bg-red-50 text-red-700",
  high: "border-red-200 bg-red-50 text-red-700",
  medium: "border-orange-200 bg-orange-50 text-orange-700",
  low: "border-slate-200 bg-slate-50 text-slate-500",
  info: "border-slate-200 bg-slate-50 text-slate-400",
};

export function TopFixes({ result }: { result: ScanResult }) {
  const { fixes, moreCount } = getTopFixes(result);

  if (fixes.length === 0) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-green-200 bg-white text-xs font-bold text-green-700">
          ✓
        </span>
        <p className="text-sm text-green-800">
          Nothing to fix &mdash; this scan raised no warnings or errors. Any notes below are
          informational.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">what to fix first</p>
        <p className="text-sm text-slate-600">
          The highest-impact issues from this scan, in priority order.
        </p>
      </div>

      <ol className="flex flex-col gap-3">
        {fixes.map((fix, i) => (
          <li key={i} className="flex gap-3">
            <span className="mt-0.5 text-sm font-bold text-slate-400">{i + 1}</span>
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${SEVERITY_CHIP[fix.severity]}`}
                >
                  {fix.severity}
                </span>
                <span className="text-sm font-medium text-slate-900">{fix.title}</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-600">{fix.detail}</p>
              <p className="text-[11px] text-slate-400">{fix.area}</p>
            </div>
          </li>
        ))}
      </ol>

      {moreCount > 0 && (
        <p className="text-xs text-slate-400">
          + {moreCount} more {moreCount === 1 ? "finding" : "findings"} in the checks below.
        </p>
      )}
    </div>
  );
}
