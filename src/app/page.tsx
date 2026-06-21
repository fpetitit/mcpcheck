import { ScannerForm } from "@/components/ScannerForm";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <div className="flex w-full max-w-4xl flex-col items-center gap-3 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          mcpcheck
        </h1>
        <p className="max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
          Inspect any remote MCP server: handshake, capabilities, exposed tools, security
          heuristics, TLS/network posture, and license information &mdash; in one scan.
        </p>
      </div>
      <div className="mt-10 w-full max-w-4xl">
        <ScannerForm />
      </div>
    </div>
  );
}
