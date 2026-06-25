import { ImageResponse } from "next/og";
import { scanMcpServer } from "@/lib/mcp/scanner";
import { gradeColor } from "@/lib/mcp/gradeColor";
import type { AxisScore } from "@/lib/mcp/score";

function ogRadar(axes: AxisScore[], color: string, size = 220) {
  const center = size / 2;
  const radius = size / 2 - 40;
  const angleStep = (2 * Math.PI) / axes.length;

  function pointFor(value: number, index: number): [number, number] {
    const angle = -Math.PI / 2 + index * angleStep;
    const r = (value / 100) * radius;
    return [center + r * Math.cos(angle), center + r * Math.sin(angle)];
  }

  const valuePolygon = axes.map((a, i) => pointFor(a.value, i).join(",")).join(" ");
  const gridLevels = [0.5, 1];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {gridLevels.map((level) => (
        <polygon
          key={level}
          points={axes.map((_, i) => pointFor(level * 100, i).join(",")).join(" ")}
          fill="none"
          stroke="#4ade8033"
          strokeWidth={1}
        />
      ))}
      <polygon points={valuePolygon} fill={`${color}33`} stroke={color} strokeWidth={2} />
    </svg>
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return new Response("Missing 'url' query param.", { status: 400 });
  }

  let host = targetUrl;
  let score = 0;
  let grade: "A" | "B" | "C" | "D" | "F" = "F";
  let axes: AxisScore[] = [];

  try {
    const result = await scanMcpServer(targetUrl);
    host = new URL(result.target).host;
    score = result.score;
    grade = result.grade;
    axes = result.axes;
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
        <div style={{ display: "flex", color: "#4ade80", fontSize: 28, opacity: 0.8 }}>
          &gt; MCPCheckup_
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "40px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 180,
              height: 180,
              borderRadius: "50%",
              border: `8px solid ${color}`,
              color,
              fontSize: 96,
              fontWeight: 700,
            }}
          >
            {grade}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", color: "#ffffff", fontSize: 38, fontWeight: 700 }}>
              {host}
            </div>
            <div style={{ display: "flex", color, fontSize: 28 }}>
              MCP security score: {score}/100
            </div>
          </div>
          {axes.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ display: "flex" }}>{ogRadar(axes, color, 170)}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {axes.map((a) => (
                  <div key={a.label} style={{ display: "flex", color, fontSize: 16 }}>
                    {a.label}: {a.value}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", color: "#4ade80", fontSize: 22, opacity: 0.5 }}>
          mcpcheckup.xyz &mdash; scan any remote MCP server
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
