"use client";

import { LogOut, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const [loading, setLoading] = useState(false);

  async function signOut() {
    const supabase = createClient();
    if (!supabase) return;
    setLoading(true);
    await supabase.auth.signOut();
    window.location.assign("/login?signed_out=1");
  }

  return (
    <button type="button" onClick={signOut} disabled={loading} className="inline-flex items-center gap-2 rounded-full border border-gold/40 px-5 py-2.5 font-sans text-[11px] uppercase tracking-wide-2 text-charcoal transition-colors hover:bg-gold/10 disabled:opacity-60">
      {loading ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" strokeWidth={1.7} />}
      Sign out
    </button>
  );
}
