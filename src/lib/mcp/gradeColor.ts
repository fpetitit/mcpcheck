import type { Grade } from "./score";

export function gradeColor(grade: Grade): string {
  if (grade === "A" || grade === "B") return "#4ade80";
  if (grade === "C" || grade === "D") return "#fb923c";
  return "#f87171";
}
