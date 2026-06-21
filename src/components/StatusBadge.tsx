import type { CheckResult } from "@/lib/mcp/types";

const STYLES: Record<CheckResult["status"], string> = {
  ok: "border border-[#39ff14] text-[#39ff14] shadow-[0_0_6px_rgba(57,255,20,0.4)]",
  warning: "border border-[#ff8c00] text-[#ff8c00] shadow-[0_0_6px_rgba(255,140,0,0.4)]",
  error: "border border-red-500 text-red-500 shadow-[0_0_6px_rgba(239,68,68,0.4)]",
  skipped: "border border-[#39ff14]/30 text-[#39ff14]/40",
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
