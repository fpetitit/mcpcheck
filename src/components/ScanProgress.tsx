"use client";

import { useEffect, useState } from "react";

// The phases the scan actually moves through, in order. We can't stream real
// progress from the single /api/scan POST, so this steps forward on a timer to
// signal that real work is happening, holding on the last phase until results
// arrive and this component unmounts.
const PHASES = [
  "Connecting & MCP handshake",
  "Reading tools, resources & prompts",
  "Running security heuristics",
  "Checking network & TLS",
  "Scoring & grading",
];

export function ScanProgress() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((i) => (i < PHASES.length - 1 ? i + 1 : i));
    }, 650);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">scanning…</p>
      <ul className="flex flex-col gap-2.5">
        {PHASES.map((label, i) => {
          const state = i < active ? "done" : i === active ? "active" : "pending";
          return (
            <li key={label} className="flex items-center gap-3">
              {state === "done" ? (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-green-200 bg-green-50 text-[10px] font-bold text-green-700">
                  ✓
                </span>
              ) : state === "active" ? (
                <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
              ) : (
                <span className="h-5 w-5 shrink-0 rounded-full border border-slate-200" />
              )}
              <span
                className={
                  state === "active"
                    ? "text-sm font-medium text-slate-900"
                    : state === "done"
                      ? "text-sm text-slate-500"
                      : "text-sm text-slate-400"
                }
              >
                {label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
