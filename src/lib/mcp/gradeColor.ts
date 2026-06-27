import type { Grade } from "./score";

export function gradeColor(grade: Grade): string {
  if (grade === "A" || grade === "B") return "#16a34a";
  if (grade === "C" || grade === "D") return "#ea580c";
  return "#dc2626";
}
