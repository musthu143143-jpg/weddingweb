import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Monogram } from "@/components/ui/core";
import AuthForm from "@/components/auth/AuthForm";
import { BRAND } from "@/data/content";

export const metadata: Metadata = {
  title: "Login",
  description: `Login to your ${BRAND.name} invitation studio.`
};

export default function LoginPage() {
  return (
    <main className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <Image src="/images/hero-mandap.jpg" alt="A royal wedding mandap glowing at night" fill className="object-cover" />
        <div className="absolute inset-0 bg-burgundy-deep/70" />
        <div className="absolute inset-0 flex flex-col justify-end p-14">
          <p className="font-script text-5xl text-gold-soft">Welcome back</p>
          <p className="mt-3 max-w-sm font-sans text-[15px] font-light text-ivory/75">
            Your designs, your drafts and your guest lists — all in one beautiful place.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center bg-ivory px-6 py-16">
        <Link href="/" className="flex items-center gap-3">
          <Monogram text={BRAND.monogram} className="h-12 w-12 text-[16px] text-burgundy" />
          <span className="font-display text-3xl font-semibold text-charcoal">{BRAND.name}</span>
        </Link>
        <h1 className="mt-10 font-display text-4xl font-medium text-charcoal">Login</h1>
        <p className="mt-2 font-sans text-[14px] font-light text-ink-soft/70">Continue to your invitation studio.</p>
        <AuthForm mode="login" redirectTo="/dashboard" />
        <p className="mt-8 font-sans text-[13px] font-light text-ink-soft/70">
          New to {BRAND.name}?{" "}
          <Link href="/register" className="text-burgundy underline-offset-4 hover:underline">Create an account</Link>
        </p>
        <p className="mt-2 font-sans text-[12px] font-light text-ink-soft/50">
          Wedding planner or studio?{" "}
          <Link href="/reseller/login" className="text-burgundy underline-offset-4 hover:underline">Reseller login</Link>
        </p>
        <Link href="/" className="mt-8 font-sans text-[11px] uppercase tracking-wide-2 text-ink-soft/50 transition-colors hover:text-burgundy">
          ← Back to {BRAND.name}
        </Link>
      </div>
    </main>
  );
}
