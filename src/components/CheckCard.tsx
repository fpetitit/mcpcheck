import type { CheckResult } from "@/lib/mcp/types";
import { SEVERITY_BORDER_TEXT } from "@/lib/severityStyle";
import { CHECK_WHY } from "@/lib/checks/checkInfo";
import { StatusBadge } from "./StatusBadge";

export function CheckCard({
  check,
  expanded,
  onToggle,
}: {
  check: CheckResult;
  expanded: boolean;
  onToggle: () => void;
}) {
  // Per-tool findings are surfaced inline on each tool in the dedicated tools
  // section instead, so they're dropped here to avoid showing them twice.
  const serverLevelFindings = check.findings?.filter((f) => !f.toolName) ?? [];
  const why = CHECK_WHY[check.id];

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-2 px-5 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">{expanded ? "▾" : "▸"}</span>
          <h3 className="text-sm font-semibold text-slate-900">{check.title}</h3>
        </div>
        <StatusBadge status={check.status} />
      </button>

      {expanded && (
        <div className="flex flex-col gap-4 border-t border-slate-200 px-5 py-4">
          <p className="text-sm text-slate-500">{check.summary}</p>

          {why && (
            <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
              <span className="font-semibold text-slate-700">Why it matters: </span>
              {why}
            </p>
          )}

          {check.error && (
            <p className="rounded-lg border border-red-200 bg-white p-2 text-xs text-red-600">
              {check.error}
            </p>
          )}

          {serverLevelFindings.length > 0 && (
            <ul className="flex flex-col gap-2">
              {serverLevelFindings.map((f, i) => (
                <li
                  key={i}
                  className={`border-l-2 pl-3 text-sm ${SEVERITY_BORDER_TEXT[f.severity] ?? "border-l-slate-300"}`}
                >
                  <span className="font-medium">{f.title}</span>
                  <p className="text-slate-600">{f.detail}</p>
                </li>
              ))}
            </ul>
          )}

          {check.findings && check.findings.length > serverLevelFindings.length && (
            <p className="text-xs text-slate-400">
              {check.findings.length - serverLevelFindings.length} additional per-tool finding(s) shown in the tools section above.
            </p>
          )}

          {check.data && (
            <details className="text-xs text-slate-400">
              <summary className="cursor-pointer select-none hover:text-slate-900">Raw data</summary>
              <pre className="mt-2 max-h-64 overflow-auto rounded-lg border border-slate-200 bg-white p-2 text-slate-600">
                {JSON.stringify(check.data, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
