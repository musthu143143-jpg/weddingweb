import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Briefcase } from "lucide-react";
import { Monogram } from "@/components/ui/core";
import AuthForm from "@/components/auth/AuthForm";
import { BRAND } from "@/data/content";

export const metadata: Metadata = {
  title: "Reseller Login",
  description: `Login to your ${BRAND.name} reseller portal to manage client invitations.`,
};

export default function ResellerLoginPage() {
  return (
    <main className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <Image src="/images/editorial.jpg" alt="An elegant modern wedding venue" fill className="object-cover" />
        <div className="absolute inset-0 bg-charcoal/70" />
        <div className="absolute inset-0 flex flex-col justify-end p-14">
          <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-gold-soft/40 px-4 py-1.5 font-sans text-[10px] uppercase tracking-luxe text-gold-soft">
            <Briefcase className="h-3 w-3" strokeWidth={1.8} /> Reseller Portal
          </span>
          <p className="font-script text-5xl text-gold-soft">For the planners</p>
          <p className="mt-3 max-w-sm font-sans text-[15px] font-light text-ivory/75">
            Manage every client invitation, from first design to final RSVP, in one studio.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center bg-ivory px-6 py-16">
        <Link href="/" className="flex items-center gap-3">
          <Monogram text={BRAND.monogram} className="h-12 w-12 text-[16px] text-burgundy" />
          <span className="font-display text-3xl font-semibold text-charcoal">{BRAND.name}</span>
        </Link>
        <p className="mt-8 font-sans text-[11px] uppercase tracking-luxe text-gold">Reseller Portal</p>
        <h1 className="mt-3 font-display text-4xl font-medium text-charcoal">Partner login</h1>
        <p className="mt-2 font-sans text-[14px] font-light text-ink-soft/70">Continue to your client workspace.</p>
        <AuthForm mode="login" redirectTo="/reseller" />
        <p className="mt-8 font-sans text-[13px] font-light text-ink-soft/70">
          New partner?{" "}
          <Link href="/reseller/register" className="text-burgundy underline-offset-4 hover:underline">Apply as a reseller</Link>
        </p>
        <p className="mt-2 font-sans text-[12px] font-light text-ink-soft/50">
          Planning your own wedding?{" "}
          <Link href="/login" className="text-burgundy underline-offset-4 hover:underline">Couple login</Link>
        </p>
        <Link href="/" className="mt-8 font-sans text-[11px] uppercase tracking-wide-2 text-ink-soft/50 transition-colors hover:text-burgundy">
          ← Back to {BRAND.name}
        </Link>
      </div>
    </main>
  );
}
