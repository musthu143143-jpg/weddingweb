"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

/**
 * Client-side auth state for UI purposes (showing an account menu vs a login
 * link).
 *
 * This intentionally uses `getSession()` rather than `getUser()`:
 * `getUser()` performs a network round-trip to the Auth server, so a slow or
 * failed request would make a signed-in visitor look signed-out and render a
 * "Login" link. `getSession()` reads the existing cookie locally, so the
 * header resolves instantly and reliably.
 *
 * This is safe because it only drives presentation. Every actual authorization
 * decision still happens on the server via `getUser()` / `getClaims()` in
 * `authGuard.ts`, `adminAuth.ts` and the Supabase proxy — a spoofed cookie
 * cannot unlock protected data.
 */
export function useSupabaseUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    let active = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return;
        setUser(data.session?.user ?? null);
        setLoading(false);
      })
      .catch(() => {
        if (active) setLoading(false);
      });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}
