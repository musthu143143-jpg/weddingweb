"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LayoutDashboard, LoaderCircle, LogOut, Settings, Ticket } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

function initialFor(user: User) {
  const name = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "";
  const source = name.trim() || user.email || "?";
  return source.trim().charAt(0).toUpperCase();
}

export default function AccountMenu({ user, light = false }: { user: User; light?: boolean }) {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  async function signOut() {
    const supabase = createClient();
    if (!supabase) return;
    setSigningOut(true);
    await supabase.auth.signOut();
    window.location.assign("/");
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`flex items-center gap-2.5 rounded-full border py-1.5 pr-3 pl-1.5 transition-colors duration-300 ${
          light ? "border-ivory/25 text-ivory hover:border-gold-soft/60" : "border-gold/35 text-charcoal hover:border-gold"
        }`}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#9a7a3c] to-[#c2a05a] font-display text-[14px] font-semibold text-burgundy-deep">
          {initialFor(user)}
        </span>
        <span className="hidden max-w-[130px] truncate font-sans text-[12px] tracking-wide-2 sm:inline">{user.email}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2 }}
            role="menu"
            className="absolute right-0 top-full z-50 mt-3 w-60 overflow-hidden rounded-2xl border border-gold/25 bg-ivory shadow-lux"
          >
            <div className="border-b border-gold/15 px-5 py-4">
              <p className="font-sans text-[10px] uppercase tracking-luxe text-gold">Signed in as</p>
              <p className="mt-1 truncate font-sans text-[13px] text-charcoal">{user.email}</p>
            </div>
            <div className="p-2">
              <MenuLink href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" strokeWidth={1.7} />}>My Studio</MenuLink>
              <MenuLink href="/dashboard/invitations" icon={<Ticket className="h-4 w-4" strokeWidth={1.7} />}>My Invitations</MenuLink>
              <MenuLink href="/dashboard/settings" icon={<Settings className="h-4 w-4" strokeWidth={1.7} />}>Settings</MenuLink>
            </div>
            <div className="border-t border-gold/15 p-2">
              <button
                type="button"
                role="menuitem"
                onClick={signOut}
                disabled={signingOut}
                className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 font-sans text-[12px] uppercase tracking-wide-2 text-maroon transition-colors hover:bg-maroon/8 disabled:opacity-60"
              >
                {signingOut ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" strokeWidth={1.7} />}
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      role="menuitem"
      className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 font-sans text-[12px] uppercase tracking-wide-2 text-ink-soft transition-colors hover:bg-gold/10 hover:text-burgundy"
    >
      <span className="text-gold">{icon}</span>
      {children}
    </Link>
  );
}
