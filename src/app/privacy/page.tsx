import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — MCPCheckup",
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-black px-6 py-16 font-mono">
      <div className="flex w-full max-w-2xl flex-col items-center gap-3 text-center">
        <h1 className="glow-green text-3xl font-bold tracking-tight text-[#39ff14]">
          &gt; Privacy Policy_
        </h1>
        <Link href="/" className="text-xs font-medium text-[#ff8c00] underline-offset-4 hover:underline">
          &larr; back to the scanner
        </Link>
      </div>

      <div className="mt-10 flex w-full max-w-2xl flex-col gap-6 rounded border border-[#1a4d1a] bg-black p-6 text-sm leading-relaxed text-[#39ff14]/70">
        <p>Last updated: 2026-06-21</p>

        <section>
          <h2 className="mb-2 text-base font-bold text-[#39ff14]">1. No accounts</h2>
          <p>
            MCPCheckup does not require sign-up or login. There are no user accounts, passwords, or
            personal profiles.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-bold text-[#39ff14]">2. What is collected</h2>
          <p>
            When you scan a server, the URL you submit and the resulting scan report (checks, scores,
            and findings) may be stored to power the scan history feature, which compares a server&apos;s
            current scan against its previous scans for the same URL. No personal information about you
            (name, email, IP address) is stored alongside scan data.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-bold text-[#39ff14]">3. Analytics</h2>
          <p>
            MCPCheckup uses Vercel Analytics to understand basic, aggregated usage of the site (e.g. page
            views). This does not use cookies and does not track you across other sites.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-bold text-[#39ff14]">4. Third parties</h2>
          <p>
            Scanning a server necessarily means MCPCheckup connects to the URL you provide, which may log
            that connection on its own end &mdash; the same as visiting any URL. MCPCheckup does not sell
            or share collected data with third parties beyond its hosting (Vercel) and database (Neon)
            providers, which process data solely to operate the service.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-bold text-[#39ff14]">5. Data retention</h2>
          <p>
            Scan history is kept to power the history/comparison feature. You can request deletion of
            scan history for a specific URL by contacting us.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-bold text-[#39ff14]">6. Contact</h2>
          <p>
            Questions about this policy or data deletion requests:{" "}
            <span className="text-[#39ff14]">francois.petitit@gmail.com</span>. See also the{" "}
            <Link href="/terms" className="text-[#ff8c00] underline-offset-4 hover:underline">
              Terms of Service
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
