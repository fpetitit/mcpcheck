import Link from "next/link";
import { EXAMPLE_SERVERS } from "@/lib/exampleServers";

export const metadata = {
  title: "Public MCP servers — MCPCheckup",
};

export default function ServersPage() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-white px-6 py-16">
      <div className="flex w-full max-w-4xl flex-col items-center gap-3 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Public MCP servers
        </h1>
        <p className="max-w-xl text-sm text-slate-600">
          A short list of known public MCP servers. Pick one to run a full scan.
        </p>
        <Link
          href="/"
          className="text-xs font-medium text-indigo-600 underline-offset-4 hover:underline"
        >
          &larr; back to the scanner
        </Link>
      </div>

      <div className="mt-10 grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
        {EXAMPLE_SERVERS.map((server) => (
          <div
            key={server.url}
            className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-5"
          >
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-base font-bold text-slate-900">{server.name}</h2>
              <span className="rounded-lg border border-indigo-200 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-indigo-600">
                {server.category}
              </span>
            </div>
            <p className="text-xs text-slate-500">by {server.publisher}</p>
            <p className="flex-1 text-sm text-slate-600">{server.description}</p>
            <p className="truncate font-mono text-xs text-slate-500">{server.url}</p>
            <Link
              href={`/?url=${encodeURIComponent(server.url)}`}
              className="mt-1 rounded-lg border border-indigo-500 bg-white px-4 py-2 text-center text-xs font-bold text-indigo-600 transition-colors hover:bg-indigo-600 hover:text-white"
            >
              Scan this server &rarr;
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
