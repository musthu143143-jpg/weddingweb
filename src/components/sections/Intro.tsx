"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Heart, RefreshCw, Share2, Sparkles, Wand2 } from "lucide-react";
import { useRef } from "react";
import { BRAND, WHY_DIGITAL } from "@/data/content";
import { Reveal, SectionHeading } from "@/components/ui/core";

/* --------------------------- Emotional introduction ------------------------ */

export function EmotionalIntro() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [40, -40]);
  const y2 = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-30, 50]);

  return (
    <section id="emotional" className="relative overflow-hidden bg-ivory py-28 sm:py-36">
      <div className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-gold-pale/60 blur-3xl" aria-hidden="true" />
      <div ref={ref} className="mx-auto grid max-w-7xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-2 lg:gap-24">
        <Reveal className="flex flex-col items-start gap-6">
          <span className="font-sans text-[11px] uppercase tracking-luxe text-gold">The Beginning</span>
          <h2 className="font-display text-4xl leading-[1.08] font-medium text-charcoal sm:text-5xl lg:text-[3.4rem]">
            Some moments deserve
            <span className="block font-script text-5xl text-burgundy sm:text-6xl">more than a message.</span>
          </h2>
          <div className="h-px w-24 bg-gold/60" />
          <p className="max-w-lg font-sans text-[16px] leading-relaxed font-light text-ink-soft/85">
            A wedding invitation is the beginning of your celebration. It is the first glimpse into
            your story, your families, your memories, and the beautiful day you are about to share.
          </p>
          <p className="max-w-lg font-sans text-[15px] leading-relaxed font-light text-ink-soft/70">
            {BRAND.name} turns that first glimpse into an experience — one your guests open, feel, and
            remember long before the first note of music plays.
          </p>
          <p className="font-script text-4xl text-gold">with love, always</p>
        </Reveal>

        {/* Visual composition */}
        <div className="relative mx-auto h-[520px] w-full max-w-md sm:h-[580px]">
          <motion.div style={{ y: y1 }} className="absolute top-0 left-0 h-[68%] w-[72%] overflow-hidden rounded-t-[140px] rounded-b-[20px] border-4 border-ivory shadow-lux">
            <Image src="/images/garden.jpg" alt="A romantic garden wedding arch at golden hour" fill className="object-cover" />
          </motion.div>
          <motion.div style={{ y: y2 }} className="absolute right-0 bottom-0 h-[52%] w-[56%] overflow-hidden rounded-[20px] border-4 border-ivory shadow-lux">
            <Image
              src="https://images.pexels.com/photos/38781228/pexels-photo-38781228.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800"
              alt="A couple framed by white flowers on their wedding day"
              fill
              className="object-cover"
            />
          </motion.div>
          <div className="absolute top-[58%] left-[52%] z-10 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gold/50 bg-ivory shadow-card">
            <span className="font-script text-3xl text-burgundy">A·M</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Why digital -------------------------------- */

const WHY_ICONS: Record<string, typeof Heart> = {
  sparkles: Sparkles,
  share: Share2,
  refresh: RefreshCw,
  wand: Wand2,
  heart: Heart,
};

export function WhyDigital() {
  return (
    <section className="bg-charcoal py-28 text-ivory">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          dark
          eyebrow="Why Digital"
          title="Why couples choose a digital invitation"
          sub="Beautiful, effortless and unforgettable — everything a paper card wishes it could be."
        />
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {WHY_DIGITAL.map((w, i) => {
            const Icon = WHY_ICONS[w.icon] ?? Heart;
            return (
              <Reveal key={w.title} delay={i * 0.08}>
                <div className="group flex h-full flex-col items-center gap-4 rounded-2xl border border-ivory/10 px-6 py-9 text-center transition-all duration-500 hover:-translate-y-1.5 hover:border-gold-soft/40 hover:bg-ivory/[0.04]">
                  <span className="flex h-13 w-13 items-center justify-center rounded-full border border-gold-soft/40 text-gold-soft transition-colors duration-500 group-hover:bg-gold-soft/10" style={{ height: 52, width: 52 }}>
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                  </span>
                  <h3 className="font-display text-xl font-semibold text-ivory">{w.title}</h3>
                  <p className="font-sans text-[13px] leading-relaxed font-light text-ivory/60">{w.text}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
