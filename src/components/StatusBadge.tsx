import type { CheckResult } from "@/lib/mcp/types";

const STYLES: Record<CheckResult["status"], string> = {
  ok: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  error: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  skipped: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

const LABELS: Record<CheckResult["status"], string> = {
  ok: "OK",
  warning: "Warning",
  error: "Error",
  skipped: "Skipped",
};

export function StatusBadge({ status }: { status: CheckResult["status"] }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  );
}
