import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Monogram } from "@/components/ui/core";
import AuthForm from "@/components/auth/AuthForm";
import { BRAND } from "@/data/content";

export const metadata: Metadata = {
  title: "Create an Account",
  description: `Create your ${BRAND.name} account and start making a wedding invitation as unique as your love story.`,
};

export default function RegisterPage() {
  return (
    <main className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col items-center justify-center bg-ivory px-6 py-16">
        <Link href="/" className="flex items-center gap-3">
          <Monogram text={BRAND.monogram} className="h-12 w-12 text-[16px] text-burgundy" />
          <span className="font-display text-3xl font-semibold text-charcoal">{BRAND.name}</span>
        </Link>
        <h1 className="mt-10 font-display text-4xl font-medium text-charcoal">Create your account</h1>
        <p className="mt-2 text-center font-sans text-[14px] font-light text-ink-soft/70">Save your designs and return to your invitation studio anytime.</p>
        <AuthForm mode="register" role="user" redirectTo="/dashboard" />
        <p className="mt-8 font-sans text-[13px] font-light text-ink-soft/70">
          Already have an account?{" "}
          <Link href="/login" className="text-burgundy underline-offset-4 hover:underline">Login</Link>
        </p>
        <p className="mt-2 font-sans text-[12px] font-light text-ink-soft/50">
          Planning weddings professionally?{" "}
          <Link href="/reseller/register" className="text-burgundy underline-offset-4 hover:underline">Join as a reseller</Link>
        </p>
        <Link href="/" className="mt-8 font-sans text-[11px] uppercase tracking-wide-2 text-ink-soft/50 transition-colors hover:text-burgundy">
          ← Back to {BRAND.name}
        </Link>
      </div>

      <div className="relative hidden overflow-hidden lg:block">
        <Image src="/images/garden.jpg" alt="A romantic garden wedding arch in golden light" fill className="object-cover" />
        <div className="absolute inset-0 bg-burgundy-deep/60" />
        <div className="absolute inset-0 flex flex-col justify-end p-14">
          <p className="font-script text-5xl text-gold-soft">Begin your story</p>
          <p className="mt-3 max-w-sm font-sans text-[15px] font-light text-ivory/75">
            One account for your invitations, your guests and your memories — forever.
          </p>
        </div>
      </div>
    </main>
  );
}
