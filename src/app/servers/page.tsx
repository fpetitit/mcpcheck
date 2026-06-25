import Link from "next/link";
import { EXAMPLE_SERVERS } from "@/lib/exampleServers";

export const metadata = {
  title: "Public MCP servers — MCPCheckup",
};

export default function ServersPage() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-black px-6 py-16 font-mono">
      <div className="flex w-full max-w-4xl flex-col items-center gap-3 text-center">
        <h1 className="glow-green text-3xl font-bold tracking-tight text-[#4ade80]">
          &gt; Public MCP servers_
        </h1>
        <p className="max-w-xl text-sm text-[#4ade80]/70">
          A short list of known public MCP servers. Pick one to run a full scan.
        </p>
        <Link
          href="/"
          className="text-xs font-medium text-[#fb923c] underline-offset-4 hover:underline"
        >
          &larr; back to the scanner
        </Link>
      </div>

      <div className="mt-10 grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
        {EXAMPLE_SERVERS.map((server) => (
          <div
            key={server.url}
            className="flex flex-col gap-3 rounded-lg border border-[#1f3a28] bg-black p-5"
          >
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-base font-bold text-[#4ade80]">{server.name}</h2>
              <span className="rounded-lg border border-[#fb923c]/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#fb923c]">
                {server.category}
              </span>
            </div>
            <p className="text-xs text-[#4ade80]/50">by {server.publisher}</p>
            <p className="flex-1 text-sm text-[#4ade80]/70">{server.description}</p>
            <p className="truncate font-mono text-xs text-[#4ade80]/40">{server.url}</p>
            <Link
              href={`/?url=${encodeURIComponent(server.url)}`}
              className="mt-1 rounded-lg border border-[#fb923c] bg-black px-4 py-2 text-center text-xs font-bold text-[#fb923c] transition-colors hover:bg-[#fb923c] hover:text-black"
            >
              Scan this server &rarr;
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
