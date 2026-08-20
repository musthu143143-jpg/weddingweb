"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Eye, Palette, Search, Sparkles } from "lucide-react";
import type { Category, WeddingTemplate } from "@/lib/types";
import { formatINR } from "@/data/templates";
import { Reveal } from "@/components/ui/core";

/* ------------------------------ Category filter ---------------------------- */

export function CategoryFilter({
  options,
  active,
  onChange,
}: {
  options: ("All" | Category)[];
  active: string;
  onChange: (c: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:justify-center sm:overflow-visible" role="tablist" aria-label="Filter templates by category">
      {options.map((c) => {
        const isActive = active === c;
        return (
          <button
            key={c}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(c)}
            className={`shrink-0 rounded-full border px-5 py-2.5 font-sans text-[11px] uppercase tracking-wide-2 transition-all duration-400 ${
              isActive
                ? "border-burgundy bg-burgundy text-ivory shadow-[0_8px_24px_-10px_rgb(94_17_36/0.7)]"
                : "border-gold/30 bg-transparent text-ink-soft hover:border-gold/70 hover:text-burgundy"
            }`}
          >
            {c}
          </button>
        );
      })}
    </div>
  );
}

/* --------------------------------- Search ---------------------------------- */

export function SearchBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <label className="group relative flex w-full max-w-md items-center">
      <Search className="pointer-events-none absolute left-5 h-4 w-4 text-gold" strokeWidth={1.6} />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search templates, styles, traditions…"
        aria-label="Search templates"
        className="w-full rounded-full border border-gold/30 bg-white/60 py-3.5 pr-5 pl-12 font-sans text-[14px] font-light text-charcoal outline-none transition-all duration-300 placeholder:text-ink-soft/45 focus:border-gold focus:bg-white focus:shadow-[0_10px_30px_-16px_rgb(176_141_74/0.5)]"
      />
    </label>
  );
}

/* ------------------------------- Template card ----------------------------- */

export function TemplateCard({ template, index = 0 }: { template: WeddingTemplate; index?: number }) {
  return (
    <Reveal delay={(index % 3) * 0.1}>
      <article className="group relative flex h-full flex-col overflow-hidden rounded-[22px] border border-gold/20 bg-white/70 shadow-[0_10px_30px_-20px_rgb(33_26_22/0.4)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-lux">
        {/* Visual */}
        <div className="relative aspect-[4/5] overflow-hidden">
          <Image
            src={template.image}
            alt={template.imageAlt}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
            className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/10 to-transparent opacity-80 transition-opacity duration-500" />

          {/* Mini invitation chip rendered in the template's own identity */}
          <div className="absolute inset-x-5 bottom-5 overflow-hidden rounded-xl border shadow-card transition-transform duration-500 group-hover:-translate-y-1" style={{ borderColor: `${template.theme.gold}66` }}>
            <div className="h-[132px]">
              <MiniChip template={template} />
            </div>
          </div>

          <span className="absolute top-4 left-4 flex flex-wrap gap-1.5">
            {template.premium && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#9a7a3c] to-[#c2a05a] px-3.5 py-1.5 font-sans text-[10px] font-medium uppercase tracking-wide-2 text-burgundy-deep shadow-md">
                <Sparkles className="h-3 w-3" strokeWidth={2} /> Premium
              </span>
            )}
            {template.opening && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-charcoal/70 px-3.5 py-1.5 font-sans text-[10px] font-medium uppercase tracking-wide-2 text-gold-soft shadow-md backdrop-blur-sm">
                <Sparkles className="h-3 w-3" strokeWidth={2} /> Interactive 3D
              </span>
            )}
          </span>
          <span className="absolute top-4 right-4 rounded-full bg-charcoal/40 px-3 py-1.5 font-sans text-[10px] uppercase tracking-wide-2 text-ivory backdrop-blur-sm">
            {template.categories[0]}
          </span>

          {/* Hover actions */}
          <div className="absolute inset-x-0 bottom-0 translate-y-full p-5 transition-transform duration-500 ease-out group-hover:translate-y-0 group-focus-within:translate-y-0">
            <div className="flex gap-2.5">
              <Link
                href={`/templates/${template.slug}`}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-ivory py-3 font-sans text-[11px] font-medium uppercase tracking-wide-2 text-burgundy transition-transform duration-300 hover:scale-[1.02]"
              >
                <Eye className="h-3.5 w-3.5" strokeWidth={1.8} /> View Demo
              </Link>
              <Link
                href={`/customize/${template.slug}`}
                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-gold-soft/70 py-3 font-sans text-[11px] font-medium uppercase tracking-wide-2 text-ivory backdrop-blur-sm transition-colors duration-300 hover:bg-gold-soft/20"
              >
                <Palette className="h-3.5 w-3.5" strokeWidth={1.8} /> Customize
              </Link>
            </div>
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-1 items-center justify-between gap-3 px-6 py-5">
          <div>
            <h3 className="font-display text-[22px] leading-tight font-semibold text-charcoal transition-colors duration-300 group-hover:text-burgundy">
              {template.name}
            </h3>
            <p className="mt-1 font-sans text-[11px] uppercase tracking-wide-2 text-ink-soft/60">
              {template.style.slice(0, 2).join(" • ")}
            </p>
          </div>
          <div className="flex flex-col items-end">
            <span className="font-display text-xl font-semibold text-burgundy">{formatINR(template.price)}</span>
            <Link href={`/templates/${template.slug}`} aria-label={`View ${template.name} demo`} className="mt-1 text-gold transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              <ArrowUpRight className="h-4 w-4" strokeWidth={1.8} />
            </Link>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

/** Small identity chip reusing the template's theme inside the card. */
function MiniChip({ template }: { template: WeddingTemplate }) {
  const t = template.theme;
  return (
    <div className="flex h-full flex-col items-center justify-center gap-1 px-4 text-center" style={{ background: t.panel, color: t.ink }}>
      <p className="font-script text-2xl leading-none" style={{ color: t.script }}>Aarav & Meera</p>
      <span className="h-px w-10" style={{ background: `${t.gold}90` }} />
      <p className="font-sans text-[8px] uppercase tracking-wide-2" style={{ color: t.accent }}>{template.style[0]}</p>
    </div>
  );
}

/* --------------------------------- Grid ------------------------------------ */

export function TemplateGrid({ templates }: { templates: WeddingTemplate[] }) {
  if (templates.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-gold/40 px-8 py-20 text-center">
        <Sparkles className="h-8 w-8 text-gold/60" strokeWidth={1.4} />
        <p className="font-display text-2xl text-charcoal">New designs for this tradition are being crafted.</p>
        <p className="max-w-sm font-sans text-[14px] font-light text-ink-soft/70">
          Explore the full collection, or choose another category — every love story deserves its perfect design.
        </p>
      </motion.div>
    );
  }
  return (
    <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
      {templates.map((t, i) => (
        <TemplateCard key={t.id} template={t} index={i} />
      ))}
    </div>
  );
}
