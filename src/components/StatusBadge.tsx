import type { CheckResult } from "@/lib/mcp/types";

const STYLES: Record<CheckResult["status"], string> = {
  ok: "border border-green-200 bg-green-50 text-green-700",
  warning: "border border-orange-200 bg-orange-50 text-orange-700",
  error: "border border-red-200 bg-red-50 text-red-700",
  skipped: "border border-slate-200 bg-slate-50 text-slate-400",
};

const LABELS: Record<CheckResult["status"], string> = {
  ok: "OK",
  warning: "Warning",
  error: "Error",
  skipped: "Skipped",
};

export function StatusBadge({ status }: { status: CheckResult["status"] }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
