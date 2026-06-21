import type { CheckResult, Finding, ScanContext } from "../mcp/types";

interface CapabilityProbe<T> {
  label: string;
  method: string;
  declared: boolean;
  data: T | null;
  error: string | null;
}

async function probeCapability<T>(
  label: string,
  method: string,
  declared: boolean,
  fn: () => Promise<T>,
): Promise<CapabilityProbe<T>> {
  if (!declared) return { label, method, declared, data: null, error: null };
  try {
    return { label, method, declared, data: await fn(), error: null };
  } catch (err) {
    return { label, method, declared, data: null, error: err instanceof Error ? err.message : String(err) };
  }
}

// A server that advertises a capability in `initialize` but fails the corresponding
// list call is lying about what it supports — an agent relying on the declared
// capability will break. This is distinct from simply not supporting the
// capability (which is fine and not flagged).
function dishonestyFinding(probe: CapabilityProbe<unknown>): Finding | null {
  if (!probe.declared || probe.error === null) return null;
  return {
    severity: "medium",
    title: `Server declares "${probe.label}" capability but ${probe.method} failed`,
    detail: `The server's initialize response advertises the "${probe.label}" capability, but calling ${probe.method} failed: ${probe.error}`,
  };
}

export async function checkInventory(ctx: ScanContext): Promise<CheckResult> {
  if (!ctx.client) {
    return {
      id: "inventory",
      title: "Tools, Resources & Prompts",
      status: "skipped",
      summary: "Skipped because the connection failed.",
    };
  }

  const capabilities = ctx.client.getServerCapabilities();
  const [tools, resources, resourceTemplates, prompts] = await Promise.all([
    probeCapability("tools", "tools/list", Boolean(capabilities?.tools), () => ctx.client!.listTools()),
    probeCapability("resources", "resources/list", Boolean(capabilities?.resources), () =>
      ctx.client!.listResources(),
    ),
    probeCapability(
      "resources",
      "resources/templates/list",
      Boolean(capabilities?.resources),
      () => ctx.client!.listResourceTemplates(),
    ),
    probeCapability("prompts", "prompts/list", Boolean(capabilities?.prompts), () => ctx.client!.listPrompts()),
  ]);

  const toolCount = tools.data?.tools.length ?? 0;
  const resourceCount = resources.data?.resources.length ?? 0;
  const templateCount = resourceTemplates.data?.resourceTemplates.length ?? 0;
  const promptCount = prompts.data?.prompts.length ?? 0;

  const findings = [tools, resources, resourceTemplates, prompts]
    .map(dishonestyFinding)
    .filter((f): f is Finding => f !== null);

  return {
    id: "inventory",
    title: "Tools, Resources & Prompts",
    status: findings.length > 0 ? "error" : "ok",
    summary:
      findings.length > 0
        ? `${findings.length} declared capability/capabilities failed to list. ${toolCount} tool(s), ${resourceCount} resource(s), ${templateCount} resource template(s), ${promptCount} prompt(s).`
        : `${toolCount} tool(s), ${resourceCount} resource(s), ${templateCount} resource template(s), ${promptCount} prompt(s).`,
    data: {
      tools: tools.data?.tools ?? [],
      resources: resources.data?.resources ?? [],
      resourceTemplates: resourceTemplates.data?.resourceTemplates ?? [],
      prompts: prompts.data?.prompts ?? [],
    },
    findings,
  };
}
