import { cookies } from "next/headers";
import { isValidSessionToken, SESSION_COOKIE } from "@/lib/admin/auth";
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

  return (
    <div className="flex min-h-screen flex-col items-center bg-black px-6 py-16 font-mono">
      <div className="flex w-full max-w-md flex-col items-center gap-3 text-center">
        <h1 className="glow-green text-3xl font-bold tracking-tight text-[#39ff14]">
          &gt; Admin_
        </h1>
      </div>

      {!authenticated ? (
        <form
          action={login}
          className="mt-10 flex w-full max-w-sm flex-col gap-3 rounded border border-[#1a4d1a] bg-black p-6"
        >
          <label htmlFor="password" className="text-xs font-medium uppercase tracking-wide text-[#39ff14]/50">
            $ password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoFocus
            className="rounded border border-[#1a4d1a] bg-black px-4 py-2 font-mono text-sm text-[#39ff14] outline-none focus:border-[#39ff14]"
          />
          {error && <p className="text-xs text-[#ff8c00]">Access denied.</p>}
          <button
            type="submit"
            className="mt-2 rounded border border-[#ff8c00] bg-black px-4 py-2 text-sm font-bold text-[#ff8c00] transition-colors hover:bg-[#ff8c00] hover:text-black"
          >
            Authenticate
          </button>
        </form>
      ) : (
        <div className="mt-10 flex w-full max-w-sm flex-col items-center gap-4 rounded border border-[#1a4d1a] bg-black p-6 text-center">
          <p className="text-sm text-[#39ff14]/70">$ access granted. Nothing here yet.</p>
          <form action={logout}>
            <button
              type="submit"
              className="rounded border border-[#39ff14]/40 px-4 py-2 text-xs font-medium text-[#39ff14] transition-colors hover:border-[#39ff14] hover:bg-[#39ff14]/10"
            >
              Log out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
