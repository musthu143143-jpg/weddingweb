"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Building2, Check, LoaderCircle, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type AuthMode = "login" | "register";
export type AuthRole = "user" | "reseller";

export default function AuthForm({
  mode,
  role = "user",
  redirectTo,
  tone = "light",
}: {
  mode: AuthMode;
  /** Which account type is being registered. Ignored in login mode. */
  role?: AuthRole;
  /** Where to send the browser after a successful login/registration with a session. */
  redirectTo?: string;
  /** Visual tone — "dark" is used on the admin sign-in screen. */
  tone?: "light" | "dark";
}) {
  const isRegister = mode === "register";
  const isReseller = role === "reseller";
  const destination = redirectTo ?? "/dashboard";
  const isDark = tone === "dark";
  const inputClass = isDark ? "auth-input auth-input-dark" : "auth-input";
  const labelClass = isDark ? "text-ivory/55" : "text-ink-soft/60";
  const noteClass = isDark ? "text-ivory/45" : "text-ink-soft/55";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (active && data.user) window.location.replace(destination);
    });

    return () => {
      active = false;
    };
  }, [destination]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!isSupabaseConfigured()) {
      setError("Supabase is not connected yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to your environment, then restart the app.");
      return;
    }

    if (isRegister && password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Please use a password with at least 6 characters.");
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setError("Supabase could not be initialized. Check your public project URL and key.");
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              wedding_date: weddingDate || null,
              requested_role: role,
              business_name: isReseller ? businessName.trim() : null,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(destination)}`,
          },
        });

        if (signUpError) throw signUpError;

        if (data.session) {
          window.location.assign(destination);
        } else {
          setMessage("Your account is nearly ready. Check your inbox for the confirmation link, then return here to continue.");
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (signInError) throw signInError;
        window.location.assign(destination);
      }
    } catch (caught) {
      const authError = caught as { message?: string };
      setError(readableAuthError(authError.message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-10 w-full max-w-sm">
      <AnimatePresence mode="wait">
        {message ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 rounded-2xl border border-gold/30 bg-gold-pale/40 px-6 py-8 text-center"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/20 text-gold">
              <Check className="h-5 w-5" strokeWidth={2} />
            </span>
            <p className="font-display text-xl font-semibold text-charcoal">Check your email</p>
            <p className="font-sans text-[13px] leading-relaxed font-light text-ink-soft/75">{message}</p>
            <button type="button" onClick={() => setMessage(null)} className="font-sans text-[11px] uppercase tracking-wide-2 text-burgundy underline-offset-4 hover:underline">
              Back to sign in
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={submit}
            className="flex flex-col gap-5"
            noValidate
          >
            {isRegister && (
              <Field label={isReseller ? "Contact name" : "Your names"} icon={<UserRound className="h-4 w-4" strokeWidth={1.6} />} labelClass={labelClass}>
                <input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                  className={inputClass}
                  placeholder={isReseller ? "Priya Sharma" : "Aarav & Meera"}
                />
              </Field>
            )}
            {isRegister && isReseller && (
              <Field label="Business / studio name" icon={<Building2 className="h-4 w-4" strokeWidth={1.6} />} labelClass={labelClass}>
                <input
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  autoComplete="organization"
                  className={inputClass}
                  placeholder="Sharma Wedding Studio"
                />
              </Field>
            )}
            <Field label="Email" icon={<Mail className="h-4 w-4" strokeWidth={1.6} />} labelClass={labelClass}>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className={inputClass}
                placeholder="you@example.com"
              />
            </Field>
            <Field label="Password" icon={<LockKeyhole className="h-4 w-4" strokeWidth={1.6} />} labelClass={labelClass}>
              <input
                required
                type="password"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isRegister ? "new-password" : "current-password"}
                className={inputClass}
                placeholder="At least 6 characters"
              />
            </Field>
            {isRegister && (
              <>
                <Field label="Confirm password" icon={<LockKeyhole className="h-4 w-4" strokeWidth={1.6} />} labelClass={labelClass}>
                  <input
                    required
                    type="password"
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    className={inputClass}
                    placeholder="Repeat your password"
                  />
                </Field>
                {!isReseller && (
                  <Field label="Wedding date (optional)" icon={<span className="text-[13px]">✦</span>} labelClass={labelClass}>
                    <input
                      type="date"
                      value={weddingDate}
                      onChange={(e) => setWeddingDate(e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                )}
              </>
            )}

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex items-start gap-2.5 rounded-xl border border-maroon/25 bg-maroon/5 px-4 py-3 text-maroon">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.8} />
                  <p className="font-sans text-[12px] leading-relaxed">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#9a7a3c] via-[#c2a05a] to-[#9a7a3c] py-4 font-sans text-[12px] font-medium uppercase tracking-luxe text-burgundy-deep transition-all hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60"
            >
              {loading && <LoaderCircle className="h-4 w-4 animate-spin" strokeWidth={1.8} />}
              {loading ? "Please wait…" : isRegister ? (isReseller ? "Create Reseller Account" : "Create Account") : "Login"}
            </button>

            <p className={`text-center font-sans text-[11px] font-light leading-relaxed ${noteClass}`}>
              Secured by Supabase Auth. Your account data stays in your Supabase project.
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, icon, children, labelClass = "text-ink-soft/60" }: { label: string; icon: React.ReactNode; children: React.ReactNode; labelClass?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className={`flex items-center gap-2 font-sans text-[11px] uppercase tracking-wide-2 ${labelClass}`}>
        <span className="text-gold">{icon}</span>{label}
      </span>
      {children}
    </label>
  );
}

function readableAuthError(message?: string) {
  if (!message) return "We could not complete that request. Please try again.";
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials")) return "That email and password combination is not recognised.";
  if (lower.includes("email not confirmed")) return "Please confirm your email address from your inbox before logging in.";
  if (lower.includes("user already registered")) return "An account with this email already exists. Try logging in instead.";
  if (lower.includes("rate limit")) return "Too many attempts. Please wait a moment and try again.";
  if (lower.includes("password")) return message;
  return message;
}
