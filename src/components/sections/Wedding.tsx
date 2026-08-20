"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { DEMO_INVITATION } from "@/data/content";
import { getTemplate } from "@/data/templates";
import { Reveal, SectionHeading } from "@/components/ui/core";
import { EventCard, MapCard, RsvpForm } from "@/components/invitation/widgets";

const theme = getTemplate("mehfil")!.theme;

/* --------------------------- Love story timeline --------------------------- */

export function StoryDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  return (
    <section ref={ref} className="relative overflow-hidden bg-charcoal py-28 text-ivory">
      <div className="pointer-events-none absolute inset-0 bg-grain opacity-40" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          dark
          eyebrow="A Life Together"
          title={<>Every love story <span className="font-script text-gold-gradient">deserves to be told.</span></>}
          sub="This is how your invitation can carry your journey — from the first hello to forever."
        />
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {DEMO_INVITATION.story.map((s, i) => (
            <StoryCard key={s.year} moment={s} index={i} progress={scrollYProgress} reduce={reduce} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StoryCard({
  moment: s,
  index: i,
  progress,
  reduce,
}: {
  moment: (typeof DEMO_INVITATION.story)[number];
  index: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  reduce: boolean | null;
}) {
  const y = useTransform(progress, [0, 1], reduce ? [0, 0] : [i % 2 ? 26 : -10, i % 2 ? -26 : 10]);
  return (
    <Reveal delay={i * 0.12}>
      <motion.article className="group relative overflow-hidden rounded-[20px] border border-ivory/10 bg-ivory/[0.03]" style={{ y }}>
        <div className="relative aspect-[4/5] overflow-hidden">
          {s.image && <Image src={s.image} alt={`${s.title}, ${s.year}`} fill className="object-cover opacity-80 transition-all duration-1000 group-hover:scale-105 group-hover:opacity-100" />}
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/30 to-transparent" />
          <span className="absolute top-5 left-5 font-display text-4xl font-semibold text-gold-soft">{s.year}</span>
        </div>
        <div className="relative -mt-14 p-6">
          <h3 className="font-script text-3xl text-ivory">{s.title}</h3>
          <p className="mt-2 font-sans text-[13px] leading-relaxed font-light text-ivory/65">{s.text}</p>
        </div>
      </motion.article>
    </Reveal>
  );
}

/* ------------------------------ Events + map ------------------------------- */

export function EventsDemo() {
  return (
    <section className="bg-ivory py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="The Celebrations"
          title="Every moment, beautifully organised."
          sub="Mehndi to reception — your guests see dates, venues, dress codes and directions at a glance."
        />
        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {DEMO_INVITATION.events.map((e, i) => (
            <Reveal key={e.name} delay={i * 0.1}>
              <EventCard event={e} theme={theme} />
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2} className="mt-10">
          <MapCard name={DEMO_INVITATION.venue.name} city={DEMO_INVITATION.venue.city} address={DEMO_INVITATION.venue.address} mapUrl={DEMO_INVITATION.venue.mapUrl} theme={theme} />
        </Reveal>
      </div>
    </section>
  );
}

/* -------------------------------- RSVP demo -------------------------------- */

export function RsvpDemo() {
  return (
    <section className="relative overflow-hidden bg-cream py-28">
      <div className="pointer-events-none absolute inset-0 bg-paper" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Kindly Respond"
          title={<>A RSVP that feels <span className="font-script text-burgundy">like a blessing.</span></>}
          sub="Guests respond in seconds — you see every answer, every message, every seat."
        />
        <div className="mt-14">
          <RsvpForm theme={theme} />
        </div>
      </div>
    </section>
  );
}
