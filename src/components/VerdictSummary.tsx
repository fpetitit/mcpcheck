import type { Verdict, VerdictStatus } from "@/lib/mcp/verdict";

const STATUS_STYLE: Record<VerdictStatus, { symbol: string; chip: string }> = {
  ok: { symbol: "✓", chip: "border-green-200 bg-green-50 text-green-700" },
  warn: { symbol: "!", chip: "border-orange-200 bg-orange-50 text-orange-700" },
  bad: { symbol: "✕", chip: "border-red-200 bg-red-50 text-red-700" },
  unknown: { symbol: "–", chip: "border-slate-200 bg-slate-50 text-slate-400" },
};

export function VerdictSummary({ verdict }: { verdict: Verdict }) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">verdict</p>
        <p className="text-base leading-relaxed text-slate-900">{verdict.headline}</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {verdict.questions.map((q) => {
          const style = STATUS_STYLE[q.status];
          return (
            <div key={q.label} className="flex items-start gap-3 rounded-lg border border-slate-200 p-3">
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${style.chip}`}
                aria-hidden
              >
                {style.symbol}
              </span>
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-medium text-slate-900">{q.label}</p>
                <p className="text-xs leading-relaxed text-slate-600">{q.answer}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
