import Link from "next/link";
import type { ReactNode } from "react";
import { Heart, LayoutDashboard, Mail, Receipt, Settings } from "lucide-react";
import { BRAND } from "@/data/content";
import { Monogram } from "@/components/ui/core";
import SignOutButton from "@/components/auth/SignOutButton";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/invitations", label: "My Invitations", icon: Heart },
  { href: "/dashboard/rsvps", label: "RSVPs", icon: Mail },
  { href: "/dashboard/orders", label: "Orders", icon: Receipt },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardShell({
  active,
  email,
  children,
}: {
  active: string;
  email: string | null;
  children: ReactNode;
}) {
  return (
    <main className="min-h-svh bg-ivory">
      <header className="glass-warm sticky top-0 z-30 border-b border-gold/20">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Monogram text={BRAND.monogram} className="h-10 w-10 text-[14px] text-burgundy" />
            <span className="font-display text-2xl font-semibold text-charcoal">{BRAND.name}</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden font-sans text-[12px] font-light text-ink-soft/65 sm:inline">{email}</span>
            <SignOutButton />
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-3 pb-2 sm:px-6" aria-label="Dashboard">
          {NAV.map((item) => {
            const Icon = item.icon;
            const selected = active === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 font-sans text-[11px] uppercase tracking-wide-2 transition-colors ${
                  selected ? "bg-burgundy text-ivory" : "text-ink-soft hover:bg-gold/10 hover:text-burgundy"
                }`}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.7} /> {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
      {children}
    </main>
  );
}

export function DashboardHero({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <section className="relative overflow-hidden bg-burgundy-deep py-16 text-ivory">
      <div className="pointer-events-none absolute inset-0 bg-grain opacity-40" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <p className="font-sans text-[11px] uppercase tracking-luxe text-gold-soft">{eyebrow}</p>
        <h1 className="mt-4 font-display text-5xl font-medium sm:text-6xl">{title}</h1>
        {sub && <p className="mt-4 max-w-2xl font-sans text-[15px] font-light leading-relaxed text-ivory/70">{sub}</p>}
      </div>
    </section>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-gold/20 bg-white/70 p-6 shadow-card ${className}`}>{children}</div>;
}

export function EmptyState({ title, text, cta }: { title: string; text: string; cta?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-gold/40 px-8 py-16 text-center">
      <p className="font-display text-2xl text-charcoal">{title}</p>
      <p className="max-w-md font-sans text-[14px] font-light leading-relaxed text-ink-soft/70">{text}</p>
      {cta}
    </div>
  );
}
