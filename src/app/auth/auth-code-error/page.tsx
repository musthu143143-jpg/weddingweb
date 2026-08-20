import Link from "next/link";
import { Monogram } from "@/components/ui/core";
import { BRAND } from "@/data/content";

export default function AuthCodeErrorPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-ivory px-6 py-16">
      <div className="flex max-w-md flex-col items-center gap-5 text-center">
        <Monogram text={BRAND.monogram} className="h-16 w-16 text-[20px] text-burgundy" />
        <p className="font-sans text-[11px] uppercase tracking-luxe text-gold">Authentication</p>
        <h1 className="font-display text-4xl font-medium text-charcoal">That link has expired</h1>
        <p className="font-sans text-[15px] leading-relaxed font-light text-ink-soft/75">
          Please return to login and request a fresh confirmation email. Your invitation drafts are still safe.
        </p>
        <Link href="/login" className="rounded-full bg-gradient-to-r from-[#9a7a3c] via-[#c2a05a] to-[#9a7a3c] px-7 py-3.5 font-sans text-[12px] font-medium uppercase tracking-wide-2 text-burgundy-deep">
          Back to Login
        </Link>
      </div>
    </main>
  );
}
