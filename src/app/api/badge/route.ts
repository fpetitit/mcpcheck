import { getPreviousScan } from "@/lib/history/store";
import { gradeColor } from "@/lib/mcp/gradeColor";
import { renderBadge } from "@/lib/badge/renderBadge";

const UNKNOWN_COLOR = "#6b7280";

function svgResponse(svg: string, maxAgeSeconds: number) {
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": `public, max-age=${maxAgeSeconds}, s-maxage=${maxAgeSeconds}`,
    },
  });
}

// Badges are meant to sit in READMEs and be fetched by anyone's browser on every
// page view, so this reads the last stored scan rather than triggering a live
// scan per request — no rate limiting protects /api/scan from that traffic pattern.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get("url");

  let target: string;
  try {
    target = new URL(rawUrl ?? "").toString();
  } catch {
    return svgResponse(renderBadge({ label: "mcpcheckup", message: "invalid url", color: UNKNOWN_COLOR }), 300);
  }

  const scan = await getPreviousScan(target);
  if (!scan) {
    return svgResponse(renderBadge({ label: "mcpcheckup", message: "not scanned", color: UNKNOWN_COLOR }), 300);
  }

  const message = `${scan.grade} · ${scan.score}/100`;
  return svgResponse(renderBadge({ label: "mcpcheckup", message, color: gradeColor(scan.grade) }), 1800);
}
