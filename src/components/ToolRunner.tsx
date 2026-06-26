"use client";

import { useMemo, useState } from "react";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";

type JsonSchemaProperty = {
  type?: string;
  description?: string;
  enum?: unknown[];
};

type ContentBlock =
  | { type: "text"; text: string }
  | { type: "image"; data: string; mimeType: string }
  | { type: string; [key: string]: unknown };

type CallResponse = {
  isError?: boolean;
  content?: ContentBlock[];
  structuredContent?: unknown;
  error?: string;
};

function coerce(prop: JsonSchemaProperty, raw: string): unknown {
  const type = prop.type;
  if (type === "number" || type === "integer") {
    const n = Number(raw);
    return Number.isNaN(n) ? raw : n;
  }
  if (type === "array" || type === "object") {
    // These don't fit a single text input, so the field holds raw JSON.
    return JSON.parse(raw);
  }
  return raw;
}

export function ToolRunner({ tool, target }: { tool: Tool; target: string }) {
  const properties = (tool.inputSchema?.properties ?? {}) as Record<string, JsonSchemaProperty>;
  const required = useMemo(() => new Set(tool.inputSchema?.required ?? []), [tool.inputSchema]);
  const paramNames = Object.keys(properties);
  const isReadOnly = tool.annotations?.readOnlyHint === true;

  const [values, setValues] = useState<Record<string, string>>({});
  const [bools, setBools] = useState<Record<string, boolean>>({});
  const [authorization, setAuthorization] = useState("");
  const [showAuth, setShowAuth] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [running, setRunning] = useState(false);
  const [response, setResponse] = useState<CallResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setError(null);
    setResponse(null);

    const args: Record<string, unknown> = {};
    try {
      for (const name of paramNames) {
        const prop = properties[name];
        if (prop.type === "boolean") {
          if (bools[name] !== undefined) args[name] = bools[name];
          continue;
        }
        const raw = values[name];
        if (raw === undefined || raw === "") {
          if (required.has(name)) throw new Error(`Missing required parameter "${name}".`);
          continue;
        }
        args[name] = coerce(prop, raw);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid input.");
      return;
    }

    setRunning(true);
    try {
      const res = await fetch("/api/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: target,
          toolName: tool.name,
          arguments: args,
          authorization: authorization.trim() || undefined,
        }),
      });
      const json = (await res.json()) as CallResponse;
      if (!res.ok) {
        setError(json.error ?? "Tool call failed.");
      } else {
        setResponse(json);
      }
    } catch {
      setError("Network error while calling the tool.");
    } finally {
      setRunning(false);
    }
  }

  function handleRunClick() {
    if (!isReadOnly && !confirmed) {
      setConfirmed(true);
      return;
    }
    run();
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Try it</p>
        {isReadOnly ? (
          <span className="rounded border border-slate-300 px-1.5 py-0.5 text-[10px] uppercase text-slate-600">
            read-only
          </span>
        ) : (
          <span className="rounded border border-orange-300 px-1.5 py-0.5 text-[10px] uppercase text-orange-600">
            may have side effects
          </span>
        )}
      </div>

      {paramNames.length > 0 && (
        <div className="flex flex-col gap-2">
          {paramNames.map((name) => {
            const prop = properties[name];
            const label = (
              <span className="flex flex-wrap items-baseline gap-1.5 text-xs">
                <span className="font-mono text-slate-800">{name}</span>
                {prop.type && <span className="text-slate-400">{prop.type}</span>}
                {required.has(name) && <span className="text-orange-600">required</span>}
              </span>
            );
            if (prop.type === "boolean") {
              return (
                <label key={name} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={bools[name] ?? false}
                    onChange={(e) => setBools((v) => ({ ...v, [name]: e.target.checked }))}
                    className="accent-orange-500"
                  />
                  {label}
                </label>
              );
            }
            if (Array.isArray(prop.enum) && prop.enum.length > 0) {
              return (
                <label key={name} className="flex flex-col gap-1">
                  {label}
                  <select
                    value={values[name] ?? ""}
                    onChange={(e) => setValues((v) => ({ ...v, [name]: e.target.value }))}
                    className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 outline-none focus:border-orange-500"
                  >
                    <option value="">—</option>
                    {prop.enum.map((opt) => (
                      <option key={String(opt)} value={String(opt)}>
                        {String(opt)}
                      </option>
                    ))}
                  </select>
                </label>
              );
            }
            const isComplex = prop.type === "array" || prop.type === "object";
            return (
              <label key={name} className="flex flex-col gap-1">
                {label}
                {isComplex ? (
                  <textarea
                    rows={2}
                    placeholder={`JSON ${prop.type}`}
                    value={values[name] ?? ""}
                    onChange={(e) => setValues((v) => ({ ...v, [name]: e.target.value }))}
                    className="rounded border border-slate-200 bg-white px-2 py-1 font-mono text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:border-orange-500"
                  />
                ) : (
                  <input
                    type={prop.type === "number" || prop.type === "integer" ? "number" : "text"}
                    placeholder={prop.description ?? ""}
                    value={values[name] ?? ""}
                    onChange={(e) => setValues((v) => ({ ...v, [name]: e.target.value }))}
                    className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:border-orange-500"
                  />
                )}
              </label>
            );
          })}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() => setShowAuth((v) => !v)}
          className="self-start text-[11px] text-slate-400 underline-offset-2 hover:text-slate-900 hover:underline"
        >
          {showAuth ? "− hide auth header" : "+ add auth header (optional)"}
        </button>
        {showAuth && (
          <input
            type="password"
            placeholder="Authorization header value, e.g. Bearer sk-…"
            value={authorization}
            onChange={(e) => setAuthorization(e.target.value)}
            className="rounded border border-slate-200 bg-white px-2 py-1 font-mono text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:border-orange-500"
          />
        )}
      </div>

      {!isReadOnly && confirmed && (
        <p className="rounded border border-orange-300 bg-orange-50 px-2 py-1.5 text-[11px] text-orange-600">
          This tool isn&apos;t marked read-only and may change state on the server. Click Run again to confirm.
        </p>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleRunClick}
          disabled={running}
          className="rounded border border-orange-500 px-3 py-1 text-xs font-bold text-orange-600 transition-colors hover:bg-orange-600 hover:text-white disabled:opacity-50"
        >
          {running ? "Running…" : !isReadOnly && confirmed ? "Confirm & run" : "Run"}
        </button>
        {(response || error) && (
          <button
            type="button"
            onClick={() => {
              setResponse(null);
              setError(null);
              setConfirmed(false);
            }}
            className="text-[11px] text-slate-400 hover:text-slate-900"
          >
            clear
          </button>
        )}
      </div>

      {error && (
        <p className="rounded border border-red-200 px-2 py-1.5 text-xs text-red-600">{error}</p>
      )}

      {response && (
        <div className="flex flex-col gap-2">
          {response.isError && (
            <p className="text-xs font-medium text-red-600">The tool returned an error result.</p>
          )}
          {response.content?.map((block, i) => {
            if (block.type === "text") {
              return (
                <pre
                  key={i}
                  className="max-h-64 overflow-auto rounded border border-slate-200 bg-white p-2 text-xs text-slate-700"
                >
                  {(block as { text: string }).text}
                </pre>
              );
            }
            if (block.type === "image") {
              const img = block as { data: string; mimeType: string };
              return (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={`data:${img.mimeType};base64,${img.data}`}
                  alt="tool result"
                  className="max-h-64 w-fit rounded border border-slate-200"
                />
              );
            }
            return (
              <pre
                key={i}
                className="max-h-64 overflow-auto rounded border border-slate-200 bg-white p-2 text-xs text-slate-500"
              >
                {JSON.stringify(block, null, 2)}
              </pre>
            );
          })}
          {response.structuredContent != null && (
            <details className="text-xs text-slate-400">
              <summary className="cursor-pointer select-none hover:text-slate-900">Structured content</summary>
              <pre className="mt-1 max-h-64 overflow-auto rounded border border-slate-200 bg-white p-2 text-slate-600">
                {JSON.stringify(response.structuredContent, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
