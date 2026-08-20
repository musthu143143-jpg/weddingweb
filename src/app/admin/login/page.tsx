import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Monogram, Ornament } from "@/components/ui/core";
import AuthForm from "@/components/auth/AuthForm";
import { BRAND } from "@/data/content";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-charcoal px-6 py-16">
      <div className="flex w-full max-w-sm flex-col items-center">
        <Monogram text={BRAND.monogram} className="h-14 w-14 text-[16px] text-gold-soft" />
        <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-gold-soft/30 px-4 py-1.5 font-sans text-[10px] uppercase tracking-luxe text-gold-soft">
          <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.8} /> Platform Admin
        </span>
        <h1 className="mt-6 font-display text-4xl font-medium text-ivory">Admin Sign In</h1>
        <Ornament style="line" className="mt-4 h-4 w-32 text-gold-soft/40" />
        <p className="mt-4 text-center font-sans text-[13px] font-light leading-relaxed text-ivory/55">
          Restricted access. Sign in with an existing {BRAND.name} account — admin rights are granted
          by role, not by registering here. If no administrator exists yet, you will be offered
          first-time setup after signing in.
        </p>
        <div className="w-full">
          <AuthForm mode="login" redirectTo="/admin" tone="dark" />
        </div>
        <Link href="/" className="mt-8 font-sans text-[11px] uppercase tracking-wide-2 text-ivory/40 transition-colors hover:text-gold-soft">
          ← Back to {BRAND.name}
        </Link>
      </div>
    </main>
  );
}
