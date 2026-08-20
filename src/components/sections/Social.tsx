"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, ChevronDown, Quote } from "lucide-react";
import { useState } from "react";
import { INSPIRATION, PRICING, TESTIMONIALS } from "@/data/content";
import { formatINR } from "@/data/templates";
import { Button, Ornament, Reveal, SectionHeading } from "@/components/ui/core";

/* ------------------------------- Testimonials ------------------------------ */

export function Testimonials() {
  return (
    <section className="bg-ivory py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Words From Couples"
          title={<>Opening it felt <span className="font-script text-burgundy">like the day itself.</span></>}
        />
        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.names} delay={(i % 2) * 0.12}>
              <figure className="relative flex h-full flex-col gap-5 rounded-[22px] border border-gold/20 bg-white/70 p-9 transition-all duration-500 hover:-translate-y-1 hover:shadow-card">
                <Quote className="h-7 w-7 text-gold/50" strokeWidth={1.4} />
                <blockquote className="font-display text-[22px] leading-snug font-medium text-charcoal italic">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-auto flex items-center justify-between">
                  <span className="font-sans text-[12px] uppercase tracking-wide-2 text-burgundy">{t.names}</span>
                  <span className="font-sans text-[10px] tracking-wide-2 text-ink-soft/45 uppercase">{t.note}</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- Inspiration ------------------------------- */

export function Inspiration({ full = false }: { full?: boolean }) {
  const items = full ? INSPIRATION : INSPIRATION.slice(0, 3);
  return (
    <section className="bg-cream/70 py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Inspiration"
          title="Wedding Stories"
          sub="Six worlds of romance — find the atmosphere that feels like yours, then step inside it."
        />
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((ins, i) => (
            <Reveal key={ins.title} delay={(i % 3) * 0.1}>
              <Link href={`/templates/${ins.templateSlug}`} className="group relative block overflow-hidden rounded-[22px] border border-gold/20 shadow-card">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image src={ins.image} alt={ins.title} fill className="object-cover transition-transform duration-[1200ms] group-hover:scale-[1.07]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/20 to-transparent" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-7">
                  <h3 className="font-display text-2xl font-semibold text-ivory">{ins.title}</h3>
                  <p className="mt-1.5 font-sans text-[13px] font-light text-ivory/70">{ins.blurb}</p>
                  <span className="mt-4 inline-flex items-center gap-2 font-sans text-[11px] uppercase tracking-wide-2 text-gold-soft transition-transform duration-300 group-hover:translate-x-1">
                    Explore this style <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.8} />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
        {!full && (
          <Reveal className="mt-14 flex justify-center">
            <Button href="/inspiration" variant="outline">All Wedding Stories</Button>
          </Reveal>
        )}
      </div>
    </section>
  );
}

/* --------------------------------- Pricing --------------------------------- */

const FAQS = [
  { q: "How do our guests open the invitation?", a: "You share a single beautiful link through WhatsApp, Instagram, Messenger or email. It opens instantly on any phone, tablet or desktop — no app or download needed." },
  { q: "Can we edit details after sharing?", a: "Yes. Venue, timing, dress code or any detail can be updated at any time, and every guest sees the latest version automatically." },
  { q: "Do you support our traditions?", a: "Absolutely. The collection includes Indian, Hindu, Muslim, Christian, South Indian and destination styles — and every section can be renamed to match your ceremonies." },
  { q: "Can we add our own photos and music?", a: "Yes — your gallery, your story photographs and the song that is yours. Signature and Luxury plans include music and unlimited gallery space." },
];

export function PricingSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="bg-ivory py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Pricing"
          title="Choose how you celebrate."
          sub="Transparent pricing, no hidden costs. Every plan includes a shareable, beautiful invitation."
        />
        <div className="mt-16 grid items-stretch gap-7 lg:grid-cols-3">
          {PRICING.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.1} className="h-full">
              <div
                className={`relative flex h-full flex-col rounded-[26px] border p-9 transition-all duration-500 hover:-translate-y-2 ${
                  p.popular
                    ? "border-gold bg-burgundy-deep text-ivory shadow-lux"
                    : "border-gold/25 bg-white/70 text-charcoal shadow-card"
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#9a7a3c] via-[#c2a05a] to-[#9a7a3c] px-5 py-2 font-sans text-[10px] font-medium uppercase tracking-luxe text-burgundy-deep shadow-md">
                    Most Popular
                  </span>
                )}
                <h3 className={`font-display text-3xl font-semibold ${p.popular ? "text-gold-soft" : "text-burgundy"}`}>{p.name}</h3>
                <p className={`mt-1 font-sans text-[13px] font-light ${p.popular ? "text-ivory/60" : "text-ink-soft/60"}`}>{p.blurb}</p>
                <p className="mt-6 flex items-end gap-2">
                  <span className="font-display text-5xl font-semibold">{formatINR(p.price)}</span>
                  <span className={`mb-1.5 font-sans text-[12px] uppercase tracking-wide-2 ${p.popular ? "text-ivory/50" : "text-ink-soft/50"}`}>one time</span>
                </p>
                <Ornament style="royal" className={`mt-6 h-4 w-32 ${p.popular ? "text-gold-soft/60" : "text-gold/50"}`} />
                <ul className="mt-6 flex-1 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 font-sans text-[14px] font-light">
                      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${p.popular ? "bg-gold-soft/20 text-gold-soft" : "bg-gold/12 text-gold"}`}>
                        <Check className="h-3 w-3" strokeWidth={2.2} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/templates"
                  className={`mt-9 block rounded-full py-4 text-center font-sans text-[12px] font-medium uppercase tracking-luxe transition-all duration-500 hover:-translate-y-0.5 ${
                    p.popular
                      ? "bg-gradient-to-r from-[#9a7a3c] via-[#c2a05a] to-[#9a7a3c] text-burgundy-deep shadow-[0_12px_30px_-12px_rgb(176_141_74/0.8)]"
                      : "border border-gold/60 text-burgundy hover:bg-gold/10"
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            </Reveal>
          ))}
        </div>

        {/* FAQ */}
        <div id="faq" className="mx-auto mt-24 max-w-3xl">
          <Reveal className="mb-10 text-center">
            <h3 className="font-display text-3xl font-medium text-charcoal">Questions, answered</h3>
            <Ornament style="royal" className="mx-auto mt-4 h-4 w-32 text-gold/60" />
          </Reveal>
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <Reveal key={f.q} delay={i * 0.06}>
                <div className="overflow-hidden rounded-2xl border border-gold/20 bg-white/70">
                  <button
                    type="button"
                    onClick={() => setOpen(open === i ? null : i)}
                    aria-expanded={open === i}
                    className="flex w-full items-center justify-between gap-4 px-7 py-5 text-left font-display text-lg font-semibold text-charcoal"
                  >
                    {f.q}
                    <ChevronDown className={`h-4 w-4 shrink-0 text-gold transition-transform duration-300 ${open === i ? "rotate-180" : ""}`} strokeWidth={1.8} />
                  </button>
                  <AnimatePresence initial={false}>
                    {open === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
                        <p className="px-7 pb-6 font-sans text-[14px] leading-relaxed font-light text-ink-soft/80">{f.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- Final CTA -------------------------------- */

export function FinalCta() {
  return (
    <section className="relative overflow-hidden py-36 text-center text-ivory">
      <div className="absolute inset-0" aria-hidden="true">
        <Image src="/images/candles.jpg" alt="" fill className="object-cover" />
        <div className="absolute inset-0 bg-burgundy-deep/82" />
        <div className="absolute inset-0 bg-gradient-to-t from-burgundy-deep via-transparent to-burgundy-deep/60" />
      </div>
      <Reveal className="relative mx-auto flex max-w-3xl flex-col items-center gap-7 px-5">
        <span className="font-sans text-[11px] uppercase tracking-luxe text-gold-soft">Begin Your Forever</span>
        <h2 className="font-display text-5xl leading-[1.05] font-medium sm:text-6xl">
          Your forever deserves
          <span className="mt-2 block font-script text-6xl text-gold-gradient sm:text-7xl">a beautiful beginning.</span>
        </h2>
        <p className="max-w-md font-sans text-[16px] font-light text-ivory/70">
          Create an invitation as unique as your love story.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-4">
          <Button href="/templates" variant="gold">Create Your Invitation</Button>
          <Button href="/pricing" variant="outlineLight">View Pricing</Button>
        </div>
      </Reveal>
    </section>
  );
}
