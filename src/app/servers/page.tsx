import Link from "next/link";
import { EXAMPLE_SERVERS } from "@/lib/exampleServers";

export const metadata = {
  title: "Public MCP servers — MCPCheckup",
};

export default function ServersPage() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-black px-6 py-16 font-mono">
      <div className="flex w-full max-w-4xl flex-col items-center gap-3 text-center">
        <h1 className="glow-green text-3xl font-bold tracking-tight text-[#39ff14]">
          &gt; Public MCP servers_
        </h1>
        <p className="max-w-xl text-sm text-[#39ff14]/70">
          A short list of known public MCP servers. Pick one to run a full scan.
        </p>
        <Link
          href="/"
          className="text-xs font-medium text-[#ff8c00] underline-offset-4 hover:underline"
        >
          &larr; back to the scanner
        </Link>
      </div>

      <div className="mt-10 grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
        {EXAMPLE_SERVERS.map((server) => (
          <div
            key={server.url}
            className="flex flex-col gap-3 rounded border border-[#1a4d1a] bg-black p-5"
          >
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-base font-bold text-[#39ff14]">{server.name}</h2>
              <span className="rounded border border-[#ff8c00]/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#ff8c00]">
                {server.category}
              </span>
            </div>
            <p className="text-xs text-[#39ff14]/50">by {server.publisher}</p>
            <p className="flex-1 text-sm text-[#39ff14]/70">{server.description}</p>
            <p className="truncate font-mono text-xs text-[#39ff14]/40">{server.url}</p>
            <Link
              href={`/?url=${encodeURIComponent(server.url)}`}
              className="mt-1 rounded border border-[#ff8c00] bg-black px-4 py-2 text-center text-xs font-bold text-[#ff8c00] transition-colors hover:bg-[#ff8c00] hover:text-black"
            >
              Scan this server &rarr;
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
