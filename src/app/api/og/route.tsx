import { ImageResponse } from "next/og";
import { scanMcpServer } from "@/lib/mcp/scanner";
import { gradeColor } from "@/lib/mcp/gradeColor";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return new Response("Missing 'url' query param.", { status: 400 });
  }

  let host = targetUrl;
  let score = 0;
  let grade: "A" | "B" | "C" | "D" | "F" = "F";

  try {
    const result = await scanMcpServer(targetUrl);
    host = new URL(result.target).host;
    score = result.score;
    grade = result.grade;
  } catch {
    try {
      host = new URL(targetUrl).host;
    } catch {
      // keep raw input as host
    }
  }

  const color = gradeColor(grade);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#000000",
          padding: "60px",
          fontFamily: "monospace",
        }}
      >
        <div style={{ display: "flex", color: "#39ff14", fontSize: 28, opacity: 0.8 }}>
          &gt; MCPCheckup_
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "60px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 220,
              height: 220,
              borderRadius: "50%",
              border: `8px solid ${color}`,
              color,
              fontSize: 120,
              fontWeight: 700,
            }}
          >
            {grade}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", color: "#ffffff", fontSize: 44, fontWeight: 700 }}>
              {host}
            </div>
            <div style={{ display: "flex", color, fontSize: 36 }}>
              MCP security score: {score}/100
            </div>
          </div>
        </div>

        <div style={{ display: "flex", color: "#39ff14", fontSize: 22, opacity: 0.5 }}>
          mcpcheckup.xyz &mdash; scan any remote MCP server
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
