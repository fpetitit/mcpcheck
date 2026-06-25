import { NextResponse } from "next/server";
import { z } from "zod";
import { scanMcpServer } from "@/lib/mcp/scanner";
import { checkRateLimit } from "@/lib/rateLimit/limiter";

const requestSchema = z.object({
  url: z.string().url(),
});

const RATE_LIMIT = 100;
const RATE_LIMIT_WINDOW_SECONDS = 5 * 60;

function clientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: Request) {
  const ip = clientIp(request);
  const rateLimit = await checkRateLimit(`scan:${ip}`, RATE_LIMIT, RATE_LIMIT_WINDOW_SECONDS);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many scan requests. Please slow down and try again shortly." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "A valid 'url' field is required." }, { status: 400 });
  }

  try {
    const result = await scanMcpServer(parsed.data.url);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
