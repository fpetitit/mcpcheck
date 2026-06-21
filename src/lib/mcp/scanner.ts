import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { connectToServer } from "./connect";
import { assertPublicTarget } from "./ssrfGuard";
import type { ScanResult } from "./types";
import { checkConnectivity } from "../checks/connectivity";
import { checkProtocolVersion } from "../checks/protocolVersion";
import { checkInventory } from "../checks/inventory";
import { checkSecurity } from "../checks/security";
import { checkNetwork } from "../checks/network";
import { checkLicense } from "../checks/license";

export async function scanMcpServer(rawUrl: string): Promise<ScanResult> {
  const startedAt = new Date().toISOString();
  const url = new URL(rawUrl);
  await assertPublicTarget(url);

  const ctx = await connectToServer(url);

  const connectivity = await checkConnectivity(ctx);
  const inventory = await checkInventory(ctx);
  const tools = (inventory.data?.tools as Tool[] | undefined) ?? [];
  const [protocolVersion, security, network, license] = await Promise.all([
    checkProtocolVersion(ctx),
    checkSecurity(ctx, tools),
    checkNetwork(ctx),
    checkLicense(ctx),
  ]);

  if (ctx.client) {
    await ctx.client.close().catch(() => undefined);
  }

  return {
    target: url.toString(),
    startedAt,
    finishedAt: new Date().toISOString(),
    checks: [connectivity, protocolVersion, inventory, security, network, license],
  };
}
