"use client";

import { CalendarDays, Gift, Heart, Hourglass, Image as ImageIcon, Mail, MapPin, Music2, Plane, Users } from "lucide-react";
import { FEATURES, HOW_IT_WORKS } from "@/data/content";
import { Reveal, SectionHeading } from "@/components/ui/core";

const ICONS: Record<string, typeof Heart> = {
  heart: Heart,
  calendar: CalendarDays,
  "map-pin": MapPin,
  hourglass: Hourglass,
  image: ImageIcon,
  mail: Mail,
  music: Music2,
  users: Users,
  plane: Plane,
  gift: Gift,
};

/* ------------------------------- Features grid ----------------------------- */

export function FeaturesGrid() {
  return (
    <section className="bg-cream/60 py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Crafted With Care"
          title="Everything your guests need."
          sub="Every invitation can carry your whole celebration — beautifully organised, effortlessly shared."
        />
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {FEATURES.map((f, i) => {
            const Icon = ICONS[f.icon] ?? Heart;
            return (
              <Reveal key={f.title} delay={(i % 5) * 0.07}>
                <div className="group flex h-full flex-col gap-4 rounded-2xl border border-gold/15 bg-white/70 p-7 transition-all duration-500 hover:-translate-y-1.5 hover:border-gold/40 hover:shadow-card">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold transition-all duration-500 group-hover:bg-burgundy group-hover:text-gold-soft">
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                  </span>
                  <h3 className="font-display text-[22px] font-semibold text-charcoal">{f.title}</h3>
                  <p className="font-sans text-[13.5px] leading-relaxed font-light text-ink-soft/75">{f.text}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- How it works ------------------------------ */

export function HowItWorks({ compact = false }: { compact?: boolean }) {
  return (
    <section className={`bg-ivory ${compact ? "py-20" : "py-28"}`}>
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Simple & Beautiful"
          title="How it works"
          sub="From choosing a design to sharing your story — four gentle steps."
        />
        <div className="relative mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <span className="absolute top-9 right-[12%] left-[12%] hidden h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent lg:block" aria-hidden="true" />
          {HOW_IT_WORKS.map((s, i) => (
            <Reveal key={s.step} delay={i * 0.12}>
              <div className="relative flex flex-col items-center gap-5 text-center">
                <span className="relative z-10 flex h-[72px] w-[72px] items-center justify-center rounded-full border border-gold/40 bg-ivory font-display text-2xl font-semibold text-burgundy shadow-[0_10px_30px_-14px_rgb(176_141_74/0.6)]">
                  {s.step}
                </span>
                <h3 className="font-display text-2xl font-semibold text-charcoal">{s.title}</h3>
                <p className="max-w-[240px] font-sans text-[14px] leading-relaxed font-light text-ink-soft/75">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
