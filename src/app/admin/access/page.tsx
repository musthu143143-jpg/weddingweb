import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { KeyRound, ShieldAlert, ShieldCheck } from "lucide-react";
import { getAuthedContext } from "@/lib/authGuard";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { countAdmins } from "@/lib/profile";
import { BRAND } from "@/data/content";
import { Monogram, Ornament } from "@/components/ui/core";
import SignOutButton from "@/components/auth/SignOutButton";
import { claimAdminAction } from "@/app/admin/access/actions";

export const metadata: Metadata = { title: "Admin Access", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminAccessPage() {
  if (!getSupabaseConfig()) redirect("/admin/login?setup=1");

  const ctx = await getAuthedContext();
  if (!ctx) redirect("/admin/login");
  if (ctx.profile.role === "admin") redirect("/admin");

  const admins = await countAdmins();
  const canClaim = admins === 0;

  return (
    <main className="flex min-h-svh items-center justify-center bg-charcoal px-6 py-16">
      <div className="w-full max-w-lg text-center">
        <Monogram text={BRAND.monogram} className="mx-auto h-14 w-14 text-[16px] text-gold-soft" />
        <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-gold-soft/30 px-4 py-1.5 font-sans text-[10px] uppercase tracking-luxe text-gold-soft">
          {canClaim ? <KeyRound className="h-3.5 w-3.5" strokeWidth={1.8} /> : <ShieldAlert className="h-3.5 w-3.5" strokeWidth={1.8} />}
          {canClaim ? "First-time setup" : "Access restricted"}
        </span>

        <h1 className="mt-6 font-display text-4xl font-medium text-ivory">
          {canClaim ? "Claim admin access" : "This account is not an admin"}
        </h1>
        <Ornament style="line" className="mx-auto mt-4 h-4 w-32 text-gold-soft/40" />

        <div className="mt-6 rounded-2xl border border-ivory/12 bg-ivory/[0.04] p-6 text-left">
          <p className="font-sans text-[11px] uppercase tracking-luxe text-gold-soft/80">Signed in as</p>
          <p className="mt-2 font-sans text-[15px] text-ivory">{ctx.email}</p>
          <p className="mt-1 font-sans text-[12px] uppercase tracking-wide-2 text-ivory/45">Current role: {ctx.profile.role}</p>
        </div>

        {canClaim ? (
          <>
            <p className="mt-6 font-sans text-[14px] font-light leading-relaxed text-ivory/65">
              No administrator exists yet for this platform. Because you are signed in, you can claim
              ownership now. This is only offered while zero admins exist — the check is enforced by the
              database, so it can happen exactly once.
            </p>
            <form action={claimAdminAction} className="mt-7">
              <button className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#9a7a3c] via-[#c2a05a] to-[#9a7a3c] px-8 py-4 font-sans text-[12px] font-medium uppercase tracking-luxe text-burgundy-deep transition-transform hover:-translate-y-0.5">
                <ShieldCheck className="h-4 w-4" strokeWidth={1.8} /> Make me the administrator
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="mt-6 font-sans text-[14px] font-light leading-relaxed text-ivory/65">
              Your account exists, but it does not have the admin role, so the admin dashboard is
              hidden from it. There are two ways to get access:
            </p>
            <ol className="mt-5 space-y-3 text-left">
              <li className="rounded-xl border border-ivory/10 bg-ivory/[0.03] px-5 py-4 font-sans text-[13px] font-light leading-relaxed text-ivory/70">
                <span className="text-gold-soft">1.</span> Ask an existing administrator to change your
                role to <span className="text-gold-soft">admin</span> in Admin → Customers.
              </li>
              <li className="rounded-xl border border-ivory/10 bg-ivory/[0.03] px-5 py-4 font-sans text-[13px] font-light leading-relaxed text-ivory/70">
                <span className="text-gold-soft">2.</span> Add your email to the server-side{" "}
                <code className="rounded bg-ivory/10 px-1.5 py-0.5 text-gold-soft">ADMIN_EMAILS</code>{" "}
                environment variable and sign in again — matching emails are promoted automatically.
              </li>
            </ol>
          </>
        )}

        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Link href="/dashboard" className="font-sans text-[11px] uppercase tracking-wide-2 text-ivory/50 hover:text-gold-soft">
            Go to my dashboard
          </Link>
          <div className="[&_button]:border-ivory/25 [&_button]:text-ivory">
            <SignOutButton />
          </div>
        </div>
      </div>
    </main>
  );
}
