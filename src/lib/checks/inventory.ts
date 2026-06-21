import type { CheckResult, ScanContext } from "../mcp/types";

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
    capabilities?.tools ? ctx.client.listTools().catch(() => null) : Promise.resolve(null),
    capabilities?.resources ? ctx.client.listResources().catch(() => null) : Promise.resolve(null),
    capabilities?.resources
      ? ctx.client.listResourceTemplates().catch(() => null)
      : Promise.resolve(null),
    capabilities?.prompts ? ctx.client.listPrompts().catch(() => null) : Promise.resolve(null),
  ]);

  const toolCount = tools?.tools.length ?? 0;
  const resourceCount = resources?.resources.length ?? 0;
  const templateCount = resourceTemplates?.resourceTemplates.length ?? 0;
  const promptCount = prompts?.prompts.length ?? 0;

  return {
    id: "inventory",
    title: "Tools, Resources & Prompts",
    status: "ok",
    summary: `${toolCount} tool(s), ${resourceCount} resource(s), ${templateCount} resource template(s), ${promptCount} prompt(s).`,
    data: {
      tools: tools?.tools ?? [],
      resources: resources?.resources ?? [],
      resourceTemplates: resourceTemplates?.resourceTemplates ?? [],
      prompts: prompts?.prompts ?? [],
    },
  };
}
