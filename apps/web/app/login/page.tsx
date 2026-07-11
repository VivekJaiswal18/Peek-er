"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { ThemeToggle } from "../components/theme-toggle";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7f7f8]" />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(data.message ?? "Could not log in");
      }

      const requestedPath = searchParams.get("returnTo");
      const returnTo = requestedPath?.startsWith("/")
        ? requestedPath
        : "/dashboard";
      router.replace(returnTo);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Could not log in",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f7f8] text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between">
          <Link className="flex items-center gap-3" href="/">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-orange-600 text-sm font-semibold text-white">
              P
            </span>
            <span className="text-sm font-semibold">Peek-er</span>
          </Link>
          <ThemeToggle />
        </header>

        <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="hidden lg:block">
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-700 dark:text-orange-400">
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
            {searchParams.get("github") === "authentication-required" && (
              <p className="mt-4 rounded-md border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-orange-800">
                Log in, then connect the GitHub App again.
              </p>
            )}
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <label className="block">
                <span className="text-sm font-medium">Email</span>
                <input
                  autoComplete="email"
                  className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-orange-900/40"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="vivek@example.com"
                  required
                  type="email"
                  value={email}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Password</span>
                <input
                  autoComplete="current-password"
                  className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-orange-900/40"
                  minLength={8}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  required
                  type="password"
                  value={password}
                />
              </label>
              {error && (
                <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {error}
                </p>
              )}
              <button
                className="block w-full rounded-md bg-orange-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </button>
            </form>
            <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
              New to Peek-er?{" "}
              <Link
                className="font-semibold text-orange-700 dark:text-orange-400"
                href="/signup"
              >
                Create an account
              </Link>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
