import type { ScanResult, Severity } from "./types";

export interface Fix {
  severity: Severity;
  title: string;
  detail: string;
  /** Where the issue is — a tool name or the check it came from. */
  area: string;
}

export interface TopFixes {
  fixes: Fix[];
  /** Actionable findings not shown in the top list. */
  moreCount: number;
}

const SEVERITY_RANK: Record<Severity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
  info: 0,
};

// Collapse findings that are the same kind across different tools (their titles
// differ only by the quoted tool/parameter name) so the top list shows distinct
// problems rather than the same one three times.
function kindKey(title: string): string {
  return title.replace(/"[^"]*"/g, '""');
}

/** Ranks a scan's actionable findings (everything above info) and returns the
 *  few most severe distinct problems to fix first — the "next steps" layer. */
export function getTopFixes(result: ScanResult, limit = 3): TopFixes {
  const actionable: Fix[] = [];
  for (const check of result.checks) {
    for (const f of check.findings ?? []) {
      if (f.severity === "info") continue;
      actionable.push({
        severity: f.severity,
        title: f.title,
        detail: f.detail,
        area: f.toolName ? `Tool "${f.toolName}"` : check.title,
      });
    }
  }

  actionable.sort((a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity]);

  const seen = new Set<string>();
  const fixes: Fix[] = [];
  for (const fix of actionable) {
    const key = kindKey(fix.title);
    if (seen.has(key)) continue;
    seen.add(key);
    fixes.push(fix);
    if (fixes.length === limit) break;
  }

  return { fixes, moreCount: actionable.length - fixes.length };
}
