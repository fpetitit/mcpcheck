import { headers } from "next/headers";
import Link from "next/link";
import type { Metadata } from "next";
import { scanMcpServer } from "@/lib/mcp/scanner";
import { gradeColor } from "@/lib/mcp/gradeColor";
import { ScorecardShare } from "@/components/ScorecardShare";
import { AxisRadar } from "@/components/AxisRadar";

type Props = {
  searchParams: Promise<{ url?: string }>;
};

async function getBaseUrl() {
  const h = await headers();
  const host = h.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { url } = await searchParams;
  if (!url) {
    return { title: "Scorecard — MCPCheckup" };
  }

  const baseUrl = await getBaseUrl();
  const ogImage = `${baseUrl}/api/og?url=${encodeURIComponent(url)}`;
  const title = `MCP scorecard for ${new URL(url).host} — MCPCheckup`;
  const description = "Security and capability scorecard for a remote MCP server.";

  return {
    title,
    description,
    openGraph: { title, description, images: [ogImage] },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

export default async function ScorecardPage({ searchParams }: Props) {
  const { url } = await searchParams;

  if (!url) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black px-6 py-16 font-mono text-center">
        <p className="text-[#4ade80]/70">Missing a server to score.</p>
        <Link href="/" className="text-[#fb923c] underline-offset-4 hover:underline">
          &larr; back to the scanner
        </Link>
      </div>
    );
  }

  let result;
  try {
    result = await scanMcpServer(url);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black px-6 py-16 font-mono text-center">
        <p className="rounded-lg border border-[#fb923c] p-4 text-sm text-[#fb923c]">{message}</p>
        <Link href="/" className="text-[#fb923c] underline-offset-4 hover:underline">
          &larr; back to the scanner
        </Link>
      </div>
    );
  }

  const color = gradeColor(result.grade);
  const baseUrl = await getBaseUrl();
  const scorecardUrl = `${baseUrl}/scorecard?url=${encodeURIComponent(url)}`;
  const ogImageUrl = `${baseUrl}/api/og?url=${encodeURIComponent(url)}`;
  const embedSnippet = `<a href="${scorecardUrl}"><img src="${ogImageUrl}" alt="MCP scorecard for ${result.target}" width="600" /></a>`;
  const badgeUrl = `${baseUrl}/api/badge?url=${encodeURIComponent(url)}`;
  const badgeSnippet = `[![MCPCheckup](${badgeUrl})](${scorecardUrl})`;

  const counts = result.checks.reduce(
    (acc, c) => {
      acc[c.status] += 1;
      return acc;
    },
    { ok: 0, warning: 0, error: 0, skipped: 0 },
  );

  return (
    <div className="flex min-h-screen flex-col items-center bg-black px-6 py-16 font-mono">
      <div className="flex w-full max-w-2xl flex-col items-center gap-3 text-center">
        <h1 className="glow-green text-2xl font-bold tracking-tight text-[#4ade80]">
          &gt; MCP Scorecard_
        </h1>
        <Link href="/" className="text-xs font-medium text-[#fb923c] underline-offset-4 hover:underline">
          &larr; back to the scanner
        </Link>
      </div>

      <div className="mt-10 flex w-full max-w-2xl flex-col items-center gap-7 rounded-lg border border-[#1f3a28] bg-black p-9 shadow-[0_0_12px_rgba(74,222,128,0.1)]">
        <div
          className="flex h-32 w-32 items-center justify-center rounded-full border-4 text-5xl font-bold"
          style={{ borderColor: color, color }}
        >
          {result.grade}
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-base font-bold text-white">{new URL(result.target).host}</p>
          <p className="text-sm" style={{ color }}>
            MCP security score: {result.score}/100
          </p>
        </div>

        <div className="flex gap-4 text-xs text-[#4ade80]/60">
          <span>{counts.ok} ok</span>
          <span>{counts.warning} warning</span>
          <span>{counts.error} error</span>
          <span>{counts.skipped} skipped</span>
        </div>

        <AxisRadar axes={result.axes} color={color} />

        <Link
          href={`/?url=${encodeURIComponent(url)}`}
          className="rounded-lg border border-[#4ade80]/40 px-4 py-2 text-xs font-medium text-[#4ade80] transition-colors hover:border-[#4ade80] hover:bg-[#4ade80]/10"
        >
          View full scan results &rarr;
        </Link>
      </div>

      <div className="mt-8 w-full max-w-2xl">
        <ScorecardShare scorecardUrl={scorecardUrl} embedSnippet={embedSnippet} badgeSnippet={badgeSnippet} />
      </div>
    </div>
  );
}
