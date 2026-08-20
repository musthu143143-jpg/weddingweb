"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Check, ChevronDown, Eye, Palette, Share2 } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";
import type { InvitationData, TemplateTheme, WeddingTemplate } from "@/lib/types";
import { CornerFlourish, Monogram, Ornament, PetalField } from "@/components/ui/core";
import { Countdown, EventCard, GiftNote, MapCard, MusicToggle, RsvpForm, themeVars } from "@/components/invitation/widgets";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function InvitationDemo({ template, data }: { template: WeddingTemplate; data: InvitationData }) {
  const t = template.theme;
  const sectionOn = (k: (typeof template.sections)[number]) => data.sections?.[k] !== false;
  const has = (k: string) => template.sections.includes(k as (typeof template.sections)[number]) && sectionOn(k as (typeof template.sections)[number]);
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${data.couple.groom} & ${data.couple.bride}`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      /* user dismissed share sheet */
    }
  }

  return (
    <div className="relative" style={{ ...themeVars(t), background: t.bg, color: t.ink }}>
      <div className="pointer-events-none fixed inset-0 z-0 bg-grain opacity-30" aria-hidden="true" />

      {/* ------------------------------- Hero ------------------------------- */}
      <header className="relative flex min-h-svh items-center justify-center overflow-hidden px-4 py-28">
        <div className="absolute inset-0" aria-hidden="true">
          <Image src={template.image} alt="" fill priority className="object-cover" />
          <div
            className="absolute inset-0"
            style={{
              background: t.dark
                ? `linear-gradient(to bottom, ${t.bg}D9 0%, ${t.bg}8C 40%, ${t.bg}F2 100%)`
                : `linear-gradient(to bottom, ${t.bg}B3 0%, ${t.bg}66 45%, ${t.bg}F5 100%)`,
            }}
          />
        </div>
        {(t.ornament === "royal" || t.ornament === "floral") && <PetalField count={10} />}

        <motion.div
          initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.2, ease }}
          className="relative w-full max-w-xl"
        >
          <div
            className="relative overflow-hidden rounded-[26px] border px-8 py-14 text-center shadow-lux sm:px-12"
            style={{ background: `${t.panel}F2`, borderColor: `${t.gold}70`, backdropFilter: "blur(6px)" }}
          >
            <span className="pointer-events-none absolute inset-3 rounded-[18px] border" style={{ borderColor: `${t.gold}45` }} aria-hidden="true" />
            {t.ornament === "royal" && (
              <>
                <CornerFlourish className="absolute left-2 top-2 h-14 w-14" style={{ color: t.gold }} />
                <CornerFlourish className="absolute right-2 top-2 h-14 w-14 -scale-x-100" style={{ color: t.gold }} />
                <CornerFlourish className="absolute bottom-2 left-2 h-14 w-14 -scale-y-100" style={{ color: t.gold }} />
                <CornerFlourish className="absolute bottom-2 right-2 h-14 w-14 -scale-100" style={{ color: t.gold }} />
              </>
            )}

            <p className="font-sans text-[11px] uppercase tracking-luxe" style={{ color: t.accent }}>
              {data.couple.familiesLine}
            </p>
            <Monogram text={data.couple.monogram} className="mx-auto mt-6 h-14 w-14 text-[15px]" style={{ color: t.gold, borderColor: `${t.gold}90` }} />

            {(data.photos?.groom || data.photos?.bride) && (
              <div className="mt-6 flex items-center justify-center gap-5">
                {data.photos.groom && <HeroPortrait src={data.photos.groom} name={data.couple.groom} theme={t} />}
                {data.photos.groom && data.photos.bride && (
                  <span className="font-display text-2xl italic" style={{ color: t.gold }}>&</span>
                )}
                {data.photos.bride && <HeroPortrait src={data.photos.bride} name={data.couple.bride} theme={t} />}
              </div>
            )}

            <h1 className="mt-7 leading-[0.95]">
              <span className="block font-script text-6xl sm:text-7xl" style={{ color: t.script }}>{data.couple.groom}</span>
              <span className="my-1 block font-display text-xl italic" style={{ color: t.gold }}>&</span>
              <span className="block font-script text-6xl sm:text-7xl" style={{ color: t.script }}>{data.couple.bride}</span>
            </h1>

            <Ornament style={t.ornament} className="mx-auto mt-7 h-5 w-44" />

            <p className="mx-auto mt-6 max-w-sm font-display text-lg italic leading-relaxed" style={{ color: t.ink, opacity: 0.85 }}>
              {data.couple.inviteLine}
            </p>
            <p className="mt-5 font-sans text-[13px] uppercase tracking-wide-2" style={{ color: t.ink }}>{data.dateLabel}</p>
            <p className="mt-2 font-sans text-[12px] uppercase tracking-wide-2" style={{ color: t.accent }}>
              {data.venue.name} · {data.venue.city}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          aria-hidden="true"
        >
          <ChevronDown className="h-5 w-5 animate-float-soft" style={{ color: t.gold }} strokeWidth={1.4} />
        </motion.div>
      </header>

      {/* ------------------------------ Sections ---------------------------- */}
      <main className="relative z-10 mx-auto max-w-5xl px-5 pb-40 sm:px-8">
        {has("story") && (
          <DemoSection eyebrow="Our Journey" title="Our Story" theme={t}>
            <div className="relative mt-4 space-y-14 lg:space-y-20">
              <span className="absolute top-0 bottom-0 left-5 hidden w-px lg:left-1/2 lg:block" style={{ background: `${t.gold}50` }} aria-hidden="true" />
              {data.story.map((s, i) => (
                <motion.div
                  key={s.year}
                  initial={{ opacity: 0, y: 34 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.9, ease }}
                  className={`relative grid gap-6 lg:grid-cols-2 lg:gap-16 ${i % 2 ? "lg:[&>*:first-child]:order-2" : ""}`}
                >
                  <div className={`flex flex-col gap-3 pl-14 lg:pl-0 ${i % 2 ? "lg:pl-16" : "lg:pr-16 lg:text-right"}`}>
                    <span className="font-display text-5xl font-semibold" style={{ color: t.gold }}>{s.year}</span>
                    <h3 className="font-script text-4xl" style={{ color: t.script }}>{s.title}</h3>
                    <p className="font-sans text-[15px] leading-relaxed font-light" style={{ opacity: 0.8 }}>{s.text}</p>
                  </div>
                  {s.image && (
                    <div className="relative ml-14 aspect-[4/3] overflow-hidden rounded-2xl border lg:ml-0" style={{ borderColor: `${t.gold}50` }}>
                      <Image src={s.image} alt={`${s.title} — ${data.couple.groom} and ${data.couple.bride}`} fill className="object-cover transition-transform duration-1000 hover:scale-105" />
                    </div>
                  )}
                  <span className="absolute top-2 left-5 hidden h-3 w-3 -translate-x-1/2 rounded-full lg:left-1/2 lg:block" style={{ background: t.gold }} aria-hidden="true" />
                </motion.div>
              ))}
            </div>
          </DemoSection>
        )}

        {has("events") && (
          <DemoSection eyebrow="Celebrations" title="Wedding Events" theme={t}>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data.events.map((e) => (
                <EventCard key={e.name} event={e} theme={t} />
              ))}
            </div>
          </DemoSection>
        )}

        {has("gallery") && (
          <DemoSection eyebrow="Memories" title="Photo Gallery" theme={t}>
            <div className="columns-2 gap-4 md:columns-3 [&>*]:mb-4">
              {data.gallery.map((src, i) => (
                <motion.div
                  key={src}
                  initial={{ opacity: 0, y: 26 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.7, delay: (i % 3) * 0.08, ease }}
                  className="relative overflow-hidden rounded-2xl border break-inside-avoid"
                  style={{ borderColor: `${t.gold}40` }}
                >
                  <div className={i % 3 === 0 ? "aspect-[3/4]" : i % 3 === 1 ? "aspect-square" : "aspect-[4/5]"}>
                    <Image src={src} alt={`A treasured memory of ${data.couple.groom} and ${data.couple.bride}`} fill className="object-cover transition-transform duration-1000 hover:scale-105" />
                  </div>
                </motion.div>
              ))}
            </div>
          </DemoSection>
        )}

        {has("venue") && (
          <DemoSection eyebrow="The Venue" title="Where to Find Us" theme={t}>
            <MapCard name={data.venue.name} city={data.venue.city} address={data.venue.address} mapUrl={data.venue.mapUrl} theme={t} />
          </DemoSection>
        )}

        {has("countdown") && (
          <DemoSection eyebrow="Save the Date" title="Counting the Moments" theme={t}>
            <Countdown targetISO={data.dateISO} theme={t} />
          </DemoSection>
        )}

        {has("rsvp") && (
          <DemoSection eyebrow="Kindly Respond" title="RSVP" theme={t}>
            <RsvpForm theme={t} />
          </DemoSection>
        )}

        {has("family") && (
          <DemoSection eyebrow="With Love From" title="Our Families" theme={t}>
            <div className="grid gap-6 sm:grid-cols-2">
              {[
                { label: `The ${data.couple.groom} Family`, list: data.family.him },
                { label: `The ${data.couple.bride} Family`, list: data.family.her },
              ].map((f) => (
                <div key={f.label} className="rounded-2xl border p-8 text-center" style={{ borderColor: `${t.gold}40`, background: `${t.panel}CC` }}>
                  <h3 className="font-display text-2xl font-semibold" style={{ color: t.script }}>{f.label}</h3>
                  <Ornament style={t.ornament} className="mx-auto my-4 h-3.5 w-28" />
                  <ul className="space-y-2.5">
                    {f.list.map((m) => (
                      <li key={m} className="font-sans text-[14px] font-light" style={{ opacity: 0.85 }}>{m}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </DemoSection>
        )}

        {has("travel") && (
          <DemoSection eyebrow="Plan Your Journey" title="Travel & Stay" theme={t}>
            <p className="mx-auto max-w-2xl text-center font-sans text-[15px] leading-relaxed font-light" style={{ opacity: 0.85 }}>{data.travel}</p>
          </DemoSection>
        )}

        {has("gifts") && (
          <DemoSection eyebrow="Blessings" title="Gift Information" theme={t}>
            <div className="mx-auto max-w-2xl">
              <GiftNote text={data.gifts} theme={t} />
            </div>
          </DemoSection>
        )}

        {/* Final message */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease }}
          className="mt-28 flex flex-col items-center gap-5 text-center"
        >
          <Ornament style={t.ornament} className="h-5 w-44" />
          <p className="font-script text-5xl sm:text-6xl" style={{ color: t.script }}>{data.finalMessage}</p>
          <p className="font-display text-2xl italic" style={{ color: t.gold }}>
            {data.couple.groom} & {data.couple.bride}
          </p>
          <Monogram text={data.couple.monogram} className="mt-2 h-14 w-14 text-[15px]" style={{ color: t.gold, borderColor: `${t.gold}80` }} />
        </motion.section>
      </main>

      {/* --------------------------- Floating controls ---------------------- */}
      <div className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2">
        <div
          className="flex items-center gap-1 rounded-full border p-1.5 shadow-lux backdrop-blur-xl"
          style={{ background: `${t.panel}E6`, borderColor: `${t.gold}60`, color: t.ink }}
        >
          <ControlLink href="/templates" label="Back to Templates" icon={<ArrowLeft className="h-4 w-4" strokeWidth={1.7} />} />
          <ControlButton onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} label="Preview" icon={<Eye className="h-4 w-4" strokeWidth={1.7} />} />
          <ControlButton onClick={share} label={copied ? "Link Copied" : "Share"} icon={copied ? <Check className="h-4 w-4" strokeWidth={1.7} /> : <Share2 className="h-4 w-4" strokeWidth={1.7} />} />
          <ControlLink href={`/customize/${template.slug}`} label="Customize" icon={<Palette className="h-4 w-4" strokeWidth={1.7} />} primary={t} />
        </div>
      </div>

      {has("music") && (
        <div className="fixed bottom-6 left-5 z-40 sm:left-8">
          <MusicToggle theme={t} title={`${data.music.title} — ${data.music.artist}`} src={data.music.url} />
        </div>
      )}
    </div>
  );
}

/* ------------------------------ Section wrapper ---------------------------- */

function DemoSection({
  eyebrow,
  title,
  theme: t,
  children,
}: {
  eyebrow: string;
  title: string;
  theme: WeddingTemplate["theme"];
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.section
      initial={{ opacity: 0, y: reduce ? 0 : 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-90px" }}
      transition={{ duration: 1, ease }}
      className="mt-28 first:mt-24"
    >
      <div className="mb-12 flex flex-col items-center gap-4 text-center">
        <span className="font-sans text-[11px] uppercase tracking-luxe" style={{ color: t.gold }}>{eyebrow}</span>
        <h2 className="font-display text-4xl font-medium sm:text-5xl" style={{ color: t.ink }}>{title}</h2>
        <Ornament style={t.ornament} className="h-4 w-36" />
      </div>
      <AnimatePresence>{children}</AnimatePresence>
    </motion.section>
  );
}

function ControlLink({ href, label, icon, primary }: { href: string; label: string; icon: ReactNode; primary?: WeddingTemplate["theme"] }) {
  if (primary) {
    return (
      <Link href={href} className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-sans text-[11px] uppercase tracking-wide-2 transition-opacity hover:opacity-90" style={{ background: primary.gold, color: primary.dark ? primary.bg : "#fff" }}>
        {icon}<span className="hidden sm:inline">{label}</span>
      </Link>
    );
  }
  return (
    <Link href={href} className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 font-sans text-[11px] uppercase tracking-wide-2 opacity-80 transition-opacity hover:opacity-100">
      {icon}<span className="hidden sm:inline">{label}</span>
    </Link>
  );
}

function ControlButton({ onClick, label, icon }: { onClick: () => void; label: string; icon: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 font-sans text-[11px] uppercase tracking-wide-2 opacity-80 transition-opacity hover:opacity-100">
      {icon}<span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function HeroPortrait({ src, name, theme }: { src: string; name: string; theme: TemplateTheme }) {
  return (
    <figure className="flex flex-col items-center gap-2">
      <span className="block h-24 w-24 overflow-hidden rounded-full border-2 shadow-lg sm:h-28 sm:w-28" style={{ borderColor: theme.gold }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={`${name}'s portrait`} className="h-full w-full object-cover" />
      </span>
      <figcaption className="font-sans text-[10px] uppercase tracking-wide-2" style={{ color: theme.accent }}>{name}</figcaption>
    </figure>
  );
}
