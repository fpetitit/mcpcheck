import Link from "next/link";

export const metadata = {
  title: "Terms of Service — MCPCheckup",
};

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-black px-6 py-16 font-mono">
      <div className="flex w-full max-w-2xl flex-col items-center gap-3 text-center">
        <h1 className="glow-green text-3xl font-bold tracking-tight text-[#4ade80]">
          &gt; Terms of Service_
        </h1>
        <Link href="/" className="text-xs font-medium text-[#fb923c] underline-offset-4 hover:underline">
          &larr; back to the scanner
        </Link>
      </div>

      <div className="mt-10 flex w-full max-w-2xl flex-col gap-6 rounded-lg border border-[#1f3a28] bg-black p-6 text-sm leading-relaxed text-[#4ade80]/70">
        <p>Last updated: 2026-06-21</p>

        <section>
          <h2 className="mb-2 text-base font-bold text-[#4ade80]">1. What this service does</h2>
          <p>
            MCPCheckup connects to an MCP server URL you provide and runs a set of read-only checks
            against it (handshake, capability inventory, security heuristics, network/TLS posture,
            and related signals), then displays a score. MCPCheckup does not call any tools exposed
            by the server you scan, and does not execute or act on anything it finds.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-bold text-[#4ade80]">2. Your responsibility</h2>
          <p>
            You are responsible for only submitting URLs you are authorized to scan. MCPCheckup
            blocks scans of private/internal network ranges and localhost, but it is still your
            responsibility not to use this service to probe systems without permission.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-bold text-[#4ade80]">3. No warranty</h2>
          <p>
            MCPCheckup is provided &quot;as is&quot;, free of charge, with no warranty of any kind.
            Its checks are heuristic — they can produce false positives or false negatives — and are
            not a substitute for a professional security review. Scores and findings should inform,
            not replace, your own judgment.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-bold text-[#4ade80]">4. Availability</h2>
          <p>
            This is a free, independently-run tool. It may be modified, interrupted, or discontinued
            at any time without notice.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-bold text-[#4ade80]">5. License</h2>
          <p>
            The MCPCheckup source code is open source under the{" "}
            <a
              href="https://github.com/fpetitit/mcpcheck/blob/main/LICENSE"
              className="text-[#fb923c] underline-offset-4 hover:underline"
            >
              MIT License
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-bold text-[#4ade80]">6. Contact</h2>
          <p>
            Questions about these terms: <span className="text-[#4ade80]">francois.petitit@gmail.com</span>.
            See also the{" "}
            <Link href="/privacy" className="text-[#fb923c] underline-offset-4 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
