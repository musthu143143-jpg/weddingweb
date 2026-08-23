"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { BRAND, CATEGORIES, NAV_LINKS } from "@/data/content";
import { Monogram } from "@/components/ui/core";
import { useSupabaseUser } from "@/lib/supabase/useUser";
import AccountMenu from "@/components/layout/AccountMenu";

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, "-");
}

export default function Navbar({ overlay = false }: { overlay?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);
  const pathname = usePathname();
  const { user, loading: authLoading } = useSupabaseUser();
  const isAuthed = Boolean(user);
  const ctaHref = isAuthed ? "/dashboard" : "/templates";
  const ctaLabel = isAuthed ? "My Studio" : "Create Invitation";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setCatsOpen(false);
  }, [pathname]);

  const solid = scrolled || !overlay || open;
  const lightText = !solid;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          solid ? "glass-warm border-b border-gold/15 shadow-[0_10px_40px_-20px_rgb(33_26_22/0.35)]" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-3" aria-label={`${BRAND.name} home`}>
            <Monogram
              text={BRAND.monogram}
              className={`h-11 w-11 text-[15px] transition-colors duration-500 ${lightText ? "text-gold-soft" : "text-burgundy"}`}
            />
            <span className="flex flex-col leading-none">
              <span className={`font-display text-[26px] font-semibold tracking-wide transition-colors duration-500 ${lightText ? "text-ivory" : "text-charcoal"}`}>
                {BRAND.name}
              </span>
              <span className={`mt-1 font-sans text-[9px] uppercase tracking-luxe transition-colors duration-500 ${lightText ? "text-gold-soft/80" : "text-gold"}`}>
                Wedding Invitations
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
            <Link href="/templates" className={`navlink ${lightText ? "text-ivory/85 hover:text-gold-soft" : "text-ink-soft hover:text-burgundy"}`}>
              Templates
            </Link>

            <div className="relative" onMouseEnter={() => setCatsOpen(true)} onMouseLeave={() => setCatsOpen(false)}>
              <button
                type="button"
                onFocus={() => setCatsOpen(true)}
                onBlur={() => setCatsOpen(false)}
                aria-expanded={catsOpen}
                aria-haspopup="true"
                className={`flex items-center gap-1.5 font-sans text-[13px] tracking-wide-2 uppercase transition-colors duration-300 ${lightText ? "text-ivory/85 hover:text-gold-soft" : "text-ink-soft hover:text-burgundy"}`}
              >
                Categories <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${catsOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {catsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.25 }}
                    className="absolute left-1/2 top-full w-[420px] -translate-x-1/2 pt-4"
                  >
                    <div className="glass-warm grid grid-cols-3 gap-1 rounded-2xl border border-gold/20 p-3 shadow-lux">
                      {CATEGORIES.map((c) => (
                        <Link
                          key={c}
                          href={`/categories/${slugify(c)}`}
                          className="rounded-xl px-3 py-2.5 text-center font-sans text-[12px] tracking-wide-2 text-ink-soft uppercase transition-colors duration-200 hover:bg-gold/10 hover:text-burgundy"
                        >
                          {c}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {NAV_LINKS.filter((l) => l.label !== "Templates").map((l) => (
              <Link key={l.href} href={l.href} className={`navlink ${lightText ? "text-ivory/85 hover:text-gold-soft" : "text-ink-soft hover:text-burgundy"}`}>
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="hidden items-center gap-5 lg:flex">
            {!authLoading && !isAuthed && (
              <Link href="/login" className={`font-sans text-[13px] tracking-wide-2 uppercase transition-colors duration-300 ${lightText ? "text-ivory/85 hover:text-gold-soft" : "text-ink-soft hover:text-burgundy"}`}>
                Login
              </Link>
            )}
            <Link
              href={ctaHref}
              className="rounded-full bg-gradient-to-r from-[#9a7a3c] via-[#c2a05a] to-[#9a7a3c] bg-[length:200%_100%] bg-left px-6 py-3 font-sans text-[12px] font-medium tracking-wide-2 text-burgundy-deep uppercase shadow-[0_10px_30px_-12px_rgb(176_141_74/0.7)] transition-all duration-500 hover:bg-right hover:-translate-y-0.5"
            >
              {ctaLabel}
            </Link>
            {!authLoading && isAuthed && user && <AccountMenu user={user} light={lightText} />}
          </div>

          {/* Mobile actions */}
          <div className="flex items-center gap-1.5 lg:hidden">
            <Link href="/templates" aria-label="Search templates" className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${lightText ? "border-ivory/30 text-ivory" : "border-gold/30 text-charcoal"}`}>
              <Search className="h-4 w-4" strokeWidth={1.8} />
            </Link>
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={open}
              onClick={() => setOpen(true)}
              className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${lightText ? "border-ivory/30 text-ivory" : "border-gold/30 text-charcoal"}`}
            >
              <Menu className="h-4.5 w-4.5" strokeWidth={2} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] lg:hidden"
          >
            <div className="absolute inset-0 bg-burgundy-deep/95 backdrop-blur-xl" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col overflow-y-auto bg-burgundy-deep px-7 py-6"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-3">
                  <Monogram text={BRAND.monogram} className="h-10 w-10 text-[14px] text-gold-soft" />
                  <span className="font-display text-2xl font-semibold text-ivory">{BRAND.name}</span>
                </span>
                <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-full border border-ivory/25 text-ivory">
                  <X className="h-5 w-5" strokeWidth={1.6} />
                </button>
              </div>

              <nav className="mt-10 flex flex-col gap-1" aria-label="Mobile">
                {[{ label: "Home", href: "/" }, ...NAV_LINKS].map((l, i) => (
                  <motion.div key={l.href} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.06 }}>
                    <Link href={l.href} className="block border-b border-ivory/10 py-4 font-display text-3xl font-medium text-ivory transition-colors hover:text-gold-soft">
                      {l.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="mt-8">
                <p className="font-sans text-[11px] uppercase tracking-luxe text-gold-soft/80">Categories</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <Link key={c} href={`/categories/${slugify(c)}`} className="rounded-full border border-ivory/20 px-4 py-2 font-sans text-[11px] tracking-wide-2 text-ivory/80 uppercase">
                      {c}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mt-auto flex flex-col gap-3 pt-10">
                <Link href={ctaHref} className="rounded-full bg-gradient-to-r from-[#9a7a3c] via-[#c2a05a] to-[#9a7a3c] py-4 text-center font-sans text-[12px] font-medium tracking-luxe text-burgundy-deep uppercase">
                  {ctaLabel}
                </Link>
                {!authLoading && !isAuthed && (
                  <Link href="/login" className="rounded-full border border-ivory/25 py-4 text-center font-sans text-[12px] tracking-luxe text-ivory uppercase">
                    Login
                  </Link>
                )}
                {!authLoading && isAuthed && (
                  <>
                    <Link href="/dashboard/invitations" className="rounded-full border border-ivory/25 py-4 text-center font-sans text-[12px] tracking-luxe text-ivory uppercase">
                      My Invitations
                    </Link>
                    <MobileSignOut />
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function MobileSignOut() {
  return (
    <button
      type="button"
      onClick={async () => {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        if (!supabase) return;
        await supabase.auth.signOut();
        window.location.assign("/");
      }}
      className="rounded-full border border-ivory/25 py-4 text-center font-sans text-[12px] tracking-luxe text-ivory uppercase"
    >
      Sign out
    </button>
  );
}
