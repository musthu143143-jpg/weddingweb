"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Eye, Palette, Play } from "lucide-react";
import { useMemo, useState } from "react";
import type { Category, WeddingTemplate } from "@/lib/types";
import { BRAND, CATEGORIES } from "@/data/content";
import { formatINR, getTemplate, TEMPLATES } from "@/data/templates";
import { Button, Ornament, Reveal, SectionHeading } from "@/components/ui/core";
import { CategoryFilter, SearchBox, TemplateGrid } from "@/components/template/TemplateUI";
import MiniPreview from "@/components/invitation/MiniPreview";

/* ---------------------------- Marketplace teaser --------------------------- */

export function MarketplaceTeaser({
  showHeading = true,
  initialCategory = "All",
  templates,
}: {
  showHeading?: boolean;
  initialCategory?: string;
  /** Server-provided templates (database-backed). Falls back to the static set. */
  templates?: WeddingTemplate[];
}) {
  const [active, setActive] = useState<string>(initialCategory);
  const [query, setQuery] = useState("");
  const source = templates && templates.length > 0 ? templates : TEMPLATES;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return source.filter((t) => {
      const inCat = active === "All" || t.categories.includes(active as Category);
      const inQuery =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.style.some((s) => s.toLowerCase().includes(q)) ||
        t.categories.some((c) => c.toLowerCase().includes(q));
      return inCat && inQuery;
    });
  }, [active, query, source]);

  return (
    <section id="templates" className="relative bg-ivory py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {showHeading && (
          <SectionHeading
            eyebrow="The Collection"
            title="Find the invitation that feels like you."
            sub="Explore beautifully crafted designs created for every kind of love story."
          />
        )}
        <Reveal delay={0.15} className={`${showHeading ? "mt-12" : ""} flex flex-col items-center gap-6`}>
          <SearchBox value={query} onChange={setQuery} />
          <CategoryFilter options={["All", ...CATEGORIES]} active={active} onChange={setActive} />
        </Reveal>
        <div className="mt-12">
          <TemplateGrid templates={filtered} />
        </div>
        <Reveal className="mt-14 flex justify-center">
          <Button href="/templates" variant="outline">
            View All Templates <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.8} />
          </Button>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------ Featured template -------------------------- */

export function FeaturedTemplate() {
  const tpl = getTemplate("royal-garden")!;
  return (
    <section className="relative overflow-hidden bg-cream py-28">
      <div className="pointer-events-none absolute inset-0 bg-paper" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-2">
        <Reveal className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[26px] border border-gold/30 shadow-lux sm:aspect-[5/5]">
            <Image src={tpl.image} alt={tpl.imageAlt} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 to-transparent" />
          </div>
          <div className="absolute -right-4 -bottom-10 hidden h-72 w-52 rotate-3 overflow-hidden rounded-2xl border border-gold/50 shadow-lux sm:block">
            <MiniPreview template={tpl} />
          </div>
          <span className="absolute top-5 left-5 rounded-full bg-gradient-to-r from-[#9a7a3c] to-[#c2a05a] px-4 py-2 font-sans text-[10px] font-medium uppercase tracking-luxe text-burgundy-deep shadow-md">
            Featured Design
          </span>
        </Reveal>

        <Reveal delay={0.15} className="flex flex-col items-start gap-6">
          <span className="font-sans text-[11px] uppercase tracking-luxe text-gold">Editorial Spotlight</span>
          <h2 className="font-display text-5xl leading-[1.05] font-medium text-charcoal sm:text-6xl">The Royal Garden</h2>
          <Ornament style="royal" className="h-5 w-44 text-gold/70" />
          <p className="max-w-lg font-sans text-[16px] leading-relaxed font-light text-ink-soft/85">
            A romantic invitation inspired by timeless gardens, elegant architecture and royal
            celebrations. Gold-leaf detailing, a graceful 3D opening and every section your day deserves.
          </p>
          <ul className="grid max-w-md grid-cols-2 gap-x-6 gap-y-3">
            {tpl.features.map((f) => (
              <li key={f} className="flex items-center gap-2.5 font-sans text-[14px] font-light text-ink-soft">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold/15 text-gold">
                  <Check className="h-3 w-3" strokeWidth={2.2} />
                </span>
                {f}
              </li>
            ))}
          </ul>
          <p className="font-display text-3xl font-semibold text-burgundy">{formatINR(tpl.price)}</p>
          <div className="flex flex-wrap gap-4">
            <Button href="/templates/royal-garden" variant="gold">
              <Play className="h-3.5 w-3.5" strokeWidth={2} /> Experience Template
            </Button>
            <Button href="/customize/royal-garden" variant="outline">
              <Palette className="h-3.5 w-3.5" strokeWidth={1.8} /> Customize
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------ 3D experience ------------------------------ */

const STEPS = [
  { title: "A sealed invitation", text: "Your guests receive a single, beautiful link." },
  { title: "The envelope opens", text: "A cinematic unfold, as delicate as real paper." },
  { title: "Florals emerge", text: "Your theme blossoms across the screen." },
  { title: "Names reveal", text: "Your story begins in elegant script." },
  { title: "The experience begins", text: "Story, events, gallery, RSVP — one seamless journey." },
];

export function Experience3D() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const reduce = useReducedMotion();

  function play() {
    setPlaying(true);
    setStep(0);
    const delays = [900, 1100, 1100, 1200];
    let acc = 400;
    delays.forEach((d, i) => {
      acc += d;
      setTimeout(() => setStep(i + 1), acc);
    });
    setTimeout(() => setPlaying(false), acc + 800);
  }

  const flap = step >= 1;
  const rise = step >= 2;
  const florals = step >= 3;
  const names = step >= 4;

  return (
    <section className="relative overflow-hidden bg-burgundy-deep py-28 text-ivory">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/10 blur-[130px]" />
        <div className="absolute inset-0 bg-grain opacity-40" />
      </div>
      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-2">
        <div className="flex flex-col items-start gap-6">
          <SectionHeading
            dark
            align="left"
            eyebrow={`The ${BRAND.name} Difference`}
            title={<>Not just an invitation. <span className="font-script text-gold-gradient">An experience.</span></>}
            sub="Press play and watch a sealed envelope become a complete wedding experience — in your theme, with your story."
          />
          <ol className="mt-2 space-y-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className={`flex items-start gap-4 transition-all duration-500 ${step >= i ? "opacity-100" : "opacity-35"}`}>
                <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-display text-sm transition-colors duration-500 ${step >= i ? "border-gold-soft bg-gold-soft/15 text-gold-soft" : "border-ivory/25 text-ivory/50"}`}>
                  {i + 1}
                </span>
                <div>
                  <p className="font-display text-lg font-semibold text-ivory">{s.title}</p>
                  <p className="font-sans text-[13px] font-light text-ivory/60">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <Button onClick={play} variant="gold" disabled={playing}>
            <Play className="h-3.5 w-3.5" strokeWidth={2} /> {playing ? "Playing…" : step > 0 ? "Replay Experience" : "Begin the Experience"}
          </Button>
        </div>

        {/* Staged scene */}
        <div className="perspective-1200 relative mx-auto flex h-[460px] w-full max-w-sm items-center justify-center">
          <div className="preserve-3d relative aspect-[3/4] w-[290px] sm:w-[320px]">
            <div className="absolute -inset-10 rounded-full bg-gold/15 blur-3xl" aria-hidden="true" />
            {/* back */}
            <div className="absolute inset-0 rounded-[18px] border border-gold-soft/50 bg-gradient-to-b from-[#6d1329] to-[#470c1b]" />
            {/* letter */}
            <motion.div
              animate={{ y: rise ? "-42%" : "0%" }}
              transition={{ duration: reduce ? 0.2 : 1.1, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-4 top-4 bottom-4 z-10 flex flex-col items-center justify-start overflow-hidden rounded-[12px] bg-[#f6ecd8] px-5 pt-9 text-center text-burgundy"
            >
              <AnimatePresence>
                {florals && (
                  <motion.svg initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9 }} viewBox="0 0 120 40" className="h-8 w-28 text-gold" fill="none" stroke="currentColor" strokeWidth="1.1">
                    <path d="M10 30c14-16 28-16 40-6m60 6c-14-16-28-16-40-6" />
                    <circle cx="60" cy="20" r="4" />
                    <path d="M52 14c-4-4-10-2-10 3 5 2 9 0 10-3Zm16 0c4-4 10-2 10 3-5 2-9 0-10-3Z" />
                  </motion.svg>
                )}
              </AnimatePresence>
              <motion.div animate={{ opacity: names ? 1 : 0, y: names ? 0 : 14 }} transition={{ duration: 0.9 }}>
                <p className="font-sans text-[8px] uppercase tracking-luxe text-maroon/80">Together with their families</p>
                <p className="mt-3 font-script text-[40px] leading-[0.95]">Aarav</p>
                <span className="font-display italic text-gold">&</span>
                <p className="font-script text-[40px] leading-[0.95]">Meera</p>
                <Ornament style="royal" className="mx-auto mt-3 h-3.5 w-28 text-gold" />
                <p className="mt-3 font-sans text-[9px] uppercase tracking-wide-2 text-maroon">14 December 2026</p>
              </motion.div>
            </motion.div>
            {/* pocket */}
            <div className="absolute inset-x-0 bottom-0 z-20 h-[56%] rounded-b-[18px] border-t border-gold-soft/60 bg-gradient-to-b from-[#5e1124] to-[#3c0916]">
              <div className="flex h-full flex-col items-center justify-center gap-2">
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold-soft/70 font-display text-[13px] text-gold-soft">A·M</span>
                <p className="font-script text-2xl text-ivory">Aarav & Meera</p>
              </div>
            </div>
            {/* flap */}
            <motion.div
              animate={{ rotateX: flap ? -178 : 0 }}
              transition={{ duration: reduce ? 0.2 : 1, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 top-0 z-30 h-[56%] origin-top"
              style={{ transformStyle: "preserve-3d" }}
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-[#7a1430] to-[#5e1124]" style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }} />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* small re-export for pages that only want the CTA icons */
export { Eye as EyeIcon };
