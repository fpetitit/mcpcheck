import type { CheckResult } from "@/lib/mcp/types";

const STYLES: Record<CheckResult["status"], string> = {
  ok: "border border-[#4ade80] text-[#4ade80] shadow-[0_0_6px_rgba(74,222,128,0.4)]",
  warning: "border border-[#fb923c] text-[#fb923c] shadow-[0_0_6px_rgba(251,146,60,0.4)]",
  error: "border border-red-400 text-red-400 shadow-[0_0_6px_rgba(248,113,113,0.4)]",
  skipped: "border border-white/20 text-white/40",
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
      className={`rounded px-2.5 py-0.5 font-mono text-xs font-medium uppercase ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
