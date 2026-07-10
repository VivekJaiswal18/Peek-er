import Link from "next/link";
import type { ReactNode } from "react";
import { ThemeToggle } from "./theme-toggle";

type IconName = "home" | "repo" | "review" | "finding" | "settings" | "search" | "spark" | "chevron" | "github" | "bell";

export function Icon({ name, className = "h-4 w-4" }: { name: IconName; className?: string }) {
  const paths: Record<IconName, ReactNode> = {
    home: <><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9M9 20v-7h6v7"/></>,
    repo: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/></>,
    review: <><path d="M8 6h13M8 12h13M8 18h13"/><path d="m3 6 .7.7L5.5 5M3 12l.7.7 1.8-1.7M3 18l.7.7L5.5 17"/></>,
    finding: <><path d="M12 22c5 0 8-3 8-7 0-3-2-5-4-6V5a4 4 0 0 0-8 0v4c-2 1-4 3-4 6 0 4 3 7 8 7Z"/><path d="M9 16h6M12 13v3"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    spark: <path d="m12 3 1.2 4.1a5 5 0 0 0 3.4 3.4L21 12l-4.4 1.5a5 5 0 0 0-3.4 3.4L12 21l-1.2-4.1a5 5 0 0 0-3.4-3.4L3 12l4.4-1.5a5 5 0 0 0 3.4-3.4L12 3Z"/>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    github: <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3.3-.4 6.8-1.6 6.8-7A5.4 5.4 0 0 0 19.4 4 5 5 0 0 0 19.3.5S18.2.1 15 1.8a13.4 13.4 0 0 0-7 0C4.8.1 3.7.5 3.7.5A5 5 0 0 0 3.6 4a5.4 5.4 0 0 0-1.4 3.7c0 5.4 3.5 6.6 6.8 7A4.8 4.8 0 0 0 8 18v4"/>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
  };
  return <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "home" as const },
  { href: "/repositories", label: "Repositories", icon: "repo" as const },
  { href: "/findings", label: "Review queue", icon: "review" as const },
  { href: "/findings", label: "All findings", icon: "finding" as const },
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f8f9fb] text-[#172033] dark:bg-[#090c13] dark:text-slate-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[244px] border-r border-[#e6e9ef] bg-white dark:border-slate-800 dark:bg-[#0c111b] lg:flex lg:flex-col">
        <Link href="/dashboard" className="flex h-[68px] items-center gap-2.5 border-b border-[#edf0f4] px-5 dark:border-slate-800">
          <div className="relative grid h-8 w-8 place-items-center rounded-full bg-[#ff5a1f] text-white shadow-sm shadow-orange-200"><Icon name="spark" className="h-[18px] w-[18px]" /></div>
          <span className="text-[17px] font-bold tracking-[-0.04em]">Peek-er</span>
          <span className="rounded-full bg-orange-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-orange-600 dark:bg-orange-500/10">AI</span>
        </Link>
        <nav className="flex-1 px-3 py-5">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[.12em] text-slate-400">Workspace</p>
          <div className="space-y-1">
            {navItems.map((item, index) => (
              <Link className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition ${index === 0 ? "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"}`} href={item.href} key={`${item.label}-${index}`}>
                <Icon name={item.icon} className="h-[17px] w-[17px]" />{item.label}
                {item.label === "Review queue" && <span className="ml-auto rounded-full bg-[#f2f4f7] px-2 py-0.5 text-[10px] text-slate-500 dark:bg-slate-800">3</span>}
              </Link>
            ))}
          </div>
          <p className="mb-2 mt-7 px-3 text-[10px] font-semibold uppercase tracking-[.12em] text-slate-400">Manage</p>
          <Link className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900" href="/settings"><Icon name="settings" className="h-[17px] w-[17px]" />Settings</Link>
        </nav>
        <div className="m-3 rounded-xl border border-[#e7e9ef] bg-[#fafaff] p-3.5 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center gap-2 text-[12px] font-semibold"><Icon name="github" className="h-4 w-4" /> GitHub connected <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500" /></div>
          <p className="mt-2 text-[11px] leading-5 text-slate-500">3 repositories · Pro plan</p>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"><div className="h-full w-[64%] bg-orange-500" /></div>
        </div>
        <div className="flex items-center gap-3 border-t border-[#edf0f4] p-4 dark:border-slate-800">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-amber-300 to-orange-500 text-[11px] font-bold text-white">VK</div>
          <div className="min-w-0"><p className="truncate text-xs font-semibold">Vivek Kumar</p><p className="truncate text-[10px] text-slate-400">vivek@peek-er.dev</p></div><span className="ml-auto text-slate-400">•••</span>
        </div>
      </aside>

      <div className="lg:pl-[244px]">
        <header className="sticky top-0 z-20 flex h-[68px] items-center border-b border-[#e6e9ef] bg-white/90 px-4 backdrop-blur-xl dark:border-slate-800 dark:bg-[#0c111b]/90 sm:px-7">
          <Link href="/dashboard" className="mr-4 flex items-center gap-2 font-bold lg:hidden"><span className="grid h-8 w-8 place-items-center rounded-full bg-orange-600 text-white"><Icon name="spark" /></span>Peek-er</Link>
          <label className="relative hidden w-full max-w-[420px] sm:block"><Icon name="search" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input className="h-9 w-full rounded-lg border border-[#e3e6ec] bg-[#f8f9fb] pl-9 pr-14 text-xs outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:bg-slate-950" placeholder="Search repositories, pull requests..." /><kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[9px] text-slate-400 dark:border-slate-700 dark:bg-slate-800">⌘ K</kbd></label>
          <div className="ml-auto flex items-center gap-1.5"><button aria-label="Notifications" className="relative grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><Icon name="bell" /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-white" /></button><ThemeToggle /><Link href="/repositories" className="ml-1 rounded-lg bg-[#17171a] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#ff5a1f] dark:bg-[#ff5a1f] dark:hover:bg-orange-600">+ Add repository</Link></div>
        </header>
        <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-7 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

export function StatCard({ label, value, detail, icon, trend }: { label: string; value: string; detail: string; icon?: ReactNode; trend?: string }) {
  return <div className="rounded-xl border border-[#e4e7ec] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,.03)] dark:border-slate-800 dark:bg-[#101621]"><div className="flex items-start justify-between"><p className="text-xs font-medium text-slate-500">{label}</p>{icon && <span className="grid h-8 w-8 place-items-center rounded-lg bg-orange-50 text-orange-600 dark:bg-orange-500/10">{icon}</span>}</div><div className="mt-2 flex items-end gap-2"><p className="text-[25px] font-semibold tracking-[-.04em]">{value}</p>{trend && <span className="mb-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600">{trend}</span>}</div><p className="mt-1 text-[11px] text-slate-400">{detail}</p></div>;
}

export function Badge({ children, tone = "slate" }: { children: ReactNode; tone?: "slate" | "green" | "yellow" | "red" | "blue" | "orange" }) {
  const tones = { slate: "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300", green: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300", yellow: "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300", red: "border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300", blue: "border-sky-200 bg-sky-50 text-sky-700", orange: "border-orange-200 bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300" };
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${tones[tone]}`}>{children}</span>;
}

export function SectionTitle({ title, description }: { title: string; description: string }) {
  return <div><h1 className="text-[22px] font-semibold tracking-[-.035em] text-[#101828] dark:text-white">{title}</h1><p className="mt-1 text-[12px] leading-5 text-slate-500">{description}</p></div>;
}
