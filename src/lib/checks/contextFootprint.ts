import { countTokens } from "gpt-tokenizer";
import type { Prompt, Resource, ResourceTemplate, Tool } from "@modelcontextprotocol/sdk/types.js";
import type { CheckResult, Finding } from "../mcp/types";

// Thresholds are rough budgets, not hard limits: this is what gets prefixed to
// *every* turn of a conversation, before the user has said anything, so the
// tolerance for "a lot" is much lower than for a single message.
const TOTAL_WARNING_TOKENS = 1500;
const TOTAL_ERROR_TOKENS = 4000;
const SINGLE_TOOL_WARNING_TOKENS = 400;

interface ToolFootprint {
  name: string;
  tokens: number;
}

function tokensFor(value: unknown): number {
  return countTokens(JSON.stringify(value));
}

export function checkContextFootprint(
  tools: Tool[],
  resources: Resource[],
  resourceTemplates: ResourceTemplate[],
  prompts: Prompt[],
): CheckResult {
  const toolFootprints: ToolFootprint[] = tools.map((tool) => ({
    name: tool.name,
    tokens: tokensFor({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    }),
  }));

  const toolsTokens = toolFootprints.reduce((sum, t) => sum + t.tokens, 0);
  const resourcesTokens = resources.reduce((sum, r) => sum + tokensFor(r), 0);
  const templatesTokens = resourceTemplates.reduce((sum, t) => sum + tokensFor(t), 0);
  const promptsTokens = prompts.reduce((sum, p) => sum + tokensFor(p), 0);

  const totalTokens = toolsTokens + resourcesTokens + templatesTokens + promptsTokens;

  const findings: Finding[] = [];

  if (totalTokens > TOTAL_ERROR_TOKENS) {
    findings.push({
      severity: "medium",
      title: `Manifest consumes ~${totalTokens} tokens of context on every turn`,
      detail:
        `The combined tool/resource/prompt manifest is roughly ${totalTokens} tokens, which is ` +
        "injected into the model's context before the conversation even starts. Large manifests " +
        "crowd out context budget and can degrade tool-selection accuracy.",
    });
  } else if (totalTokens > TOTAL_WARNING_TOKENS) {
    findings.push({
      severity: "low",
      title: `Manifest consumes ~${totalTokens} tokens of context on every turn`,
      detail:
        `The combined tool/resource/prompt manifest is roughly ${totalTokens} tokens. Consider ` +
        "trimming verbose descriptions or splitting rarely-used tools into a separate server.",
    });
  }

  const heaviestTools = toolFootprints
    .filter((t) => t.tokens > SINGLE_TOOL_WARNING_TOKENS)
    .sort((a, b) => b.tokens - a.tokens);

  for (const tool of heaviestTools.slice(0, 3)) {
    findings.push({
      severity: "info",
      title: `Tool "${tool.name}" alone costs ~${tool.tokens} tokens`,
      detail:
        "This tool's description and input schema are unusually verbose. Tightening it reduces " +
        "the context cost paid on every turn, regardless of whether this tool is used.",
    });
  }

  return {
    id: "context-footprint",
    title: "Context Footprint",
    status: totalTokens > TOTAL_WARNING_TOKENS ? "warning" : "ok",
    summary:
      `~${totalTokens} tokens total ` +
      `(tools: ${toolsTokens}, resources: ${resourcesTokens}, templates: ${templatesTokens}, prompts: ${promptsTokens}).`,
    data: {
      totalTokens,
      toolsTokens,
      resourcesTokens,
      templatesTokens,
      promptsTokens,
      perTool: toolFootprints,
    },
    findings,
  };
}
