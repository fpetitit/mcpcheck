import { cookies } from "next/headers";
import { isValidSessionToken, SESSION_COOKIE } from "@/lib/admin/auth";
import { getRecentScans } from "@/lib/history/store";
import { gradeColor } from "@/lib/mcp/gradeColor";
import { login, logout } from "./actions";

export const metadata = {
  title: "Admin — MCPCheckup",
  robots: { index: false, follow: false },
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const cookieStore = await cookies();
  const authenticated = isValidSessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  const recentScans = authenticated ? await getRecentScans(50) : [];

  return (
    <div className="flex min-h-screen flex-col items-center bg-black px-6 py-16">
      <div className="flex w-full max-w-md flex-col items-center gap-3 text-center">
        <h1 className="glow-green text-3xl font-bold tracking-tight text-[#4ade80]">
          &gt; Admin_
        </h1>
      </div>

      {!authenticated ? (
        <form
          action={login}
          className="mt-10 flex w-full max-w-sm flex-col gap-3 rounded-lg border border-[#27272a] bg-black p-6"
        >
          <label htmlFor="password" className="text-xs font-medium uppercase tracking-wide text-white/60">
            password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoFocus
            className="rounded-lg border border-[#27272a] bg-black px-4 py-2 font-mono text-sm text-white outline-none focus:border-white"
          />
          {error && <p className="text-xs text-[#fb923c]">Access denied.</p>}
          <button
            type="submit"
            className="mt-2 rounded-lg border border-[#fb923c] bg-black px-4 py-2 text-sm font-bold text-[#fb923c] transition-colors hover:bg-[#fb923c] hover:text-black"
          >
            Authenticate
          </button>
        </form>
      ) : (
        <div className="mt-10 flex w-full max-w-3xl flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-wide text-white/60">
              recent scans ({recentScans.length})
            </p>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-lg border border-white/40 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:border-white hover:bg-white/10"
              >
                Log out
              </button>
            </form>
          </div>

          <div className="overflow-x-auto rounded-lg border border-[#27272a]">
            {recentScans.length === 0 ? (
              <p className="p-6 text-center text-sm text-white/60">
                No scans recorded yet, or no database configured for this deployment.
              </p>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#27272a] text-white/60">
                    <th className="px-4 py-2 font-medium">Target</th>
                    <th className="px-4 py-2 font-medium">Scanned at</th>
                    <th className="px-4 py-2 text-right font-medium">Score</th>
                    <th className="px-4 py-2 text-right font-medium">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {recentScans.map((scan, i) => (
                    <tr key={`${scan.target}-${scan.scannedAt}-${i}`} className="border-b border-[#27272a]/40">
                      <td className="max-w-xs truncate px-4 py-2 font-mono text-white/80" title={scan.target}>
                        {scan.target}
                      </td>
                      <td className="px-4 py-2 text-white/60">{new Date(scan.scannedAt).toLocaleString()}</td>
                      <td className="px-4 py-2 text-right text-white/80">{scan.score}</td>
                      <td
                        className="px-4 py-2 text-right font-bold"
                        style={{ color: gradeColor(scan.grade) }}
                      >
                        {scan.grade}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
