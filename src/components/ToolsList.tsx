"use client";

import { useMemo, useState } from "react";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { Finding } from "@/lib/mcp/types";
import { SEVERITY_BORDER_TEXT, SEVERITY_DOT } from "@/lib/severityStyle";

type JsonSchemaProperty = {
  type?: string;
  description?: string;
};

const ANNOTATION_HINTS: Array<{
  key: "destructiveHint" | "readOnlyHint" | "idempotentHint" | "openWorldHint";
  label: string;
  style: string;
}> = [
  { key: "destructiveHint", label: "destructive", style: "border-red-400/60 text-red-400" },
  { key: "readOnlyHint", label: "read-only", style: "border-white/60 text-white" },
  { key: "idempotentHint", label: "idempotent", style: "border-white/40 text-white/80" },
  { key: "openWorldHint", label: "open-world", style: "border-[#fb923c]/60 text-[#fb923c]" },
];

function ToolEntry({ tool, findings }: { tool: Tool; findings: Finding[] }) {
  const [expanded, setExpanded] = useState(false);
  const properties = (tool.inputSchema?.properties ?? {}) as Record<string, JsonSchemaProperty>;
  const required = new Set(tool.inputSchema?.required ?? []);
  const paramNames = Object.keys(properties);
  const activeHints = ANNOTATION_HINTS.filter((h) => tool.annotations?.[h.key]);
  const severityOrder: Finding["severity"][] = ["info", "low", "medium", "high", "critical"];
  const worstSeverity = findings.reduce<Finding["severity"] | null>((acc, f) => {
    if (!acc) return f.severity;
    return severityOrder.indexOf(f.severity) > severityOrder.indexOf(acc) ? f.severity : acc;
  }, null);
  const worstSeverityDot = worstSeverity ? SEVERITY_DOT[worstSeverity] : null;

  return (
    <li className="rounded-lg border border-[#27272a] bg-black/40">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left"
      >
        <div className="flex flex-wrap items-center gap-2">
          {worstSeverityDot && (
            <span className={`h-1.5 w-1.5 rounded-full ${worstSeverityDot}`} title={`${findings.length} finding(s)`} />
          )}
          <span className="font-mono text-sm text-white">{tool.name}</span>
          {activeHints.map((h) => (
            <span
              key={h.key}
              className={`rounded border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${h.style}`}
            >
              {h.label}
            </span>
          ))}
          <span className="text-xs text-white/50">
            {paramNames.length === 0 ? "no params" : `${paramNames.length} param${paramNames.length > 1 ? "s" : ""}`}
          </span>
          {findings.length > 0 && (
            <span className="text-xs text-white/50">
              &middot; {findings.length} finding{findings.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <span className="text-xs text-white/50">{expanded ? "▾" : "▸"}</span>
      </button>

      {expanded && (
        <div className="flex flex-col gap-3 border-t border-[#27272a] px-3 py-2">
          {tool.description && <p className="text-sm text-white/70">{tool.description}</p>}
          {paramNames.length > 0 && (
            <ul className="flex flex-col gap-1">
              {paramNames.map((name) => (
                <li key={name} className="flex flex-wrap items-baseline gap-2 text-xs">
                  <span className="font-mono text-white/90">{name}</span>
                  {properties[name].type && (
                    <span className="text-white/50">{properties[name].type}</span>
                  )}
                  {required.has(name) && (
                    <span className="text-[#fb923c]">required</span>
                  )}
                  {properties[name].description && (
                    <span className="text-white/60">— {properties[name].description}</span>
                  )}
                </li>
              ))}
            </ul>
          )}

          {findings.length > 0 && (
            <ul className="flex flex-col gap-2">
              {findings.map((f, i) => (
                <li
                  key={i}
                  className={`border-l-2 pl-3 text-xs ${SEVERITY_BORDER_TEXT[f.severity] ?? "border-l-white/30"}`}
                >
                  <span className="font-medium">{f.title}</span>
                  <p className="text-white/65">{f.detail}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  );
}

export function ToolsList({ tools, findings = [] }: { tools: Tool[]; findings?: Finding[] }) {
  const [query, setQuery] = useState("");

  const findingsByTool = useMemo(() => {
    const map = new Map<string, Finding[]>();
    for (const f of findings) {
      if (!f.toolName) continue;
      const existing = map.get(f.toolName) ?? [];
      existing.push(f);
      map.set(f.toolName, existing);
    }
    return map;
  }, [findings]);

  const filteredTools = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tools;
    return tools.filter(
      (tool) => tool.name.toLowerCase().includes(q) || (tool.description ?? "").toLowerCase().includes(q),
    );
  }, [tools, query]);

  if (tools.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {tools.length > 5 && (
        <input
          type="text"
          placeholder="filter tools by name or description…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="rounded-lg border border-[#27272a] bg-black px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus:border-white"
        />
      )}
      {filteredTools.length === 0 ? (
        <p className="text-sm text-white/50">No tools match &ldquo;{query}&rdquo;.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {filteredTools.map((tool) => (
            <ToolEntry key={tool.name} tool={tool} findings={findingsByTool.get(tool.name) ?? []} />
          ))}
        </ul>
      )}
    </div>
  );
}
