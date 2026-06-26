import type { Severity } from "./mcp/types";

export const SEVERITY_BORDER_TEXT: Record<Severity, string> = {
  info: "border-l-white/30 text-white/70",
  low: "border-l-white text-white",
  medium: "border-l-[#fb923c] text-[#fb923c]",
  high: "border-l-[#fb923c] text-[#fb923c]",
  critical: "border-l-red-400 text-red-400",
};

export const SEVERITY_DOT: Record<Severity, string> = {
  info: "bg-white/40",
  low: "bg-white",
  medium: "bg-[#fb923c]",
  high: "bg-[#fb923c]",
  critical: "bg-red-400",
};
