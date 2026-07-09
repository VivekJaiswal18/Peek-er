import Link from "next/link";
import { ThemeToggle } from "../components/theme-toggle";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between">
          <Link className="flex items-center gap-3" href="/">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-emerald-600 text-sm font-semibold text-white">
              P
            </span>
            <span className="text-sm font-semibold">Peek-er</span>
          </Link>
          <ThemeToggle />
        </header>

        <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="hidden lg:block">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
              Welcome back
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-normal">
              Continue reviewing pull requests with repo context.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Open the review dashboard, inspect findings, ask questions about
              code, and tune project-specific rules.
            </p>
          </section>

          <section className="mx-auto w-full max-w-md rounded-md border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-semibold">Login</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Use your account to access connected repositories.
            </p>
            <form className="mt-6 space-y-4">
              <label className="block">
                <span className="text-sm font-medium">Email</span>
                <input
                  className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-emerald-900/40"
                  placeholder="vivek@example.com"
                  type="email"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Password</span>
                <input
                  className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-emerald-900/40"
                  placeholder="••••••••"
                  type="password"
                />
              </label>
              <Link
                className="block rounded-md bg-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-emerald-700"
                href="/dashboard"
              >
                Login
              </Link>
            </form>
            <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
              New to Peek-er?{" "}
              <Link className="font-semibold text-emerald-700 dark:text-emerald-400" href="/signup">
                Create an account
              </Link>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
