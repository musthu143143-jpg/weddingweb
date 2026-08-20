import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Briefcase, Eye, Palette, Save, Users2, Wallet } from "lucide-react";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { getAuthedContext, homeForRole } from "@/lib/authGuard";
import { BRAND } from "@/data/content";
import { TEMPLATES } from "@/data/templates";
import { Monogram, Ornament } from "@/components/ui/core";
import SignOutButton from "@/components/auth/SignOutButton";
import { saveResellerProfile } from "@/app/reseller/actions";
import LogoUploader from "@/app/reseller/LogoUploader";

export const metadata: Metadata = {
  title: "Reseller Studio",
  description: `Manage your client invitations from the ${BRAND.name} reseller portal.`,
};

export const dynamic = "force-dynamic";

export default async function ResellerDashboard() {
  if (!getSupabaseConfig()) redirect("/reseller/login?setup=1");

  const ctx = await getAuthedContext();
  if (!ctx) redirect("/reseller/login");
  if (ctx.profile.role === "user") redirect(homeForRole(ctx.profile.role));
  if (ctx.profile.role === "admin") redirect("/admin");

  const { profile } = ctx;

  return (
    <main className="min-h-svh bg-ivory">
      <header className="glass-warm sticky top-0 z-30 border-b border-gold/20">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Monogram text={BRAND.monogram} className="h-10 w-10 text-[14px] text-burgundy" />
            <span className="font-display text-2xl font-semibold text-charcoal">{BRAND.name}</span>
            <span className="ml-2 hidden items-center gap-1.5 rounded-full border border-gold/40 px-3 py-1 font-sans text-[10px] uppercase tracking-wide-2 text-burgundy sm:inline-flex">
              <Briefcase className="h-3 w-3" strokeWidth={1.8} /> Reseller
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden font-sans text-[12px] font-light text-ink-soft/65 sm:inline">{ctx.email}</span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-charcoal py-20 text-ivory">
        <div className="pointer-events-none absolute inset-0 bg-grain opacity-40" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <p className="font-sans text-[11px] uppercase tracking-luxe text-gold-soft">Reseller portal</p>
          <div className="mt-4 flex items-center gap-4">
            {profile.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.logoUrl} alt={`${profile.businessName ?? "Reseller"} logo`} className="h-14 w-14 rounded-full border border-gold-soft/40 object-cover" />
            )}
            <h1 className="font-display text-5xl font-medium sm:text-6xl">
              {profile.businessName || "Welcome, partner."}
            </h1>
          </div>
          <p className="mt-4 max-w-xl font-sans text-[15px] font-light leading-relaxed text-ivory/70">
            Design, preview and manage invitations for every couple you work with — all from one studio.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="rounded-2xl border border-gold/20 bg-white/70 p-7">
            <Users2 className="h-5 w-5 text-gold" strokeWidth={1.6} />
            <p className="mt-5 font-display text-4xl font-semibold text-charcoal">0</p>
            <p className="mt-1 font-sans text-[12px] uppercase tracking-wide-2 text-ink-soft/60">Client Invitations</p>
            <p className="mt-3 font-sans text-[12.5px] font-light leading-relaxed text-ink-soft/60">
              Client management arrives with the publishing engine. Start exploring designs below.
            </p>
          </div>
          <div className="rounded-2xl border border-gold/20 bg-white/70 p-7">
            <Wallet className="h-5 w-5 text-gold" strokeWidth={1.6} />
            <p className="mt-5 font-display text-4xl font-semibold text-charcoal">—</p>
            <p className="mt-1 font-sans text-[12px] uppercase tracking-wide-2 text-ink-soft/60">Commission Earned</p>
            <p className="mt-3 font-sans text-[12.5px] font-light leading-relaxed text-ink-soft/60">
              Payouts and commission tracking are coming soon.
            </p>
          </div>
          <div className="rounded-2xl border border-gold/20 bg-white/70 p-7">
            <Palette className="h-5 w-5 text-gold" strokeWidth={1.6} />
            <p className="mt-5 font-display text-4xl font-semibold text-charcoal">{TEMPLATES.length}</p>
            <p className="mt-1 font-sans text-[12px] uppercase tracking-wide-2 text-ink-soft/60">Templates Available</p>
            <p className="mt-3 font-sans text-[12.5px] font-light leading-relaxed text-ink-soft/60">
              Every design is ready to preview and customise for your clients.
            </p>
          </div>
        </div>

        {/* Business profile */}
        <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="font-sans text-[11px] uppercase tracking-luxe text-gold">Business Profile</p>
            <h2 className="mt-3 font-display text-3xl font-medium text-charcoal">Your details</h2>
            <p className="mt-3 max-w-sm font-sans text-[13.5px] font-light leading-relaxed text-ink-soft/70">
              These details help us tailor your reseller experience and appear on future client-facing materials.
            </p>
            <Ornament style="royal" className="mt-5 h-4 w-32 text-gold/60" />
            <div className="mt-8 max-w-xs">
              <p className="mb-2 font-sans text-[11px] uppercase tracking-wide-2 text-ink-soft/60">Business logo</p>
              <LogoUploader userId={ctx.userId} initialUrl={profile.logoUrl} />
            </div>
          </div>
          <form action={saveResellerProfile} className="flex flex-col gap-5 rounded-2xl border border-gold/20 bg-white/70 p-7">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="font-sans text-[11px] uppercase tracking-wide-2 text-ink-soft/60">Contact name</span>
                <input name="fullName" defaultValue={profile.fullName ?? ""} className="rounded-xl border border-gold/30 bg-white px-4 py-3 font-sans text-[14px] outline-none focus:border-gold" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="font-sans text-[11px] uppercase tracking-wide-2 text-ink-soft/60">Business / studio name</span>
                <input name="businessName" defaultValue={profile.businessName ?? ""} className="rounded-xl border border-gold/30 bg-white px-4 py-3 font-sans text-[14px] outline-none focus:border-gold" />
              </label>
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="font-sans text-[11px] uppercase tracking-wide-2 text-ink-soft/60">Phone</span>
              <input name="phone" defaultValue={profile.phone ?? ""} className="rounded-xl border border-gold/30 bg-white px-4 py-3 font-sans text-[14px] outline-none focus:border-gold" placeholder="+91 90000 00000" />
            </label>
            <button type="submit" className="inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-[#9a7a3c] via-[#c2a05a] to-[#9a7a3c] px-6 py-3 font-sans text-[11px] font-medium uppercase tracking-wide-2 text-burgundy-deep transition-transform hover:-translate-y-0.5">
              <Save className="h-3.5 w-3.5" strokeWidth={1.8} /> Save Details
            </button>
          </form>
        </div>

        {/* Templates to offer clients */}
        <div className="mt-20 flex items-end justify-between gap-5">
          <div>
            <p className="font-sans text-[11px] uppercase tracking-luxe text-gold">Offer to clients</p>
            <h2 className="mt-3 font-display text-4xl font-medium text-charcoal">Browse the collection</h2>
          </div>
          <Link href="/templates" className="hidden font-sans text-[11px] uppercase tracking-wide-2 text-burgundy sm:inline-flex">View all →</Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TEMPLATES.slice(0, 4).map((template) => (
            <div key={template.id} className="overflow-hidden rounded-2xl border border-gold/20 bg-white/70">
              <div className="relative aspect-[4/3]">
                <img src={template.image} alt={template.imageAlt} className="h-full w-full object-cover" />
              </div>
              <div className="p-5">
                <h3 className="font-display text-2xl font-semibold text-charcoal">{template.name}</h3>
                <p className="mt-1 font-sans text-[12px] font-light text-ink-soft/65">{template.tagline}</p>
                <div className="mt-5 flex gap-2">
                  <Link href={`/customize/${template.slug}`} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-burgundy py-2.5 font-sans text-[10px] uppercase tracking-wide-2 text-ivory"><Palette className="h-3 w-3" /> Customize</Link>
                  <Link href={`/templates/${template.slug}`} aria-label={`Preview ${template.name}`} className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/40 text-burgundy"><Eye className="h-3.5 w-3.5" /></Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
