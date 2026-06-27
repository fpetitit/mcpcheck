import type { Severity } from "./mcp/types";

export const SEVERITY_BORDER_TEXT: Record<Severity, string> = {
  info: "border-l-slate-300 text-slate-500",
  low: "border-l-slate-400 text-slate-600",
  medium: "border-l-orange-500 text-orange-600",
  high: "border-l-orange-500 text-orange-600",
  critical: "border-l-red-500 text-red-600",
};

export const SEVERITY_DOT: Record<Severity, string> = {
  info: "bg-slate-300",
  low: "bg-slate-400",
  medium: "bg-orange-500",
  high: "bg-orange-500",
  critical: "bg-red-500",
};
