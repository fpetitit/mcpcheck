import type { CheckResult, ScanResult, Severity } from "./types";

export type Grade = "A" | "B" | "C" | "D" | "F";

export interface Score {
  value: number;
  grade: Grade;
}

const FINDING_PENALTY: Record<Severity, number> = {
  critical: 35,
  high: 20,
  medium: 10,
  low: 4,
  info: 0,
};

const STATUS_PENALTY: Record<CheckResult["status"], number> = {
  error: 15,
  warning: 5,
  ok: 0,
  skipped: 0,
};

function gradeFor(value: number): Grade {
  if (value >= 90) return "A";
  if (value >= 75) return "B";
  if (value >= 60) return "C";
  if (value >= 40) return "D";
  return "F";
}

export function computeScore(checks: ScanResult["checks"]): Score {
  let penalty = 0;
  for (const check of checks) {
    penalty += STATUS_PENALTY[check.status];
    for (const finding of check.findings ?? []) {
      penalty += FINDING_PENALTY[finding.severity];
    }
  }

  const value = Math.max(0, Math.min(100, Math.round(100 - penalty)));
  return { value, grade: gradeFor(value) };
}
