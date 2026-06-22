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
import { checkMonetization } from "../checks/monetization";
import { checkContextFootprint } from "../checks/contextFootprint";
import { checkSchemaQuality } from "../checks/schemaQuality";
import { checkHistory } from "../checks/history";
import { getPreviousScan, saveScan } from "../history/store";
import { computeScore } from "./score";

export async function scanMcpServer(rawUrl: string): Promise<ScanResult> {
  const startedAt = new Date().toISOString();
  const url = new URL(rawUrl);
  await assertPublicTarget(url);

  const previousScan = await getPreviousScan(url.toString());
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
  const schemaQuality = checkSchemaQuality(tools);
  const monetization = checkMonetization(ctx, tools);

  if (ctx.client) {
    await ctx.client.close().catch(() => undefined);
  }

  const scoredChecks = [
    connectivity,
    protocolVersion,
    inventory,
    security,
    network,
    license,
    contextFootprint,
    schemaQuality,
    monetization,
  ];
  const preliminaryScore = computeScore(scoredChecks);
  const history = checkHistory(previousScan, tools, preliminaryScore.value);
  const checks = [...scoredChecks, history];
  const score = computeScore(checks);

  const result: ScanResult = {
    target: url.toString(),
    startedAt,
    finishedAt: new Date().toISOString(),
    checks,
    score: score.value,
    grade: score.grade,
    axes: score.axes,
  };

  await saveScan(result);

  return result;
}
