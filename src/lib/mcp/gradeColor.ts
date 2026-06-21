import type { Grade } from "./score";

export function gradeColor(grade: Grade): string {
  if (grade === "A" || grade === "B") return "#39ff14";
  if (grade === "C" || grade === "D") return "#ff8c00";
  return "#ef4444";
}
