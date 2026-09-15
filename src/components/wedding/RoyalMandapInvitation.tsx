"use client";

import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUp, CalendarDays, MapPin, Music2, Share2, Users } from "lucide-react";
import { useRef, useState } from "react";
import type { InvitationData, SectionKey, TemplateTheme, WeddingTemplate } from "@/lib/types";
import { Countdown, MusicToggle, RsvpForm, themeVars } from "@/components/invitation/widgets";
import Preloader from "@/components/wedding/Preloader";
import WaterBridge from "@/components/wedding/WaterBridge";
import { CornerFlourish, Monogram, Ornament } from "@/components/ui/core";

export default function RoyalMandapInvitation({ template, data, publicView = false, invitationId }: { template: WeddingTemplate; data: InvitationData; publicView?: boolean; invitationId?: string }) {
  const t = template.theme;
  const reduce = useReducedMotion();
  const [loaded, setLoaded] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const sections = (key: SectionKey) => template.sections.includes(key) && data.sections?.[key] !== false;

  async function share() {
    try {
      if (navigator.share) await navigator.share({ title: `${data.couple.groom} & ${data.couple.bride}`, url: window.location.href });
      else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      }
    } catch { /* guest dismissed share */ }
  }

  return (
    <div className="relative overflow-x-clip" style={{ ...themeVars(t), background: t.bg, color: t.ink }}>
      {!loaded && <Preloader data={data} theme={t} onComplete={() => setLoaded(true)} />}
      <div className="pointer-events-none fixed inset-0 z-0 bg-grain opacity-25" aria-hidden="true" />
      <header id="home" className="relative z-10">
        <RoyalHero data={data} theme={t} reduce={reduce} />
      </header>
      <WaterBridge theme={t} />

      <main className="relative z-10">
        <InvitationSection data={data} theme={t} />
        {sections("events") && <EventsSection data={data} theme={t} reduce={reduce} />}
        {sections("story") && <StorySection data={data} theme={t} reduce={reduce} />}
        {sections("gallery") && <GallerySection data={data} theme={t} onOpen={setLightbox} />}
        <ThingsToKnow data={data} />
        {sections("rsvp") && <RsvpSection data={data} theme={t} invitationId={invitationId} />}
      </main>

      <footer className="relative z-10 border-t border-[#C8960A44] bg-[#16071f] px-5 py-16 text-center text-[#F8F2E4] sm:px-8">
        <Ornament style="royal" className="mx-auto h-4 w-40 text-[#C8960A]" />
        <p className="mt-6 font-script text-4xl text-[#E8D39A]">With love,</p>
        <p className="mt-2 font-display text-2xl">{data.couple.groom} & {data.couple.bride}</p>
        <p className="mt-4 font-sans text-[10px] uppercase tracking-[0.24em] text-[#F8F2E499]">{data.gifts || "Made for a lifetime of memories"}</p>
      </footer>

      {!publicView && (
        <div className="fixed right-4 bottom-4 z-50 rounded-full border border-[#C8960A66] bg-[#16071fcc] text-[#F8F2E4] shadow-xl backdrop-blur-md">
          <button type="button" onClick={share} aria-label={copied ? "Link copied" : "Share invitation"} className="inline-flex items-center gap-2 rounded-full px-4 py-3 font-sans text-[10px] uppercase tracking-wide-2">
            <Share2 className="h-4 w-4" /> <span className="hidden sm:inline">{copied ? "Copied" : "Share"}</span>
          </button>
        </div>
      )}
      {publicView && (
        <div className="fixed right-4 bottom-4 z-50 rounded-full border border-[#C8960A66] bg-[#16071fcc] text-[#F8F2E4] shadow-xl backdrop-blur-md">
          <button type="button" onClick={share} aria-label={copied ? "Link copied" : "Share invitation"} className="inline-flex items-center gap-2 rounded-full px-4 py-3 font-sans text-[10px] uppercase tracking-wide-2">
            <Share2 className="h-4 w-4" /> <span className="hidden sm:inline">{copied ? "Copied" : "Share"}</span>
          </button>
        </div>
      )}
      {data.music.url && <div className="fixed bottom-20 left-4 z-50 sm:bottom-6 sm:left-8"><MusicToggle theme={t} title={`${data.music.title} — ${data.music.artist}`} src={data.music.url} /></div>}

      <AnimatePresence>
        {lightbox !== null && data.gallery[lightbox] && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-[#120719ee] p-4" role="dialog" aria-modal="true" aria-label="Gallery image" onClick={() => setLightbox(null)}>
            <button type="button" className="absolute top-5 right-5 rounded-full border border-[#E8D39A66] px-4 py-2 font-sans text-[10px] uppercase tracking-wide-2 text-[#F8F2E4]" onClick={() => setLightbox(null)}>Close</button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={data.gallery[lightbox]} alt={`${data.couple.groom} and ${data.couple.bride}`} className="max-h-[88vh] max-w-full rounded-xl object-contain shadow-2xl" onClick={(event) => event.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RoyalHero({ data, theme: t, reduce }: { data: InvitationData; theme: TemplateTheme; reduce: boolean | null }) {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const artScale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
  const artY = useTransform(scrollYProgress, [0, 1], [0, 70]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -42]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.72], [1, 0]);

  return (
    <section ref={heroRef} className="relative flex min-h-svh items-center justify-center overflow-hidden px-5 py-24 sm:px-8">
      <motion.div className="absolute inset-0 origin-center will-change-transform" style={{ scale: reduce ? 1 : artScale, y: reduce ? 0 : artY }}>
        <TanjoreHeroBackdrop theme={t} />
      </motion.div>
      <motion.div style={{ y: reduce ? 0 : copyY, opacity: reduce ? 1 : copyOpacity }} initial={{ opacity: 0, y: 36, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: reduce ? 0.25 : 1.1, ease: [0.22, 1, 0.36, 1] }} className="relative w-full max-w-2xl rounded-[28px] border border-[#C8960A88] bg-[#FFF7E8F0] px-6 py-12 text-center shadow-2xl backdrop-blur-md sm:px-14 sm:py-16">
        <span className="pointer-events-none absolute inset-3 rounded-[21px] border border-[#C8960A55]" />
        <CornerFlourish className="absolute left-2 top-2 h-16 w-16 text-[#C8960A]" />
        <CornerFlourish className="absolute right-2 top-2 h-16 w-16 -scale-x-100 text-[#C8960A]" />
        <CornerFlourish className="absolute bottom-2 left-2 h-16 w-16 -scale-y-100 text-[#A33A24]" />
        <CornerFlourish className="absolute right-2 bottom-2 h-16 w-16 -scale-100 text-[#A33A24]" />
        <p className="relative font-sans text-[10px] uppercase tracking-[0.28em] text-[#A33A24]">With the blessings of our families</p>
        <Monogram text={data.couple.monogram} className="relative mx-auto mt-6 h-16 w-16 text-[15px]" style={{ color: t.gold, borderColor: `${t.gold}bb` }} />
        <h1 className="relative mt-6 leading-[0.86]">
          <span className="block font-script text-[clamp(3.7rem,13vw,7rem)] text-[#7A1E26]">{data.couple.groom}</span>
          <span className="my-3 block font-display text-xl italic text-[#C8960A]">weds</span>
          <span className="block font-script text-[clamp(3.7rem,13vw,7rem)] text-[#7A1E26]">{data.couple.bride}</span>
        </h1>
        <Ornament style="royal" className="relative mx-auto mt-8 h-5 w-48 text-[#C8960A]" />
        <p className="relative mt-5 font-sans text-[11px] uppercase tracking-[0.22em] text-[#3A160C]">{data.dateLabel}</p>
        <p className="relative mt-2 font-sans text-[10px] uppercase tracking-[0.18em] text-[#A33A24]">{data.venue.name} · {data.venue.city}</p>
        <Countdown targetISO={data.dateISO} theme={{ ...t, gold: "#A33A24", ink: "#3A160C", accent: "#A33A24", panel: "#FFF7E8" }} />
        <a href="#invitation" className="relative mt-8 inline-flex items-center gap-2 font-sans text-[10px] uppercase tracking-[0.26em] text-[#A33A24]">Scroll <ArrowUp className="h-3.5 w-3.5 rotate-180" /></a>
      </motion.div>
    </section>
  );
}

function InvitationSection({ data, theme: t }: { data: InvitationData; theme: TemplateTheme }) {
  return (
    <section id="invitation" className="relative overflow-hidden bg-[#F8F2E4] px-5 py-24 text-center sm:px-8">
      <div className="mx-auto max-w-3xl rounded-[28px] border border-[#C8960A66] bg-[#FFF8E8] px-6 py-14 shadow-xl sm:px-16">
        <TanjoreKolam theme={t} />
        <p className="mt-8 font-sans text-[11px] uppercase tracking-[0.28em] text-[#A33A24]">Together with the love of our families</p>
        <h2 className="mt-6 font-script text-5xl text-[#7A1E26] sm:text-7xl">{data.couple.groom} & {data.couple.bride}</h2>
        <p className="mx-auto mt-6 max-w-xl font-display text-xl italic leading-relaxed text-[#3A160C]/80">{data.couple.inviteLine}</p>
        <div className="mx-auto mt-8 grid max-w-xl gap-6 border-y border-[#C8960A55] py-7 sm:grid-cols-2">
          <div><p className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#A33A24]">Daughter of</p><p className="mt-2 font-display text-lg">{data.family.her.join(" · ") || "Our beloved family"}</p></div>
          <div><p className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#A33A24]">Son of</p><p className="mt-2 font-display text-lg">{data.family.him.join(" · ") || "Our beloved family"}</p></div>
        </div>
        <TanjoreKolam theme={t} reverse />
      </div>
    </section>
  );
}

function EventsSection({ data, theme: t, reduce }: { data: InvitationData; theme: TemplateTheme; reduce: boolean | null }) {
  return (
    <section id="events" className="relative overflow-hidden bg-[#F8F2E4] px-5 py-24 sm:px-8">
      <SectionIntro eyebrow="The Celebrations" title="Our Events" theme={t} />
      <div className="relative mx-auto grid max-w-5xl gap-5 md:grid-cols-2">
        <span className="pointer-events-none absolute top-0 bottom-0 left-1/2 hidden w-px bg-[#C8960A55] md:block" />
        {data.events.map((event, index) => (
          <motion.article key={`${event.name}-${index}`} initial={{ opacity: 0, y: reduce ? 0 : 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-70px" }} transition={{ duration: 0.75, delay: index * 0.04 }} className={`relative rounded-[22px] border border-[#C8960A66] bg-[#FFF8E8] p-6 shadow-lg ${index % 2 ? "md:translate-y-12" : ""}`}>
            <div className="flex items-start justify-between gap-3"><div><p className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#A33A24]">{event.date} · {event.time}</p><h3 className="mt-2 font-script text-4xl text-[#7A1E26]">{event.name}</h3></div><span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#C8960A88] text-[#A33A24]"><CalendarDays className="h-5 w-5" /></span></div>
            <p className="mt-4 font-display text-lg text-[#3A160C]">{event.venue}</p>
            <p className="mt-2 font-sans text-[13px] leading-relaxed text-[#3A160C]/70">{event.description}</p>
            {event.mapUrl && <a href={event.mapUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#C8960A88] px-4 py-2 font-sans text-[10px] uppercase tracking-wide-2 text-[#A33A24]"><MapPin className="h-3.5 w-3.5" /> Open in Google Maps</a>}
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function StorySection({ data, theme: t, reduce }: { data: InvitationData; theme: TemplateTheme; reduce: boolean | null }) {
  return (
    <section id="story" className="relative overflow-hidden bg-[#16071f] px-5 py-24 text-[#F8F2E4] sm:px-8">
      <SectionIntro eyebrow="Our Journey" title="Our Story" theme={t} dark />
      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
        {data.story.map((moment, index) => (
          <motion.article key={`${moment.year}-${index}`} initial={{ opacity: 0, y: reduce ? 0 : 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} className="overflow-hidden rounded-[22px] border border-[#C8960A55] bg-[#241036]">
            {moment.image && <div className="aspect-[4/3] overflow-hidden"><img src={moment.image} alt={moment.title} className="h-full w-full object-cover transition-transform duration-700 hover:scale-105" /></div>}
            <div className="p-6"><p className="font-display text-4xl text-[#C8960A]">{moment.year}</p><h3 className="mt-2 font-script text-3xl text-[#E8D39A]">{moment.title}</h3><p className="mt-3 font-sans text-[14px] leading-relaxed text-[#F8F2E4bb]">{moment.text}</p></div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function GallerySection({ data, theme: t, onOpen }: { data: InvitationData; theme: TemplateTheme; onOpen: (index: number) => void }) {
  return (
    <section id="gallery" className="relative bg-[#F8F2E4] px-5 py-24 sm:px-8">
      <SectionIntro eyebrow="Moments" title="Our Gallery" theme={t} />
      <div className="mx-auto columns-2 max-w-5xl gap-4 md:columns-3 [&>*]:mb-4">
        {data.gallery.map((src, index) => <button key={`${src}-${index}`} type="button" onClick={() => onOpen(index)} className="group relative block w-full overflow-hidden rounded-2xl border border-[#C8960A66] text-left"><img src={src} alt="Wedding memory" className="w-full object-cover transition duration-700 group-hover:scale-105" /><span className="absolute inset-0 bg-[#16071f]/0 transition group-hover:bg-[#16071f]/20" /></button>)}
      </div>
    </section>
  );
}

function ThingsToKnow({ data }: { data: InvitationData }) {
  const items = [
    { label: "Venue", value: `${data.venue.name} · ${data.venue.city}`, icon: MapPin },
    { label: "Travel & Stay", value: data.travel || "Details will be shared with your invitation.", icon: Users },
    { label: "Blessings", value: data.gifts || "Your presence is our greatest gift.", icon: Music2 },
  ];
  return <section id="know" className="bg-[#F8F2E4] px-5 pb-24 sm:px-8"><SectionIntro eyebrow="Good To Know" title="Things to Know" theme={{ bg: "#F8F2E4", panel: "#FFF8E8", ink: "#3A160C", accent: "#A33A24", gold: "#C8960A", script: "#7A1E26", ornament: "royal" }} /><div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-3">{items.map(({ label, value, icon: Icon }) => <article key={label} className="rounded-[22px] border border-[#C8960A66] bg-[#FFF8E8] p-6 text-center shadow-lg"><Icon className="mx-auto h-6 w-6 text-[#A33A24]" /><p className="mt-4 font-sans text-[10px] uppercase tracking-[0.2em] text-[#A33A24]">{label}</p><p className="mt-3 font-display text-[16px] leading-relaxed text-[#3A160C]/80">{value}</p></article>)}</div></section>;
}

function RsvpSection({ data, theme: t, invitationId }: { data: InvitationData; theme: TemplateTheme; invitationId?: string }) {
  return <section id="rsvp" className="bg-[#16071f] px-5 py-24 text-[#F8F2E4] sm:px-8"><SectionIntro eyebrow="Join the Celebration" title={data.rsvp?.prompt || "Will you join us?"} theme={t} dark /><p className="mx-auto mb-8 max-w-xl text-center font-sans text-[14px] leading-relaxed text-[#F8F2E4bb]">{data.rsvp?.note || "We've saved a seat for you — at our table and in our hearts."}</p><RsvpForm theme={t} content={data.rsvp} invitationId={invitationId} /></section>;
}

function SectionIntro({ eyebrow, title, theme: t, dark = false }: { eyebrow: string; title: string; theme: TemplateTheme; dark?: boolean }) {
  return <div className="mx-auto mb-12 max-w-3xl text-center"><p className={`font-sans text-[10px] uppercase tracking-[0.28em] ${dark ? "text-[#E8D39A]" : "text-[#A33A24]"}`}>{eyebrow}</p><h2 className={`mt-4 font-display text-4xl font-medium sm:text-6xl ${dark ? "text-[#F8F2E4]" : "text-[#3A160C]"}`}>{title}</h2><Ornament style="royal" className={`mx-auto mt-5 h-4 w-40 ${dark ? "text-[#C8960A]" : "text-[#C8960A]"}`} /></div>;
}

function TanjoreKolam({ theme: t, reverse = false }: { theme: TemplateTheme; reverse?: boolean }) {
  return (
    <svg viewBox="0 0 220 34" className={`mx-auto h-6 w-44 ${reverse ? "rotate-180" : ""}`} fill="none" aria-hidden="true">
      <path d="M2 17h36m144 0h36M48 17c8-12 18-12 28 0-10 12-20 12-28 0Zm124 0c-8-12-18-12-28 0 10 12 20 12 28 0Z" stroke={t.gold} strokeWidth="1.4" />
      <path d="M95 17c5-8 10-8 15 0-5 8-10 8-15 0Z" fill={t.accent} fillOpacity="0.4" stroke={t.gold} />
      <circle cx="110" cy="17" r="3" fill={t.gold} />
      <path d="M74 8c5-6 10-6 15 0M146 8c-5-6-10-6-15 0" stroke={t.accent} strokeWidth="1" />
    </svg>
  );
}

function TanjoreHeroBackdrop({ theme }: { theme: TemplateTheme }) {  const lights = Array.from({ length: 18 }, (_, i) => ({
    left: 8 + ((i * 37) % 84),
    top: 10 + ((i * 23) % 72),
    delay: (i % 6) * 0.2,
  }));
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        background: "radial-gradient(circle at 50% 38%, #F0C86A35 0%, transparent 24%), radial-gradient(circle at 18% 75%, #A33A2430 0%, transparent 30%), linear-gradient(145deg, #2A0B0F, #4A1115 48%, #170609)",
      }}
    >
      <div className="absolute inset-0 bg-grain opacity-60" />
      <div className="pointer-events-none absolute inset-x-0 top-[-8%] flex justify-center opacity-90" aria-hidden="true">
        <svg viewBox="0 0 800 560" className="h-[72%] w-[min(100%,900px)]" fill="none">
          <path d="M74 548V236C74 104 222 30 400 30s326 74 326 206v312" stroke="#D5A64A" strokeWidth="8" strokeOpacity="0.8" />
          <path d="M106 548V250C106 140 236 76 400 76s294 64 294 174v298" stroke="#F0D28A" strokeWidth="2" strokeOpacity="0.75" />
          <path d="M150 548V268c0-84 108-138 250-138s250 54 250 138v280" stroke="#A33A24" strokeWidth="18" strokeOpacity="0.35" />
          <path d="M215 548V294c0-56 80-104 185-104s185 48 185 104v254" stroke="#D5A64A" strokeWidth="4" strokeOpacity="0.75" />
          <path d="M294 548V330c0-30 46-62 106-62s106 32 106 62v218" stroke="#F0D28A" strokeWidth="3" strokeOpacity="0.85" />
          <path d="M400 208v56M370 236h60M376 220l24-24 24 24" stroke="#D5A64A" strokeWidth="5" strokeLinecap="round" />
          <path d="M170 380c36-38 62-48 96-58M630 380c-36-38-62-48-96-58" stroke="#D5A64A" strokeWidth="5" strokeLinecap="round" />
          <path d="M44 548h712" stroke="#F0D28A" strokeWidth="8" strokeOpacity="0.7" />
        </svg>
      </div>
      <div className="pointer-events-none absolute inset-x-[12%] top-[14%] flex justify-between" aria-hidden="true">
        {Array.from({ length: 9 }, (_, i) => <span key={i} className="h-3 w-3 rounded-full shadow-[0_0_16px_#F0D28A]" style={{ background: i % 2 ? "#A33A24" : "#F0D28A" }} />)}
      </div>
      {lights.map((light, i) => (
        <span key={i} className="pointer-events-none absolute h-1.5 w-1.5 animate-shimmer rounded-full bg-[#F7E6AF] shadow-[0_0_14px_#F7E6AF]" style={{ left: `${light.left}%`, top: `${light.top}%`, animationDelay: `${light.delay}s`, animationDuration: "3.8s" }} />
      ))}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#120505cc] to-transparent" aria-hidden="true" />
      <div className="pointer-events-none absolute bottom-[10%] left-[12%] h-10 w-16 rounded-full bg-[#F0D28A55] blur-xl" />
      <div className="pointer-events-none absolute right-[12%] bottom-[10%] h-10 w-16 rounded-full bg-[#F0D28A55] blur-xl" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-center gap-[20%] pb-7" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span key={i} className="relative h-3 w-11 rounded-full border" style={{ background: `linear-gradient(180deg, #F7E6AF, ${theme.gold})`, borderColor: `${theme.gold}dd` }}>
            <span className="absolute -top-6 left-1/2 h-5 w-2 -translate-x-1/2 rounded-full bg-[#FFF1AD] shadow-[0_0_22px_#FFF1AD]" />
          </span>
        ))}
      </div>
    </div>
  );
}
