"use client";

import { useState } from "react";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";

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

function ToolEntry({ tool }: { tool: Tool }) {
  const [expanded, setExpanded] = useState(false);
  const properties = (tool.inputSchema?.properties ?? {}) as Record<string, JsonSchemaProperty>;
  const required = new Set(tool.inputSchema?.required ?? []);
  const paramNames = Object.keys(properties);
  const activeHints = ANNOTATION_HINTS.filter((h) => tool.annotations?.[h.key]);

  return (
    <li className="rounded-lg border border-[#27272a] bg-black/40">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left"
      >
        <div className="flex flex-wrap items-center gap-2">
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
        </div>
        <span className="text-xs text-white/50">{expanded ? "▾" : "▸"}</span>
      </button>

      {expanded && (
        <div className="flex flex-col gap-2 border-t border-[#27272a] px-3 py-2">
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
        </div>
      )}
    </li>
  );
}

export function ToolsList({ tools }: { tools: Tool[] }) {
  if (tools.length === 0) return null;

  return (
    <ul className="flex flex-col gap-2">
      {tools.map((tool) => (
        <ToolEntry key={tool.name} tool={tool} />
      ))}
    </ul>
  );
}
