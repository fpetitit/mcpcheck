import { NextResponse } from "next/server";
import { z } from "zod";
import { scanMcpServer } from "@/lib/mcp/scanner";

const requestSchema = z.object({
  url: z.string().url(),
});

export async function POST(request: Request) {
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
