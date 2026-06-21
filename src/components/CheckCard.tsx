import type { CheckResult } from "@/lib/mcp/types";
import { StatusBadge } from "./StatusBadge";

const SEVERITY_STYLES: Record<string, string> = {
  info: "border-l-zinc-400",
  low: "border-l-blue-400",
  medium: "border-l-amber-400",
  high: "border-l-red-400",
  critical: "border-l-red-600",
};

export function CheckCard({ check }: { check: CheckResult }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{check.title}</h3>
        <StatusBadge status={check.status} />
      </div>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{check.summary}</p>

      {check.error && (
        <p className="rounded bg-red-50 p-2 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {check.error}
        </p>
      )}

      {check.findings && check.findings.length > 0 && (
        <ul className="flex flex-col gap-2">
          {check.findings.map((f, i) => (
            <li
              key={i}
              className={`border-l-2 pl-3 text-xs ${SEVERITY_STYLES[f.severity] ?? "border-l-zinc-300"}`}
            >
              <span className="font-medium text-zinc-800 dark:text-zinc-200">{f.title}</span>
              <p className="text-zinc-500 dark:text-zinc-400">{f.detail}</p>
            </li>
          ))}
        </ul>
      )}

      {check.data && (
        <details className="text-xs text-zinc-500 dark:text-zinc-400">
          <summary className="cursor-pointer select-none">Raw data</summary>
          <pre className="mt-2 max-h-64 overflow-auto rounded bg-zinc-50 p-2 dark:bg-zinc-950">
            {JSON.stringify(check.data, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
