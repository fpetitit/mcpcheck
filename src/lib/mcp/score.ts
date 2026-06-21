import type { CheckResult, ScanResult, Severity } from "./types";

export type Grade = "A" | "B" | "C" | "D" | "F";

export type Axis = "security" | "reliability" | "ergonomics" | "governance";

export interface AxisScore {
  axis: Axis;
  label: string;
  value: number;
}

export interface Score {
  value: number;
  grade: Grade;
  axes: AxisScore[];
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

const AXIS_FOR_CHECK: Record<string, Axis> = {
  security: "security",
  network: "security",
  connectivity: "reliability",
  "protocol-version": "reliability",
  inventory: "reliability",
  "context-footprint": "ergonomics",
  "schema-quality": "ergonomics",
  license: "governance",
};

const AXIS_LABELS: Record<Axis, string> = {
  security: "Security",
  reliability: "Reliability",
  ergonomics: "Agent Ergonomics",
  governance: "Governance",
};

const AXIS_WEIGHTS: Record<Axis, number> = {
  security: 0.45,
  reliability: 0.25,
  ergonomics: 0.2,
  governance: 0.1,
};

function gradeFor(value: number): Grade {
  if (value >= 90) return "A";
  if (value >= 75) return "B";
  if (value >= 60) return "C";
  if (value >= 40) return "D";
  return "F";
}

function scoreForChecks(checks: CheckResult[]): number {
  let penalty = 0;
  for (const check of checks) {
    penalty += STATUS_PENALTY[check.status];
    for (const finding of check.findings ?? []) {
      penalty += FINDING_PENALTY[finding.severity];
    }
  }
  return Math.max(0, Math.min(100, Math.round(100 - penalty)));
}

export function computeScore(checks: ScanResult["checks"]): Score {
  const checksByAxis = new Map<Axis, CheckResult[]>();
  for (const check of checks) {
    const axis = AXIS_FOR_CHECK[check.id];
    if (!axis) continue;
    checksByAxis.set(axis, [...(checksByAxis.get(axis) ?? []), check]);
  }

  const axes: AxisScore[] = (Object.keys(AXIS_WEIGHTS) as Axis[]).map((axis) => ({
    axis,
    label: AXIS_LABELS[axis],
    value: scoreForChecks(checksByAxis.get(axis) ?? []),
  }));

  const value = Math.round(axes.reduce((sum, a) => sum + a.value * AXIS_WEIGHTS[a.axis], 0));
  return { value, grade: gradeFor(value), axes };
}
