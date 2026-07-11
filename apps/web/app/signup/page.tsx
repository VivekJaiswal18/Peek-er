'use client'
import Link from "next/link";
import { ThemeToggle } from "../components/theme-toggle";
import React, {useState} from "react"
import {useRouter} from "next/navigation"

// const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>)=>{
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })
      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(data.message ?? "Could not create your account");
      }

      router.replace("/dashboard");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not create your account",
      );
    } finally {
      setIsSubmitting(false);
    }
  };
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

        <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="hidden lg:block">
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-700 dark:text-orange-400">
              Start with your first repo
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-normal">
              Create review runs, findings, comments, and repo chat from one workspace.
            </h1>
            <div className="mt-6 grid gap-3">
              {[
                "Connect GitHub repositories",
                "Index code chunks, symbols, summaries, and edges",
                "Post high-confidence PR comments",
                "Ask questions about the repo",
              ].map((item) => (
                <div
                  className="rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                  key={item}
                >
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="mx-auto w-full max-w-md rounded-md border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-semibold">Sign up</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Create a workspace for your AI code reviewer.
            </p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <label className="block">
                <span className="text-sm font-medium">Name</span>
                <input
                  type="name"
                  value={formData.username}
                  onChange={handleChange}
                  className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-orange-900/40"
                  placeholder="name"
                  name="username"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Email</span>
                <input
                  className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-orange-900/40"
                  placeholder="abc@example.com"
                  name="email"
                  type="email"
                  onChange={handleChange}
                  value={formData.email}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Password</span>
                <input
                  className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-orange-900/40"
                  placeholder="At least 8 characters"
                  type="password"
                  onChange={handleChange}
                  value={formData.password}
                  name="password"
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
                {isSubmitting ? "Creating account..." : "Create account"}
              </button>
            </form>
            <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{" "}
              <Link
                className="font-semibold text-orange-700 dark:text-orange-400"
                href="/login"
              >
                Login
              </Link>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
