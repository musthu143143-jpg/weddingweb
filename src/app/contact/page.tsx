"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, Clock, LifeBuoy, Mail } from "lucide-react";
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { PageHero, Reveal } from "@/components/ui/core";
import { BRAND } from "@/data/content";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  return (
    <>
      <Navbar />
      <main>
        <PageHero eyebrow="Contact" title="We would love to" script="hear from you" sub="Questions about a template, a tradition we should design for, or your big day — write to us." />
        <section className="bg-ivory py-24">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
            <Reveal className="flex flex-col gap-6">
              {[
                { icon: Mail, title: "Email", text: BRAND.email, sub: "We reply within one business day." },
                { icon: Clock, title: "Studio Hours", text: "Mon – Sat · 10 AM – 7 PM IST", sub: "Chennai · India" },
                { icon: LifeBuoy, title: "Help Center", text: "Browse the FAQ on the pricing page", sub: "Quick answers to common questions.", href: "/pricing#faq" },
              ].map((c) => (
                <div key={c.title} className="flex items-start gap-5 rounded-2xl border border-gold/20 bg-white/70 p-7">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold">
                    <c.icon className="h-5 w-5" strokeWidth={1.6} />
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-charcoal">{c.title}</h3>
                    <p className="mt-1 font-sans text-[14px] text-ink-soft">{c.href ? <a className="underline-offset-4 hover:underline" href={c.href}>{c.text}</a> : c.text}</p>
                    <p className="mt-0.5 font-sans text-[12px] font-light text-ink-soft/60">{c.sub}</p>
                  </div>
                </div>
              ))}
            </Reveal>

            <Reveal delay={0.12}>
              <AnimatePresence mode="wait">
                {!sent ? (
                  <motion.form
                    key="f"
                    exit={{ opacity: 0, y: -14 }}
                    onSubmit={(e) => { e.preventDefault(); setSent(true); }}
                    className="flex flex-col gap-5 rounded-[24px] border border-gold/25 bg-white/80 p-8 shadow-card"
                  >
                    <label className="flex flex-col gap-1.5">
                      <span className="font-sans text-[11px] uppercase tracking-wide-2 text-ink-soft/60">Your name</span>
                      <input required className="rounded-xl border border-gold/30 bg-white px-4 py-3.5 font-sans text-[14px] outline-none focus:border-gold" placeholder="Aarav Sharma" />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="font-sans text-[11px] uppercase tracking-wide-2 text-ink-soft/60">Email</span>
                      <input required type="email" className="rounded-xl border border-gold/30 bg-white px-4 py-3.5 font-sans text-[14px] outline-none focus:border-gold" placeholder="you@example.com" />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="font-sans text-[11px] uppercase tracking-wide-2 text-ink-soft/60">Message</span>
                      <textarea required rows={5} className="resize-none rounded-xl border border-gold/30 bg-white px-4 py-3.5 font-sans text-[14px] outline-none focus:border-gold" placeholder="Tell us about your day…" />
                    </label>
                    <button type="submit" className="rounded-full bg-gradient-to-r from-[#9a7a3c] via-[#c2a05a] to-[#9a7a3c] py-4 font-sans text-[12px] font-medium uppercase tracking-luxe text-burgundy-deep transition-transform hover:-translate-y-0.5">
                      Send Message
                    </button>
                  </motion.form>
                ) : (
                  <motion.div key="s" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-5 rounded-[24px] border border-gold/25 bg-white/80 px-8 py-16 text-center shadow-card">
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/15 text-gold">
                      <Check className="h-7 w-7" strokeWidth={1.8} />
                    </span>
                    <h3 className="font-display text-3xl font-semibold text-charcoal">Message received</h3>
                    <p className="max-w-sm font-sans text-[14px] font-light text-ink-soft/75">
                      Thank you for writing to us. Our studio reads every message personally and will reply within one business day.
                    </p>
                    <button type="button" onClick={() => setSent(false)} className="font-sans text-[11px] uppercase tracking-wide-2 text-gold underline-offset-4 hover:underline">
                      Send another
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
