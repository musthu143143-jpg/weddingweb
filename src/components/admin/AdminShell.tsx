import Link from "next/link";
import type { ReactNode } from "react";
import { BarChart3, ClipboardList, Database, KeyRound, LayoutTemplate, ShieldCheck, Ticket, Users } from "lucide-react";
import { BRAND } from "@/data/content";
import { Monogram } from "@/components/ui/core";
import SignOutButton from "@/components/auth/SignOutButton";

const NAV = [
  { href: "/admin", label: "Overview", icon: BarChart3 },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/keys", label: "Unlock Keys", icon: KeyRound },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/database", label: "Database", icon: Database },
];

export default function AdminShell({
  active,
  email,
  children,
}: {
  active: string;
  email: string | null;
  children: ReactNode;
}) {
  return (
    <main className="min-h-svh bg-ivory lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="border-r border-gold/20 bg-burgundy-deep text-ivory lg:sticky lg:top-0 lg:h-svh">
        <div className="flex h-full flex-col px-5 py-6">
          <Link href="/" className="flex items-center gap-3">
            <Monogram text={BRAND.monogram} className="h-11 w-11 text-[15px] text-gold-soft" />
            <span>
              <span className="block font-display text-2xl font-semibold">{BRAND.name}</span>
              <span className="block font-sans text-[9px] uppercase tracking-luxe text-gold-soft/70">Admin Suite</span>
            </span>
          </Link>

          <nav className="mt-10 space-y-2" aria-label="Admin">
            {NAV.map((item) => {
              const Icon = item.icon;
              const selected = active === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 font-sans text-[12px] uppercase tracking-wide-2 transition-colors ${
                    selected ? "bg-gold-soft text-burgundy-deep" : "text-ivory/70 hover:bg-ivory/10 hover:text-gold-soft"
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.7} /> {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-ivory/10 pt-6">
            <p className="font-sans text-[10px] uppercase tracking-luxe text-gold-soft/70">Signed in</p>
            <p className="mt-2 truncate font-sans text-[12px] font-light text-ivory/70">{email}</p>
            <div className="mt-4 [&_button]:border-ivory/20 [&_button]:text-ivory [&_button:hover]:bg-ivory/10">
              <SignOutButton />
            </div>
          </div>
        </div>
      </aside>
      <section className="min-w-0">{children}</section>
    </main>
  );
}

export function AdminHero({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <header className="relative overflow-hidden bg-cream/70 px-5 py-12 sm:px-8 lg:px-10">
      <div className="pointer-events-none absolute inset-0 bg-paper" aria-hidden="true" />
      <div className="relative flex flex-col gap-3">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-gold/30 bg-white/60 px-4 py-1.5 font-sans text-[10px] uppercase tracking-luxe text-gold">
          <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.7} /> {eyebrow}
        </span>
        <h1 className="font-display text-4xl font-medium text-charcoal sm:text-5xl">{title}</h1>
        {sub && <p className="max-w-2xl font-sans text-[14px] font-light leading-relaxed text-ink-soft/70">{sub}</p>}
      </div>
    </header>
  );
}

export function AdminCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-gold/20 bg-white/70 p-6 shadow-card ${className}`}>{children}</div>;
}

export function AdminTable({ children }: { children: ReactNode }) {
  return <div className="overflow-x-auto rounded-2xl border border-gold/20 bg-white/70"><table className="w-full min-w-[760px] border-collapse text-left">{children}</table></div>;
}

export function Th({ children }: { children: ReactNode }) {
  return <th className="border-b border-gold/20 bg-gold-pale/30 px-6 py-4 font-sans text-[11px] uppercase tracking-wide-2 text-ink-soft/60">{children}</th>;
}

export function Td({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <td className={`border-b border-gold/10 px-6 py-4 font-sans text-[13px] font-light text-ink-soft ${className}`}>{children}</td>;
}
