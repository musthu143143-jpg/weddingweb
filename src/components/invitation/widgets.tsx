"use client";

import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { CalendarDays, Check, Clock, ExternalLink, Gift, Heart, MapPin, Minus, Music2, Navigation, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { TemplateTheme, WeddingEvent } from "@/lib/types";
import { Ornament } from "@/components/ui/core";
import { submitRsvpAction } from "@/app/i/rsvpActions";

export function themeVars(t: TemplateTheme): CSSProperties {
  return {
    "--t-bg": t.bg,
    "--t-panel": t.panel,
    "--t-ink": t.ink,
    "--t-accent": t.accent,
    "--t-gold": t.gold,
    "--t-script": t.script,
  } as CSSProperties;
}

/* -------------------------------- Countdown -------------------------------- */

function useCountdown(targetISO: string) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const initial = window.setTimeout(() => setNow(Date.now()), 0);
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(id);
    };
  }, []);
  if (now == null) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const diff = Math.max(0, new Date(targetISO).getTime() - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds };
}

export function Countdown({ targetISO, theme }: { targetISO: string; theme: TemplateTheme }) {
  const { days, hours, minutes, seconds } = useCountdown(targetISO);
  const cells = [
    { v: days, l: "Days" },
    { v: hours, l: "Hours" },
    { v: minutes, l: "Minutes" },
    { v: seconds, l: "Seconds" },
  ];
  return (
    <div className="flex flex-col items-center gap-4">
      <span className="font-sans text-[11px] uppercase tracking-luxe" style={{ color: theme.gold }}>
        Countdown to our big day
      </span>
      <div
        className="grid w-full max-w-lg grid-cols-4 gap-px overflow-hidden rounded-2xl border"
        style={{ borderColor: `${theme.gold}55`, background: `${theme.gold}30` }}
      >
        {cells.map((c) => (
          <div key={c.l} className="flex min-w-0 flex-col items-center gap-1 px-1.5 py-3 sm:px-4 sm:py-4" style={{ background: theme.panel }}>
            <span className="font-display text-2xl font-semibold tabular-nums sm:text-4xl" style={{ color: theme.ink }}>
              {String(c.v).padStart(2, "0")}
            </span>
            <span className="font-sans text-[8px] uppercase tracking-[0.12em] sm:text-[10px] sm:tracking-wide-2" style={{ color: theme.accent }}>
              {c.l}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------- Event card ------------------------------- */

export function EventCard({ event, theme }: { event: WeddingEvent; theme: TemplateTheme }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col gap-5 rounded-[20px] border p-7 text-left transition-shadow duration-500 hover:shadow-[var(--shadow-card)]"
      style={{ borderColor: `${theme.gold}40`, background: theme.panel, color: theme.ink }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-2xl font-semibold" style={{ color: theme.script }}>
            {event.name}
          </h3>
          {event.description && (
            <p className="mt-1.5 font-sans text-[13px] font-light leading-relaxed" style={{ color: `${theme.ink}B3` }}>
              {event.description}
            </p>
          )}
        </div>
        <span
          className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border"
          style={{ borderColor: `${theme.gold}66`, color: theme.gold }}
        >
          <CalendarDays className="h-4.5 w-4.5" strokeWidth={1.5} />
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-sans text-[13px]" style={{ color: theme.ink }}>
        <span className="inline-flex items-center gap-2">
          <CalendarDays className="h-4 w-4" style={{ color: theme.gold }} strokeWidth={1.6} /> {event.date}
        </span>
        <span className="inline-flex items-center gap-2">
          <Clock className="h-4 w-4" style={{ color: theme.gold }} strokeWidth={1.6} /> {event.time}
        </span>
      </div>

      <div className="font-sans text-[13px] leading-relaxed" style={{ color: theme.ink }}>
        <p className="font-medium" style={{ color: theme.script }}>{event.venue}</p>
        <p className="mt-0.5 font-light opacity-75">{event.address}</p>
        {event.dressCode && (
          <p className="mt-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] uppercase tracking-wide-2"
            style={{ borderColor: `${theme.gold}55`, color: theme.accent }}>
            <Heart className="h-3 w-3" strokeWidth={1.8} /> {event.dressCode}
          </p>
        )}
      </div>

      <div className="mt-auto flex flex-wrap gap-3 pt-1">
        <a
          href={event.mapUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border px-4 py-2 font-sans text-[11px] uppercase tracking-wide-2 transition-colors duration-300 hover:opacity-80"
          style={{ borderColor: `${theme.gold}70`, color: theme.ink }}
        >
          <MapPin className="h-3.5 w-3.5" style={{ color: theme.gold }} strokeWidth={1.8} /> View Location
        </a>
        <a
          href={event.mapUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 font-sans text-[11px] uppercase tracking-wide-2 text-white transition-opacity duration-300 hover:opacity-90"
          style={{ background: theme.gold, color: theme.dark ? theme.bg : "#fff" }}
        >
          <Navigation className="h-3.5 w-3.5" strokeWidth={1.8} /> Get Directions
        </a>
      </div>
    </motion.article>
  );
}

/* --------------------------------- Map card -------------------------------- */

export function MapCard({
  name,
  city,
  address,
  mapUrl,
  theme,
}: {
  name: string;
  city: string;
  address?: string;
  mapUrl: string;
  theme: TemplateTheme;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-[24px] border"
      style={{ borderColor: `${theme.gold}45`, background: theme.panel, color: theme.ink }}
    >
      {/* Stylised map surface — swap for a real embed when the backend arrives */}
      <div className="relative h-64 w-full" aria-hidden="true">
        <svg viewBox="0 0 600 300" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
          <rect width="600" height="300" fill={theme.dark ? theme.bg : theme.bg} />
          <g stroke={theme.gold} strokeOpacity="0.28" fill="none" strokeWidth="1">
            <path d="M-20 80C120 40 240 120 380 70s180-30 260 10" />
            <path d="M-20 150C140 110 260 190 420 140s160-20 220 20" />
            <path d="M-20 220C120 190 260 260 420 210s160-10 220 30" />
            <path d="M120 -20C150 80 90 180 140 320" />
            <path d="M320 -20C300 90 360 200 320 320" />
            <path d="M480 -20C500 100 450 210 500 320" />
          </g>
          <g stroke={theme.accent} strokeOpacity="0.18" fill="none">
            <circle cx="300" cy="150" r="60" />
            <circle cx="300" cy="150" r="100" />
            <circle cx="300" cy="150" r="140" />
          </g>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 180, damping: 14, delay: 0.2 }}
            className="relative flex h-14 w-14 items-center justify-center rounded-full"
            style={{ background: theme.gold }}
          >
            <span className="absolute inset-0 animate-ping rounded-full opacity-30" style={{ background: theme.gold }} />
            <MapPin className="h-6 w-6" style={{ color: theme.dark ? theme.bg : "#fff" }} strokeWidth={1.8} />
          </motion.span>
        </div>
      </div>
      <div className="flex flex-col gap-4 border-t p-6 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: `${theme.gold}30` }}>
        <div>
          <h3 className="font-display text-2xl font-semibold" style={{ color: theme.script }}>{name}</h3>
          <p className="mt-1 font-sans text-[13px] font-light opacity-75">{address ?? city}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a href={mapUrl} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 font-sans text-[11px] uppercase tracking-wide-2 hover:opacity-80"
            style={{ borderColor: `${theme.gold}70` }}>
            <ExternalLink className="h-3.5 w-3.5" style={{ color: theme.gold }} /> View on Google Maps
          </a>
          <a href={mapUrl} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 font-sans text-[11px] uppercase tracking-wide-2"
            style={{ background: theme.gold, color: theme.dark ? theme.bg : "#fff" }}>
            <Navigation className="h-3.5 w-3.5" /> Get Directions
          </a>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- RSVP form -------------------------------- */

export function RsvpForm({
  theme,
  content,
  invitationId,
}: {
  theme: TemplateTheme;
  content?: {
    prompt?: string;
    acceptLabel?: string;
    declineLabel?: string;
    note?: string;
  };
  /** Present only on a published invitation; demo RSVPs remain local-only. */
  invitationId?: string;
}) {
  const prompt = content?.prompt || "Will you celebrate with us?";
  const acceptLabel = content?.acceptLabel || "Joyfully Accept";
  const declineLabel = content?.declineLabel || "Regretfully Decline";
  const note = content?.note || "Demonstration preview — guest responses connect to your dashboard in the next release.";
  const [attending, setAttending] = useState<"yes" | "no" | null>(null);
  const [guests, setGuests] = useState(2);
  const [message, setMessage] = useState("");
  const [guestName, setGuestName] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const reduce = useReducedMotion();

  return (
    <div className="relative mx-auto w-full max-w-xl">
      <AnimatePresence mode="wait">
        {!sent ? (
          <motion.form
            key="form"
            exit={{ opacity: 0, y: -18, filter: reduce ? "none" : "blur(6px)" }}
            transition={{ duration: 0.5 }}
            onSubmit={async (e) => {
              e.preventDefault();
              if (!attending || submitting) return;
              setSubmitError(null);

              // Template demos intentionally keep RSVP interactions local. A
              // published invitation carries its database id so the response
              // can be shown in the couple's dashboard.
              if (!invitationId) {
                setSent(true);
                return;
              }

              setSubmitting(true);
              try {
                const result = await submitRsvpAction({
                  invitationId,
                  guestName,
                  attending: attending === "yes",
                  guests,
                  message,
                });
                if (result.ok) setSent(true);
                else setSubmitError(result.message);
              } catch {
                setSubmitError("We could not send your response. Please try again.");
              } finally {
                setSubmitting(false);
              }
            }}
            className="flex flex-col gap-6 rounded-[24px] border p-5 sm:p-8"
            style={{ borderColor: `${theme.gold}45`, background: theme.panel, color: theme.ink }}
          >
            <div className="text-center">
              <span className="font-sans text-[11px] uppercase tracking-luxe" style={{ color: theme.gold }}>RSVP</span>
              <h3 className="mt-2 font-display text-3xl font-semibold" style={{ color: theme.script }}>
                {prompt}
              </h3>
              <Ornament style={theme.ornament} className="mx-auto mt-4 h-4 w-36" />
            </div>

            <label className="flex flex-col gap-2">
              <span className="font-sans text-[12px] uppercase tracking-wide-2 opacity-80">Your name <span className="normal-case tracking-normal opacity-60">(optional)</span></span>
              <input
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                maxLength={120}
                placeholder="Your name"
                className="w-full rounded-xl border bg-transparent px-4 py-3 font-sans text-[14px] font-light outline-none transition-colors placeholder:opacity-40 focus:border-[color:var(--t-gold)]"
                style={{ borderColor: `${theme.gold}45`, color: theme.ink }}
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Attendance">
              {[
                { id: "yes", label: acceptLabel },
                { id: "no", label: declineLabel },
              ].map((o) => (
                <button
                  key={o.id}
                  type="button"
                  role="radio"
                  aria-checked={attending === o.id}
                  onClick={() => setAttending(o.id as "yes" | "no")}
                  className="rounded-xl border px-4 py-3.5 font-sans text-[13px] tracking-wide-2 uppercase transition-all duration-300"
                  style={{
                    borderColor: attending === o.id ? theme.gold : `${theme.gold}45`,
                    background: attending === o.id ? `${theme.gold}22` : "transparent",
                    color: theme.ink,
                  }}
                >
                  {o.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col items-start gap-3 rounded-xl border px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5" style={{ borderColor: `${theme.gold}45` }}>
              <span className="font-sans text-[11px] uppercase tracking-wide-2 opacity-80 sm:text-[12px]">Number of Guests</span>
              <div className="flex items-center gap-4 self-end sm:self-auto">
                <button type="button" aria-label="Decrease guests" onClick={() => setGuests((g) => Math.max(1, g - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-full border transition-colors hover:opacity-70"
                  style={{ borderColor: `${theme.gold}70` }}>
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-6 text-center font-display text-2xl font-semibold tabular-nums">{guests}</span>
                <button type="button" aria-label="Increase guests" onClick={() => setGuests((g) => Math.min(10, g + 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-full border transition-colors hover:opacity-70"
                  style={{ borderColor: `${theme.gold}70` }}>
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <label className="flex flex-col gap-2">
              <span className="font-sans text-[12px] uppercase tracking-wide-2 opacity-80">Message for the couple</span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={2000}
                rows={3}
                placeholder="Write a blessing or a note…"
                className="w-full resize-none rounded-xl border bg-transparent px-4 py-3 font-sans text-[14px] font-light outline-none transition-colors placeholder:opacity-40 focus:border-[color:var(--t-gold)]"
                style={{ borderColor: `${theme.gold}45`, color: theme.ink }}
              />
            </label>

            {submitError && (
              <p role="alert" className="rounded-xl border border-maroon/30 bg-maroon/5 px-4 py-3 text-center font-sans text-[12px] leading-relaxed text-maroon">
                {submitError}
              </p>
            )}
            <button
              type="submit"
              disabled={!attending || submitting}
              className="rounded-full py-4 font-sans text-[12px] uppercase tracking-luxe transition-all duration-500 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
              style={{ background: theme.gold, color: theme.dark ? theme.bg : "#fff" }}
            >
              {submitting ? "Sending…" : "Confirm RSVP"}
            </button>
            <p className="text-center font-sans text-[11px] font-light opacity-55">
              {note}
            </p>
          </motion.form>
        ) : (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-5 rounded-[24px] border px-8 py-14 text-center"
            style={{ borderColor: `${theme.gold}55`, background: theme.panel, color: theme.ink }}
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.15 }}
              className="flex h-20 w-20 items-center justify-center rounded-full"
              style={{ background: `${theme.gold}22`, border: `1px solid ${theme.gold}` }}
            >
              <motion.svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke={theme.gold} strokeWidth="1.6">
                <motion.path
                  d="M4.5 12.5l5 5 10-11"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.7, delay: 0.35, ease: "easeInOut" }}
                />
              </motion.svg>
            </motion.span>
            <div>
              <h3 className="font-display text-3xl font-semibold" style={{ color: theme.script }}>
                {attending === "yes" ? "See you there!" : "You will be missed"}
              </h3>
              <p className="mt-3 max-w-sm font-sans text-[14px] font-light leading-relaxed opacity-75">
                {attending === "yes"
                  ? `Thank you — we have saved ${guests} ${guests > 1 ? "seats" : "seat"} in our hearts.`
                  : "Thank you for letting us know. You remain a cherished part of our story."}
              </p>
            </div>
            <Ornament style={theme.ornament} className="h-4 w-36" />
            <button type="button" onClick={() => setSent(false)}
              className="font-sans text-[11px] uppercase tracking-wide-2 underline-offset-4 opacity-60 hover:underline">
              Edit response
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------- Music toggle ------------------------------ */

export function MusicToggle({ theme, title, src }: { theme: TemplateTheme; title: string; src?: string }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Lazily create a looping audio element when a real track URL is provided.
  useEffect(() => {
    if (!src) return;
    const audio = new Audio(src);
    audio.loop = true;
    audio.preload = "none";
    audioRef.current = audio;
    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [src]);

  function toggle() {
    const audio = audioRef.current;
    if (audio) {
      if (playing) audio.pause();
      else audio.play().catch(() => { /* autoplay policy */ });
    }
    setPlaying((p) => !p);
  }

  return (
    <button
      type="button"
      aria-pressed={playing}
      aria-label={playing ? `Pause ${title}` : `Play ${title}`}
      title={title}
      onClick={toggle}
      className="flex h-12 w-12 items-center justify-center rounded-full border shadow-lg transition-transform duration-300 hover:scale-105"
      style={{ background: theme.gold, borderColor: `${theme.gold}`, color: theme.dark ? theme.bg : "#fff" }}
    >
      {playing ? (
        <span className="flex items-end gap-[3px]" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="w-[2.5px] animate-shimmer rounded-full bg-current"
              style={{ height: `${[10, 16, 8, 13][i]}px`, animationDelay: `${i * 0.18}s`, animationDuration: "0.9s" }} />
          ))}
        </span>
      ) : (
        <Music2 className="h-5 w-5" strokeWidth={1.6} />
      )}
    </button>
  );
}

/* ------------------------------- Gift banner ------------------------------- */

export function GiftNote({ text, theme }: { text: string; theme: TemplateTheme }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border p-6" style={{ borderColor: `${theme.gold}40`, background: `${theme.gold}12`, color: theme.ink }}>
      <Gift className="mt-0.5 h-5 w-5 shrink-0" style={{ color: theme.gold }} strokeWidth={1.5} />
      <p className="font-sans text-[14px] font-light leading-relaxed">{text}</p>
    </div>
  );
}
