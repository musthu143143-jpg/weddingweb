"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronRight, Sparkles } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { TemplateTheme, WeddingTemplate } from "@/lib/types";
import { Monogram, Ornament } from "@/components/ui/core";

/**
 * Wraps the full invitation demo with an interactive 3D opening experience.
 * The invitation renders underneath; the overlay holds the interaction and
 * fades away once the guest completes it (or skips / prefers reduced motion).
 */
export default function OpeningGate({ template, children }: { template: WeddingTemplate; children: React.ReactNode }) {
  const [revealed, setRevealed] = useState(false);
  const [gone, setGone] = useState(false);
  const reduce = useReducedMotion();

  const complete = useCallback(() => {
    setRevealed((was) => {
      if (!was) setTimeout(() => setGone(true), 950);
      return true;
    });
  }, []);

  useEffect(() => {
    document.body.style.overflow = revealed ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [revealed]);

  const t = template.theme;

  return (
    <>
      {children}
      <AnimatePresence>
        {!gone && (
          <motion.div
            className="fixed inset-0 z-[80]"
            style={{ pointerEvents: revealed ? "none" : "auto" }}
            initial={{ opacity: 1 }}
            animate={{ opacity: revealed ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: "easeInOut" }}
            aria-hidden={revealed}
          >
            {reduce || !template.opening ? (
              <EnterCard template={template} onEnter={complete} />
            ) : template.opening === "doors" ? (
              <DoorsOpening t={t} template={template} onComplete={complete} />
            ) : template.opening === "scratch" ? (
              <ScratchOpening t={t} template={template} onComplete={complete} />
            ) : template.opening === "curtain" ? (
              <CurtainOpening t={t} template={template} onComplete={complete} />
            ) : template.opening === "book" ? (
              <BookOpening t={t} template={template} onComplete={complete} />
            ) : template.opening === "ring" ? (
              <RingOpening t={t} template={template} onComplete={complete} />
            ) : template.opening === "seal" ? (
              <SealOpening t={t} template={template} onComplete={complete} />
            ) : template.opening === "lantern" ? (
              <LanternOpening t={t} template={template} onComplete={complete} />
            ) : (
              <FireworksOpening t={t} template={template} onComplete={complete} />
            )}
            {!revealed && (
              <button
                type="button"
                onClick={complete}
                className="absolute top-4 right-4 z-20 rounded-full border px-4 py-2 font-sans text-[10px] uppercase tracking-wide-2 backdrop-blur-sm transition-colors"
                style={{ borderColor: `${t.gold}66`, color: t.dark ? t.ink : t.gold, background: `${t.bg}88` }}
              >
                Skip
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ------------------------------ shared chrome ----------------------------- */

function Hint({ t, children }: { t: TemplateTheme; children: React.ReactNode }) {
  return (
    <p className="pointer-events-none absolute bottom-8 left-1/2 z-10 w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 animate-float-soft rounded-full border px-4 py-2.5 text-center font-sans text-[10px] uppercase tracking-[0.16em] backdrop-blur-sm sm:px-5 sm:text-[11px] sm:tracking-luxe"
      style={{ borderColor: `${t.gold}66`, color: t.dark ? t.ink : t.gold, background: `${t.bg}99` }}>
      {children}
    </p>
  );
}

function Backdrop({ t, template }: { t: TemplateTheme; template: WeddingTemplate }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-grain px-6 text-center" style={{ background: t.bg, color: t.ink }}>
      <Monogram text={template.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()} className="h-16 w-16 shrink-0 text-[18px]" style={{ color: t.gold, borderColor: `${t.gold}80` }} />
      <p className="max-w-full break-words font-script text-[clamp(2.5rem,12vw,3rem)]" style={{ color: t.script }}>{template.name}</p>
      <span style={{ color: t.gold }}><Ornament style={t.ornament} className="h-4 w-40 max-w-full" /></span>
    </div>
  );
}

function EnterCard({ template, onEnter }: { template: WeddingTemplate; onEnter: () => void }) {
  const t = template.theme;
  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ background: t.bg }}>
      <div className="flex flex-col items-center gap-6 px-8 text-center">
        <Backdrop t={t} template={template} />
        <button type="button" onClick={onEnter} className="absolute bottom-14 inline-flex items-center gap-2 rounded-full px-8 py-4 font-sans text-[12px] font-medium uppercase tracking-luxe shadow-lg transition-transform hover:-translate-y-0.5"
          style={{ background: t.gold, color: t.dark ? t.bg : "#fff" }}>
          Open Invitation <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* --------------------------------- 1 · doors ------------------------------ */

function DoorsOpening({ t, template, onComplete }: { t: TemplateTheme; template: WeddingTemplate; onComplete: () => void }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const id = setTimeout(onComplete, 1500);
    return () => clearTimeout(id);
  }, [open, onComplete]);

  const doorStyle = (side: "left" | "right"): React.CSSProperties => ({
    transformOrigin: side === "left" ? "left center" : "right center",
    transform: open ? `rotateY(${side === "left" ? -112 : 112}deg)` : "rotateY(0deg)",
    transition: "transform 1.4s cubic-bezier(.72,0,.28,1)",
    background: `linear-gradient(${side === "left" ? "100deg" : "260deg"}, ${t.panel}, ${t.bg})`,
  });

  return (
    <div className="absolute inset-0" style={{ perspective: 1800 }}>
      <Backdrop t={t} template={template} />
      {(["left", "right"] as const).map((side) => (
        <div key={side} className={`absolute inset-y-0 ${side === "left" ? "left-0" : "right-0"} w-1/2 ${side === "left" ? "border-r" : "border-l"}`}
          style={{ ...doorStyle(side), borderColor: `${t.gold}55`, boxShadow: "0 0 60px rgba(0,0,0,.35) inset" }}>
          <span className={`pointer-events-none absolute inset-4 ${side === "left" ? "border-r" : "border-l"}`} style={{ borderColor: `${t.gold}40` }} />
          <span className={`pointer-events-none absolute inset-8 ${side === "left" ? "border-r" : "border-l"}`} style={{ borderColor: `${t.gold}22` }} />
          {/* handle near the seam */}
          <span className={`absolute top-1/2 ${side === "left" ? "right-5" : "left-5"} h-14 w-3 -translate-y-1/2 rounded-full`} style={{ background: `linear-gradient(180deg, ${t.gold}, ${t.accent})` }} />
          <span className={`absolute top-1/2 ${side === "left" ? "right-3.5" : "left-3.5"} h-5 w-5 -translate-y-1/2 rounded-full border-2`} style={{ borderColor: t.gold }} />
        </div>
      ))}
      {!open && (
        <button type="button" onClick={() => setOpen(true)}
          className="absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full px-9 py-4 font-sans text-[12px] font-medium uppercase tracking-luxe shadow-xl transition-transform hover:scale-105"
          style={{ background: t.gold, color: t.dark ? t.bg : "#fff" }}>
          Open the Doors
        </button>
      )}
      <Hint t={t}>A royal welcome awaits</Hint>
    </div>
  );
}

/* -------------------------------- 2 · scratch ----------------------------- */

function ScratchOpening({ t, template, onComplete }: { t: TemplateTheme; template: WeddingTemplate; onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const moves = useRef(0);
  const finished = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    // gold-foil card
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#8a6a2f");
    grad.addColorStop(0.35, "#e8d5a8");
    grad.addColorStop(0.6, "#b08d4a");
    grad.addColorStop(1, "#6e5322");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // speckles
    for (let i = 0; i < 900; i += 1) {
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.14})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }
    // centred label
    ctx.fillStyle = "rgba(60,9,22,.82)";
    ctx.font = "600 13px Jost, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("S C R A T C H   T O   R E V E A L", w / 2, h / 2 - 26);
    ctx.fillStyle = "rgba(60,9,22,.9)";
    ctx.font = `italic 600 ${Math.min(44, Math.max(28, w * 0.11))}px 'Cormorant Garamond', serif`;
    ctx.fillText(template.name, w / 2, h / 2 + 26);
  }, [template.name]);

  const erase = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || finished.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = 56;
    ctx.lineCap = "round";
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);

    moves.current += 1;
    if (moves.current % 22 === 0) {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let clear = 0;
      let total = 0;
      for (let i = 3; i < data.length; i += 4 * 97) {
        total += 1;
        if (data[i] === 0) clear += 1;
      }
      if (total > 0 && clear / total > 0.42) {
        finished.current = true;
        onComplete();
      }
    }
  };

  return (
    <div className="absolute inset-0">
      <Backdrop t={t} template={template} />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full cursor-crosshair"
        style={{ touchAction: "none" }}
        onPointerDown={(e) => {
          drawing.current = true;
          const ctx = canvasRef.current?.getContext("2d");
          if (!ctx) return;
          const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
          ctx.beginPath();
          ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
        }}
        onPointerMove={erase}
        onPointerUp={() => (drawing.current = false)}
        onPointerLeave={() => (drawing.current = false)}
      />
      <Hint t={{ ...t, dark: false, gold: "#3c0916" }}>Rub the gold foil away</Hint>
    </div>
  );
}

/* -------------------------------- 3 · curtain ----------------------------- */

function CurtainOpening({ t, template, onComplete }: { t: TemplateTheme; template: WeddingTemplate; onComplete: () => void }) {
  const [pulled, setPulled] = useState(false);
  useEffect(() => {
    if (!pulled) return;
    const id = setTimeout(onComplete, 1700);
    return () => clearTimeout(id);
  }, [pulled, onComplete]);

  const folds = `repeating-linear-gradient(90deg, ${t.accent} 0px, ${t.bg} 26px, ${t.accent} 52px)`;
  const panel = (side: "left" | "right"): React.CSSProperties => ({
    background: folds,
    transform: pulled ? `translateX(${side === "left" ? -104 : 104}%)` : "translateX(0)",
    transition: "transform 1.6s cubic-bezier(.66,0,.34,1)",
    boxShadow: "0 0 80px rgba(0,0,0,.45) inset",
  });

  return (
    <div className="absolute inset-0 overflow-hidden">
      <Backdrop t={t} template={template} />
      {/* valance */}
      <div className="absolute inset-x-0 top-0 z-10 h-16" style={{ background: folds, borderBottom: `3px solid ${t.gold}` }} />
      {(["left", "right"] as const).map((side) => (
        <div key={side} className={`absolute inset-y-0 z-[5] ${side === "left" ? "left-0" : "right-0"} w-[54%]`} style={panel(side)}>
          <span className={`absolute inset-y-0 ${side === "left" ? "right-0" : "left-0"} w-2`} style={{ background: t.gold }} />
        </div>
      ))}
      {!pulled && (
        <button type="button" onClick={() => setPulled(true)}
          className="absolute bottom-20 left-1/2 z-20 -translate-x-1/2 rounded-full px-9 py-4 font-sans text-[12px] font-medium uppercase tracking-luxe shadow-xl transition-transform hover:scale-105"
          style={{ background: t.gold, color: t.dark ? t.bg : "#fff" }}>
          Pull the Curtain
        </button>
      )}
      <Hint t={t}>The stage is set for forever</Hint>
    </div>
  );
}

/* --------------------------------- 4 · book ------------------------------- */

function BookOpening({ t, template, onComplete }: { t: TemplateTheme; template: WeddingTemplate; onComplete: () => void }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const id = setTimeout(onComplete, 1700);
    return () => clearTimeout(id);
  }, [open, onComplete]);

  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ background: t.bg, perspective: 2200 }}>
      <div className="bg-grain absolute inset-0 opacity-60" />
      <div className="relative h-[min(68vh,560px)] w-[min(88vw,420px)] max-w-full">
        {/* right page (static) */}
        <div className="absolute inset-0 overflow-hidden rounded-r-xl border p-6 sm:p-8"
          style={{ background: t.panel, borderColor: `${t.gold}55`, color: t.ink }}>
          <p className="font-sans text-[10px] uppercase tracking-luxe" style={{ color: t.accent }}>Chapter One</p>
          <p className="mt-6 font-script text-5xl leading-tight" style={{ color: t.script }}>Our Story</p>
          <span style={{ color: t.gold }}><Ornament style={t.ornament} className="mt-6 h-4 w-32 max-w-full" /></span>
          <p className="mt-6 font-display text-lg italic opacity-80">begins the moment you open this book…</p>
        </div>
        {/* front cover (flips) */}
        <div className="absolute inset-0"
          style={{
            transformOrigin: "left center",
            transform: open ? "rotateY(-168deg)" : "rotateY(0deg)",
            transition: "transform 1.6s cubic-bezier(.7,0,.3,1)",
            transformStyle: "preserve-3d",
            zIndex: open ? 1 : 10,
          }}>
          <div className="relative flex h-full w-full flex-col items-center justify-center gap-5 overflow-hidden rounded-r-xl border p-6 text-center shadow-2xl sm:p-8"
            style={{ background: `linear-gradient(120deg, ${t.bg}, ${t.panel})`, borderColor: `${t.gold}70`, color: t.ink, backfaceVisibility: "hidden" }}>
            <span className="absolute inset-3 rounded-r-lg border" style={{ borderColor: `${t.gold}45` }} />
            <Sparkles className="h-6 w-6 shrink-0" style={{ color: t.gold }} strokeWidth={1.5} />
            <p className="font-sans text-[10px] uppercase tracking-luxe" style={{ color: t.accent }}>A keepsake invitation</p>
            <p className="max-w-full break-words font-script text-[clamp(2.75rem,12vw,3.75rem)]" style={{ color: t.script }}>{template.name}</p>
            <span style={{ color: t.gold }}><Ornament style={t.ornament} className="h-4 w-36 max-w-full" /></span>
            {!open && (
              <button type="button" onClick={() => setOpen(true)}
                className="mt-4 rounded-full px-6 py-3.5 font-sans text-[10px] font-medium uppercase tracking-[0.16em] shadow-lg transition-transform hover:scale-105 sm:px-8 sm:text-[11px] sm:tracking-luxe"
                style={{ background: t.gold, color: t.dark ? t.bg : "#fff" }}>
                Open the Book
              </button>
            )}
          </div>
        </div>
      </div>
      <Hint t={t}>Every love story deserves a cover</Hint>
    </div>
  );
}

/* -------------------------------- 5 · ring box ---------------------------- */

function RingOpening({ t, template, onComplete }: { t: TemplateTheme; template: WeddingTemplate; onComplete: () => void }) {
  const [stage, setStage] = useState<0 | 1 | 2>(0);
  useEffect(() => {
    if (stage === 0) return;
    if (stage === 1) {
      const id = setTimeout(() => setStage(2), 900);
      return () => clearTimeout(id);
    }
    const id = setTimeout(onComplete, 1700);
    return () => clearTimeout(id);
  }, [stage, onComplete]);

  const sparkles = Array.from({ length: 14 }, (_, i) => {
    const angle = (i / 14) * Math.PI * 2;
    const dist = 90 + (i % 3) * 34;
    return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, delay: 0.55 + (i % 5) * 0.06 };
  });

  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ background: t.bg, perspective: 1400 }}>
      <div className="bg-grain absolute inset-0 opacity-50" />
      <div className="relative" style={{ transformStyle: "preserve-3d" }}>
        {/* sparkle burst */}
        {stage >= 1 && (
          <div className="pointer-events-none absolute top-1/2 left-1/2 z-20">
            {sparkles.map((s, i) => (
              <motion.span
                key={i}
                className="absolute h-2 w-2 rounded-full"
                style={{ background: i % 2 ? t.gold : "#fff" }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0.3 }}
                animate={{ x: s.x, y: s.y - 40, opacity: 0, scale: 1.1 }}
                transition={{ duration: 1.1, delay: s.delay, ease: "easeOut" }}
              />
            ))}
          </div>
        )}

        {/* box base */}
        <div className="relative z-10 h-40 w-56 rounded-b-2xl border shadow-2xl sm:h-44 sm:w-64"
          style={{ background: `linear-gradient(160deg, ${t.accent}, ${t.bg} 70%)`, borderColor: `${t.gold}70` }}>
          <span className="absolute inset-x-0 top-0 h-3" style={{ background: t.gold }} />
          {/* inner cushion + ring */}
          <div className="absolute inset-x-6 top-3 bottom-4 flex items-center justify-center rounded-xl"
            style={{ background: `linear-gradient(180deg, ${t.panel}, ${t.ink}22)` }}>
            <motion.div
              className="relative"
              initial={{ y: 26, opacity: 0 }}
              animate={stage >= 1 ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <span className="block h-16 w-16 rounded-full border-[7px] sm:h-20 sm:w-20"
                style={{ borderColor: t.gold, boxShadow: `0 0 24px ${t.gold}88, inset 0 0 10px ${t.gold}55` }} />
              {/* diamond */}
              <motion.span
                className="absolute -top-3 left-1/2 h-7 w-7 -translate-x-1/2 rotate-45"
                style={{ background: `linear-gradient(135deg, #ffffff, ${t.gold} 55%, #ffffff)` }}
                animate={stage >= 1 ? { scale: [1, 1.25, 1], filter: ["brightness(1)", "brightness(2.2)", "brightness(1)"] } : {}}
                transition={{ duration: 1.4, repeat: stage >= 1 ? Infinity : 0, repeatDelay: 0.8 }}
              />
            </motion.div>
          </div>
        </div>

        {/* lid, hinged at the back */}
        <div
          className="absolute inset-x-0 -top-1 z-20 h-20 origin-top rounded-t-2xl border shadow-xl sm:h-24"
          style={{
            background: `linear-gradient(200deg, ${t.accent}, ${t.bg} 75%)`,
            borderColor: `${t.gold}70`,
            transform: stage >= 1 ? "rotateX(-118deg)" : "rotateX(0deg)",
            transition: "transform 1s cubic-bezier(.7,0,.3,1)",
            transformStyle: "preserve-3d",
          }}
        >
          <span className="absolute inset-x-0 bottom-0 h-2.5" style={{ background: t.gold }} />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-script text-3xl" style={{ color: t.gold }}>
            {template.name.split(" ").map((w) => w[0]).join("")}
          </span>
        </div>
      </div>

      {stage === 0 && (
        <button type="button" onClick={() => setStage(1)}
          className="absolute bottom-24 rounded-full px-9 py-4 font-sans text-[12px] font-medium uppercase tracking-luxe shadow-xl transition-transform hover:scale-105"
          style={{ background: t.gold, color: t.dark ? t.bg : "#fff" }}>
          Open the Ring Box
        </button>
      )}
      <Hint t={t}>A promise, kept forever</Hint>
    </div>
  );
}

/* ------------------------------ 6 · wax seal ------------------------------ */

function SealOpening({ t, template, onComplete }: { t: TemplateTheme; template: WeddingTemplate; onComplete: () => void }) {
  const [stage, setStage] = useState<0 | 1 | 2 | 3>(0);
  useEffect(() => {
    if (stage === 1) return void setTimeout(() => setStage(2), 450);
    if (stage === 2) return void setTimeout(() => setStage(3), 850);
    if (stage === 3) return void setTimeout(onComplete, 1500);
  }, [stage, onComplete]);

  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ background: t.bg, perspective: 1600 }}>
      <div className="bg-grain absolute inset-0 opacity-50" />
      <div className="relative h-[420px] w-[min(88vw,340px)]" style={{ transformStyle: "preserve-3d" }}>
        {/* envelope body */}
        <div className="absolute inset-0 overflow-hidden rounded-xl border shadow-2xl" style={{ background: t.panel, borderColor: `${t.gold}60`, color: t.ink }}>
          <span className="absolute inset-3 rounded-lg border" style={{ borderColor: `${t.gold}35` }} />
          {/* letter rising */}
          <motion.div
            className="absolute inset-x-5 top-5 bottom-5 flex flex-col items-center justify-center gap-3 rounded-lg border text-center"
            style={{ background: t.dark ? t.bg : "#fffdf8", borderColor: `${t.gold}50` }}
            initial={{ y: 0, scale: 0.92 }}
            animate={stage >= 3 ? { y: "-14%", scale: 1 } : {}}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="font-sans text-[9px] uppercase tracking-luxe" style={{ color: t.accent }}>You are invited</p>
            <p className="font-script text-4xl" style={{ color: t.script }}>{template.name}</p>
            <span style={{ color: t.gold }}><Ornament style={t.ornament} className="h-3.5 w-28" /></span>
          </motion.div>
        </div>

        {/* flap */}
        <div
          className="absolute inset-x-0 top-0 z-10 h-1/2 origin-top"
          style={{
            transform: stage >= 2 ? "rotateX(-180deg)" : "rotateX(0deg)",
            transition: "transform 0.9s cubic-bezier(.7,0,.3,1)",
            transformStyle: "preserve-3d",
          }}
        >
          <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${t.dark ? t.accent : t.gold}33, ${t.panel})`, clipPath: "polygon(0 0, 100% 0, 50% 100%)" }} />
        </div>

        {/* wax seal */}
        <motion.button
          type="button"
          onClick={() => stage === 0 && setStage(1)}
          className="absolute top-1/2 left-1/2 z-20 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full shadow-xl"
          style={{ background: "radial-gradient(circle at 35% 30%, #a13a52, #5e1124 70%)", border: "3px solid #7a1430" }}
          animate={stage === 1 ? { scale: [1, 1.15, 0.2], rotate: [0, 12, 40], opacity: [1, 1, 0] } : stage >= 1 ? { opacity: 0 } : {}}
          transition={{ duration: 0.5 }}
          aria-label="Break the wax seal"
        >
          <span className="font-display text-2xl font-semibold text-gold-soft">{template.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}</span>
        </motion.button>
      </div>

      {stage === 0 && <Hint t={t}>Break the wax seal</Hint>}
    </div>
  );
}

/* ------------------------------ 7 · lanterns ------------------------------ */

function LanternOpening({ t, template, onComplete }: { t: TemplateTheme; template: WeddingTemplate; onComplete: () => void }) {
  const [released, setReleased] = useState(false);
  useEffect(() => {
    if (!released) return;
    const id = setTimeout(onComplete, 2300);
    return () => clearTimeout(id);
  }, [released, onComplete]);

  const stars = Array.from({ length: 60 }, (_, i) => ({
    left: (i * 37) % 100,
    top: (i * 53) % 70,
    size: 1 + (i % 3),
    delay: (i % 7) * 0.4,
  }));
  const lanterns = [
    { left: "22%", delay: 0, dur: 2.1, scale: 0.8 },
    { left: "47%", delay: 0.25, dur: 2.3, scale: 1 },
    { left: "70%", delay: 0.5, dur: 2.0, scale: 0.7 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: `linear-gradient(180deg, #05060f 0%, ${t.bg} 75%)` }}>
      {/* stars */}
      {stars.map((s, i) => (
        <span key={i} className="absolute animate-shimmer rounded-full bg-ivory"
          style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s`, animationDuration: "2.6s" }} />
      ))}
      <div className="absolute inset-x-0 bottom-0 h-1/3" style={{ background: `linear-gradient(0deg, ${t.bg}, transparent)` }} />
      <p className="absolute top-1/4 left-1/2 -translate-x-1/2 text-center">
        <span className="block max-w-full break-words font-script text-[clamp(2.5rem,12vw,3rem)]" style={{ color: t.script }}>{template.name}</span>
      </p>

      {lanterns.map((l, i) => (
        <motion.div
          key={i}
          className="absolute bottom-10"
          style={{ left: l.left }}
          initial={{ y: 0, opacity: 1 }}
          animate={released ? { y: "-115vh", x: [0, 26, -18, 20], opacity: [1, 1, 1, 0.2] } : { y: [0, -8, 0] }}
          transition={released
            ? { duration: l.dur, delay: l.delay, ease: "easeIn", x: { duration: l.dur, delay: l.delay } }
            : { duration: 3 + i, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="relative" style={{ transform: `scale(${l.scale})` }}>
            <span className="absolute -inset-6 rounded-full blur-2xl" style={{ background: `${t.gold}55` }} />
            <div className="relative h-20 w-14 rounded-[45%_45%_40%_40%] border"
              style={{ background: `linear-gradient(180deg, ${t.gold}, ${t.accent})`, borderColor: `${t.gold}aa`, boxShadow: `0 0 30px ${t.gold}88` }}>
              <span className="absolute inset-x-3 top-2 bottom-2 rounded-[45%] animate-shimmer" style={{ background: "radial-gradient(circle at 50% 65%, #fff6d8, transparent 70%)", animationDuration: "1.8s" }} />
            </div>
          </div>
        </motion.div>
      ))}

      {!released && (
        <button type="button" onClick={() => setReleased(true)}
          className="absolute bottom-20 left-1/2 z-10 -translate-x-1/2 rounded-full px-9 py-4 font-sans text-[12px] font-medium uppercase tracking-luxe shadow-xl transition-transform hover:scale-105"
          style={{ background: t.gold, color: t.dark ? t.bg : "#fff" }}>
          Release the Lanterns
        </button>
      )}
      <Hint t={t}>Send a wish into the night</Hint>
    </div>
  );
}

/* ------------------------------ 8 · fireworks ----------------------------- */

function FireworksOpening({ t, template, onComplete }: { t: TemplateTheme; template: WeddingTemplate; onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [launched, setLaunched] = useState(false);
  const finished = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    type P = { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string; size: number };
    const rockets: P[] = [];
    const sparks: P[] = [];
    const colors = ["#e8d5a8", "#d98a96", t.gold, "#ffffff", "#c2a05a"];
    let raf = 0;
    let launches = 0;
    let last = 0;

    const burst = (x: number, y: number) => {
      const n = 70;
      for (let i = 0; i < n; i += 1) {
        const a = (i / n) * Math.PI * 2 + Math.random() * 0.2;
        const sp = 1.6 + Math.random() * 3.4;
        sparks.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0, max: 70 + Math.random() * 30, color: colors[i % colors.length], size: 1.6 + Math.random() * 1.6 });
      }
    };

    const loop = (time: number) => {
      raf = requestAnimationFrame(loop);
      if (time - last > 480 && launches < 5 && launched) {
        last = time;
        launches += 1;
        rockets.push({ x: w * (0.2 + Math.random() * 0.6), y: h, vx: 0, vy: -(h * 0.014 + 4), life: 0, max: 999, color: t.gold, size: 2.4 });
      }
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(5,6,15,0.22)";
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      for (let i = rockets.length - 1; i >= 0; i -= 1) {
        const r = rockets[i];
        r.y += r.vy;
        ctx.beginPath();
        ctx.fillStyle = r.color;
        ctx.shadowBlur = 14;
        ctx.shadowColor = r.color;
        ctx.arc(r.x, r.y, r.size, 0, Math.PI * 2);
        ctx.fill();
        if (r.y < h * (0.24 + Math.random() * 0.18)) {
          burst(r.x, r.y);
          rockets.splice(i, 1);
        }
      }
      for (let i = sparks.length - 1; i >= 0; i -= 1) {
        const s = sparks[i];
        s.life += 1;
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.035;
        s.vx *= 0.985;
        const alpha = 1 - s.life / s.max;
        if (alpha <= 0) {
          sparks.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = s.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = s.color;
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      ctx.shadowBlur = 0;

      if (launched && launches >= 5 && rockets.length === 0 && sparks.length === 0 && !finished.current) {
        finished.current = true;
        cancelAnimationFrame(raf);
        onComplete();
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [launched, onComplete, t.gold]);

  return (
    <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #05060f 0%, ${t.bg} 90%)".replace("${t.bg}", t.bg) }}>
      <div className="absolute inset-x-0 top-1/4 text-center">
        <p className="max-w-full break-words font-script text-[clamp(2.5rem,12vw,3rem)]" style={{ color: t.script }}>{template.name}</p>
      </div>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {!launched && (
        <button type="button" onClick={() => setLaunched(true)}
          className="absolute bottom-20 left-1/2 z-10 -translate-x-1/2 rounded-full px-9 py-4 font-sans text-[12px] font-medium uppercase tracking-luxe shadow-xl transition-transform hover:scale-105"
          style={{ background: t.gold, color: t.dark ? t.bg : "#fff" }}>
          Light the Fireworks
        </button>
      )}
      <Hint t={t}>Celebrate the beginning</Hint>
    </div>
  );
}
