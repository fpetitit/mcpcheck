import { NextResponse } from "next/server";
import { z } from "zod";
import { connectToServer } from "@/lib/mcp/connect";
import { assertPublicTarget } from "@/lib/mcp/ssrfGuard";
import { checkRateLimit } from "@/lib/rateLimit/limiter";

const requestSchema = z.object({
  url: z.string().url(),
  toolName: z.string().min(1),
  arguments: z.record(z.string(), z.unknown()).default({}),
  authorization: z.string().trim().min(1).optional(),
});

// Calling a tool is heavier and more sensitive than scanning, so it gets a
// tighter budget than /api/scan.
const RATE_LIMIT = 30;
const RATE_LIMIT_WINDOW_SECONDS = 5 * 60;
const CALL_TIMEOUT_MS = 30_000;

function clientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: Request) {
  const ip = clientIp(request);
  const rateLimit = await checkRateLimit(`call:${ip}`, RATE_LIMIT, RATE_LIMIT_WINDOW_SECONDS);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many tool calls. Please slow down and try again shortly." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  const { url: rawUrl, toolName, arguments: args, authorization } = parsed.data;

  let url: URL;
  try {
    url = new URL(rawUrl);
    await assertPublicTarget(url);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid target URL.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const ctx = await connectToServer(url, authorization);
  if (!ctx.client) {
    return NextResponse.json(
      { error: `Could not connect to the server. ${ctx.connectError ?? ""}`.trim() },
      { status: 502 },
    );
  }

  try {
    const result = await ctx.client.callTool({ name: toolName, arguments: args }, undefined, {
      timeout: CALL_TIMEOUT_MS,
    });
    return NextResponse.json({
      isError: result.isError ?? false,
      content: result.content ?? [],
      structuredContent: result.structuredContent ?? null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Tool call failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  } finally {
    await ctx.client.close().catch(() => undefined);
  }
}
