import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Briefcase } from "lucide-react";
import { Monogram } from "@/components/ui/core";
import AuthForm from "@/components/auth/AuthForm";
import { BRAND } from "@/data/content";

export const metadata: Metadata = {
  title: "Become a Reseller",
  description: `Join the ${BRAND.name} reseller program and offer premium digital wedding invitations to your clients.`,
};

export default function ResellerRegisterPage() {
  return (
    <main className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col items-center justify-center bg-ivory px-6 py-16">
        <Link href="/" className="flex items-center gap-3">
          <Monogram text={BRAND.monogram} className="h-12 w-12 text-[16px] text-burgundy" />
          <span className="font-display text-3xl font-semibold text-charcoal">{BRAND.name}</span>
        </Link>
        <p className="mt-8 font-sans text-[11px] uppercase tracking-luxe text-gold">Reseller Program</p>
        <h1 className="mt-3 text-center font-display text-4xl font-medium text-charcoal">Create your reseller account</h1>
        <p className="mt-2 max-w-xs text-center font-sans text-[14px] font-light text-ink-soft/70">
          Offer beautifully crafted invitations to every couple you work with.
        </p>
        <AuthForm mode="register" role="reseller" redirectTo="/reseller" />
        <p className="mt-8 font-sans text-[13px] font-light text-ink-soft/70">
          Already a partner?{" "}
          <Link href="/reseller/login" className="text-burgundy underline-offset-4 hover:underline">Login</Link>
        </p>
        <p className="mt-2 font-sans text-[12px] font-light text-ink-soft/50">
          Planning your own wedding?{" "}
          <Link href="/register" className="text-burgundy underline-offset-4 hover:underline">Couple sign up</Link>
        </p>
        <Link href="/" className="mt-8 font-sans text-[11px] uppercase tracking-wide-2 text-ink-soft/50 transition-colors hover:text-burgundy">
          ← Back to {BRAND.name}
        </Link>
      </div>

      <div className="relative hidden overflow-hidden lg:block">
        <Image src="/images/marble.jpg" alt="A refined minimal wedding still life" fill className="object-cover" />
        <div className="absolute inset-0 bg-charcoal/65" />
        <div className="absolute inset-0 flex flex-col justify-end p-14">
          <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-gold-soft/40 px-4 py-1.5 font-sans text-[10px] uppercase tracking-luxe text-gold-soft">
            <Briefcase className="h-3 w-3" strokeWidth={1.8} /> Reseller Program
          </span>
          <p className="font-script text-5xl text-gold-soft">Grow with us</p>
          <p className="mt-3 max-w-sm font-sans text-[15px] font-light text-ivory/75">
            Wedding planners and studios use {BRAND.name} to give every client a premium, unforgettable invitation.
          </p>
        </div>
      </div>
    </main>
  );
}
