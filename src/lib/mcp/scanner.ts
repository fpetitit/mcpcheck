import type { Prompt, Resource, ResourceTemplate, Tool } from "@modelcontextprotocol/sdk/types.js";
import { connectToServer } from "./connect";
import { assertPublicTarget } from "./ssrfGuard";
import type { ScanResult } from "./types";
import { checkConnectivity } from "../checks/connectivity";
import { checkProtocolVersion } from "../checks/protocolVersion";
import { checkInventory } from "../checks/inventory";
import { checkSecurity } from "../checks/security";
import { checkNetwork } from "../checks/network";
import { checkLicense } from "../checks/license";
import { checkContextFootprint } from "../checks/contextFootprint";
import { computeScore } from "./score";

export async function scanMcpServer(rawUrl: string): Promise<ScanResult> {
  const startedAt = new Date().toISOString();
  const url = new URL(rawUrl);
  await assertPublicTarget(url);

  const ctx = await connectToServer(url);

  const connectivity = await checkConnectivity(ctx);
  const inventory = await checkInventory(ctx);
  const tools = (inventory.data?.tools as Tool[] | undefined) ?? [];
  const resources = (inventory.data?.resources as Resource[] | undefined) ?? [];
  const resourceTemplates = (inventory.data?.resourceTemplates as ResourceTemplate[] | undefined) ?? [];
  const prompts = (inventory.data?.prompts as Prompt[] | undefined) ?? [];
  const [protocolVersion, security, network, license] = await Promise.all([
    checkProtocolVersion(ctx),
    checkSecurity(ctx, tools),
    checkNetwork(ctx),
    checkLicense(ctx),
  ]);
  const contextFootprint = checkContextFootprint(tools, resources, resourceTemplates, prompts);

  if (ctx.client) {
    await ctx.client.close().catch(() => undefined);
  }

  const checks = [connectivity, protocolVersion, inventory, security, network, license, contextFootprint];
  const score = computeScore(checks);

  return {
    target: url.toString(),
    startedAt,
    finishedAt: new Date().toISOString(),
    checks,
    score: score.value,
    grade: score.grade,
    axes: score.axes,
  };
}
