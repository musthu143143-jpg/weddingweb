"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Copy, KeyRound, LoaderCircle, Lock, X } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { PAYMENT_INFO } from "@/data/content";
import { unlockInvitationAction } from "@/app/dashboard/actions";
import type { UnlockResult } from "@/lib/orders";

export default function UnlockFlow({
  invitationId,
  templateName,
  price,
  onClose,
}: {
  invitationId: string;
  templateName: string;
  price: number;
  onClose: () => void;
}) {
  const [confirmed, setConfirmed] = useState(false);
  const [code, setCode] = useState("");
  const [state, formAction, pending] = useActionState(unlockInvitationAction, null);

  useEffect(() => {
    if (state?.ok) {
      const t = setTimeout(onClose, 2800);
      return () => clearTimeout(t);
    }
  }, [state, onClose]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-charcoal/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Order and unlock publishing">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-lg rounded-[24px] border border-gold/25 bg-ivory p-7 shadow-lux"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-sans text-[10px] uppercase tracking-luxe text-gold">Order & publish</p>
            <h2 className="mt-1 font-display text-3xl font-medium text-charcoal">Unlock “{templateName}”</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/30 text-charcoal hover:bg-gold/10">
            <X className="h-4 w-4" />
          </button>
        </div>

        {state?.ok ? (
          <div className="mt-8 flex flex-col items-center gap-4 py-8 text-center">
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 220, damping: 14 }} className="flex h-16 w-16 items-center justify-center rounded-full bg-sage/15 text-sage">
              <CheckCircle2 className="h-8 w-8" strokeWidth={1.8} />
            </motion.span>
            <p className="font-display text-2xl text-charcoal">Unlocked!</p>
            <p className="max-w-xs font-sans text-[13px] font-light text-ink-soft/70">{state.message}</p>
          </div>
        ) : (
          <>
            <div className="mt-5 flex items-center justify-between rounded-2xl border border-gold/30 bg-white/70 px-5 py-4">
              <span className="font-sans text-[12px] uppercase tracking-wide-2 text-ink-soft/60">Amount to pay</span>
              <span className="font-display text-3xl font-semibold text-burgundy">₹{price.toLocaleString("en-IN")}</span>
            </div>

            <div className="mt-4 rounded-2xl border border-gold/25 bg-white/70 p-5">
              <p className="font-sans text-[10px] uppercase tracking-luxe text-gold">Pay via UPI or bank transfer</p>
              <dl className="mt-3 space-y-2 font-sans text-[13px] text-ink-soft">
                <Row label="UPI" value={`${PAYMENT_INFO.upiId} · ${PAYMENT_INFO.upiName}`} copy={PAYMENT_INFO.upiId} />
                <Row label="Bank" value={`${PAYMENT_INFO.bankName} · ${PAYMENT_INFO.accountNumber}`} copy={PAYMENT_INFO.accountNumber} />
                <Row label="IFSC" value={PAYMENT_INFO.ifsc} copy={PAYMENT_INFO.ifsc} />
                <Row label="WhatsApp" value={PAYMENT_INFO.whatsapp} />
              </dl>
              <p className="mt-3 font-sans text-[12px] font-light leading-relaxed text-ink-soft/65">{PAYMENT_INFO.note}</p>
            </div>

            <label className="mt-4 flex items-start gap-3 rounded-xl border border-gold/25 bg-white/60 px-4 py-3">
              <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-0.5 h-4 w-4 accent-burgundy" />
              <span className="font-sans text-[13px] text-ink-soft">
                I have paid <strong>₹{price.toLocaleString("en-IN")}</strong> for this design and confirmed it on WhatsApp.
              </span>
            </label>

            <AnimatePresence>
              {confirmed && (
                <motion.form
                  action={(fd) => {
                    fd.set("invitationId", invitationId);
                    formAction(fd);
                  }}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 overflow-hidden"
                >
                  <label className="flex flex-col gap-1.5">
                    <span className="flex items-center gap-2 font-sans text-[11px] uppercase tracking-wide-2 text-ink-soft/60">
                      <KeyRound className="h-3.5 w-3.5 text-gold" /> Secret unlock key
                    </span>
                    <input
                      name="code"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="KEY-XXXX-XXXXXXXX"
                      className="w-full rounded-xl border border-gold/30 bg-white px-4 py-3.5 font-mono text-[14px] tracking-widest text-charcoal uppercase outline-none focus:border-gold"
                      required
                    />
                  </label>
                  {!state?.ok && state?.message && (
                    <p className="mt-3 rounded-xl border border-maroon/25 bg-maroon/5 px-4 py-3 font-sans text-[12.5px] text-maroon">{state.message}</p>
                  )}
                  <button type="submit" disabled={pending || !code} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#9a7a3c] via-[#c2a05a] to-[#9a7a3c] py-4 font-sans text-[12px] font-medium uppercase tracking-luxe text-burgundy-deep transition-transform hover:-translate-y-0.5 disabled:opacity-50">
                    {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                    {pending ? "Verifying key…" : "Confirm payment & unlock publishing"}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </>
        )}
      </motion.div>
    </div>
  );
}

function Row({ label, value, copy }: { label: string; value: string; copy?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="shrink-0 font-sans text-[11px] uppercase tracking-wide-2 text-ink-soft/50">{label}</dt>
      <dd className="flex items-center gap-2 text-right font-sans text-[13px] text-charcoal">
        {value}
        {copy && (
          <button
            type="button"
            aria-label={`Copy ${label}`}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(copy);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              } catch { /* ignore */ }
            }}
            className="text-gold hover:text-burgundy"
          >
            {copied ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        )}
      </dd>
    </div>
  );
}
