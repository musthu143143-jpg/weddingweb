"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronRight, Heart, Sparkles } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { InvitationData, TemplateTheme, WeddingTemplate } from "@/lib/types";
import { CornerFlourish, Monogram, Ornament } from "@/components/ui/core";

/**
 * Wraps the full invitation demo with an interactive 3D opening experience.
 * The invitation renders underneath; the overlay holds the interaction and
 * fades away once the guest completes it (or skips / prefers reduced motion).
 */
export default function OpeningGate({ template, children, data }: { template: WeddingTemplate; children: React.ReactNode; data?: InvitationData }) {
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
              <SealOpening t={t} template={template} data={data} onComplete={complete} />
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
                style={{ borderColor: `${t.gold}88`, color: t.gold, background: `${t.bg}CC`, boxShadow: `0 0 14px ${t.gold}22` }}
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
    const id = window.setTimeout(onComplete, 1500);
    return () => window.clearTimeout(id);
  }, [open, onComplete]);

  const doorStyle = (side: "left" | "right"): React.CSSProperties => ({
    transformOrigin: side === "left" ? "left center" : "right center",
    transform: open ? `rotateY(${side === "left" ? -112 : 112}deg)` : "rotateY(0deg)",
    transition: "transform 1.4s cubic-bezier(.72,0,.28,1)",
    background: `linear-gradient(${side === "left" ? "100deg" : "260deg"}, ${t.panel}, ${t.accent}88 52%, ${t.bg})`,
    boxShadow: `0 0 80px ${t.gold}22 inset, 0 0 32px #00000035 inset`,
  });

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        perspective: 1800,
        background: `radial-gradient(circle at 50% 48%, ${t.gold}38 0%, transparent 22%), linear-gradient(135deg, ${t.bg}, ${t.accent}55 50%, ${t.bg})`,
      }}
    >
      <Backdrop t={t} template={template} />
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
        <span className="absolute top-[18%] left-1/2 h-[64%] w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white/70 to-transparent blur-[1px]" />
        <span className="absolute top-[30%] left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-gold/20 blur-3xl" />
      </div>
      {(["left", "right"] as const).map((side) => (
        <div key={side} className={`absolute inset-y-0 z-10 ${side === "left" ? "left-0" : "right-0"} w-1/2 ${side === "left" ? "border-r" : "border-l"}`}
          style={{ ...doorStyle(side), borderColor: `${t.gold}80` }}>
          <span className={`pointer-events-none absolute inset-4 ${side === "left" ? "border-r" : "border-l"}`} style={{ borderColor: `${t.gold}55` }} />
          <span className={`pointer-events-none absolute inset-8 ${side === "left" ? "border-r" : "border-l"}`} style={{ borderColor: `${t.gold}28` }} />
          <span className={`pointer-events-none absolute top-1/2 ${side === "left" ? "right-12" : "left-12"} h-36 w-20 -translate-y-1/2 rounded-full border`} style={{ borderColor: `${t.gold}35` }} />
          {/* jewel-like handle near the seam */}
          <span className={`absolute top-1/2 ${side === "left" ? "right-5" : "left-5"} h-14 w-3 -translate-y-1/2 rounded-full`} style={{ background: `linear-gradient(180deg, #F2A65A, ${t.accent}, ${t.gold})`, boxShadow: `0 0 18px ${t.gold}88` }} />
          <span className={`absolute top-1/2 ${side === "left" ? "right-3.5" : "left-3.5"} h-5 w-5 -translate-y-1/2 rounded-full border-2 bg-white/10`} style={{ borderColor: t.gold, boxShadow: `0 0 12px ${t.gold}99` }} />
        </div>
      ))}
      {!open && (
        <button type="button" onClick={() => setOpen(true)}
          className="absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-full border px-9 py-4 font-sans text-[12px] font-medium uppercase tracking-luxe shadow-xl transition-transform hover:scale-105"
          style={{ background: `linear-gradient(135deg, ${t.gold}, ${t.accent})`, borderColor: "#ffffff70", color: t.dark ? t.bg : "#fff", boxShadow: `0 12px 40px ${t.gold}55` }}>
          Open the Doors
        </button>
      )}
      <Hint t={{ ...t, gold: "#F2A65A" }}>Step into the celebration</Hint>
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

    // A rainbow foil card makes this opening feel tactile and celebratory,
    // while the canvas still keeps the scratch interaction lightweight.
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#6C4AB2");
    grad.addColorStop(0.28, "#E45B76");
    grad.addColorStop(0.52, "#F2A65A");
    grad.addColorStop(0.76, "#43A59E");
    grad.addColorStop(1, "#7557B8");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    const shine = ctx.createRadialGradient(w * 0.22, h * 0.14, 0, w * 0.22, h * 0.14, Math.max(w, h) * 0.7);
    shine.addColorStop(0, "rgba(255,255,255,.34)");
    shine.addColorStop(0.45, "rgba(255,255,255,.06)");
    shine.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = shine;
    ctx.fillRect(0, 0, w, h);

    // iridescent speckles
    const foilDots = ["rgba(255,255,255,.18)", "rgba(255,232,170,.2)", "rgba(255,190,214,.18)"];
    for (let i = 0; i < 900; i += 1) {
      ctx.fillStyle = foilDots[i % foilDots.length];
      const size = 1 + (i % 3);
      ctx.fillRect((i * 83) % w, (i * 137) % h, size, size);
    }

    ctx.strokeStyle = "rgba(255,255,255,.52)";
    ctx.lineWidth = 2;
    ctx.strokeRect(24, 24, Math.max(0, w - 48), Math.max(0, h - 48));

    // centred label
    ctx.fillStyle = "rgba(60,9,22,.86)";
    ctx.font = `600 ${Math.min(13, Math.max(10, w * 0.034))}px Jost, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("S C R A T C H   T O   R E V E A L", w / 2, h / 2 - 26);
    ctx.fillStyle = "rgba(60,9,22,.94)";
    let titleSize = Math.min(44, Math.max(28, w * 0.11));
    ctx.font = `italic 600 ${titleSize}px 'Cormorant Garamond', serif`;
    while (ctx.measureText(template.name).width > w * 0.78 && titleSize > 24) {
      titleSize -= 2;
      ctx.font = `italic 600 ${titleSize}px 'Cormorant Garamond', serif`;
    }
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
      <Hint t={{ ...t, dark: false, gold: "#6C4AB2" }}>Scratch the rainbow foil away</Hint>
    </div>
  );
}

/* -------------------------------- 3 · curtain ----------------------------- */

function CurtainOpening({ t, template, onComplete }: { t: TemplateTheme; template: WeddingTemplate; onComplete: () => void }) {
  const [pulled, setPulled] = useState(false);
  const curtainColors = [t.accent, "#7B3F98", "#C94F70", t.gold, t.bg];
  const folds = `repeating-linear-gradient(90deg, ${curtainColors[0]} 0px, ${curtainColors[1]} 18px, ${curtainColors[2]} 36px, ${curtainColors[4]} 54px, ${curtainColors[0]} 72px)`;

  useEffect(() => {
    if (!pulled) return;
    const id = window.setTimeout(onComplete, 1700);
    return () => window.clearTimeout(id);
  }, [pulled, onComplete]);

  const panel = (side: "left" | "right"): React.CSSProperties => ({
    background: folds,
    transform: pulled ? `translateX(${side === "left" ? -104 : 104}%)` : "translateX(0)",
    transition: "transform 1.6s cubic-bezier(.66,0,.34,1)",
    boxShadow: `0 0 100px ${t.bg}99 inset, 0 0 40px ${t.gold}22 inset`,
  });

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: `radial-gradient(ellipse at 50% 72%, ${t.gold}38 0%, transparent 34%), linear-gradient(180deg, ${t.bg}, ${t.accent}66 70%, ${t.bg})` }}
    >
      <Backdrop t={t} template={template} />
      <div className="pointer-events-none absolute inset-x-0 top-[18%] z-0 mx-auto h-72 max-w-xl rounded-full bg-gold/20 blur-3xl" aria-hidden="true" />
      {/* glowing theatre lights */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-32 bg-gradient-to-t from-[#F2A65A30] to-transparent" aria-hidden="true" />
      {/* valance */}
      <div className="absolute inset-x-0 top-0 z-10 h-20" style={{ background: `linear-gradient(180deg, ${curtainColors[1]}, ${curtainColors[0]} 72%, ${t.gold})`, borderBottom: `3px solid ${t.gold}`, boxShadow: `0 10px 30px ${t.bg}88` }}>
        <div className="absolute inset-x-0 bottom-[-10px] flex justify-center gap-2">
          {Array.from({ length: 13 }, (_, i) => <span key={i} className="h-5 w-8 rounded-b-full border-b" style={{ borderColor: `${t.gold}88`, background: `${curtainColors[i % 3]}cc` }} />)}
        </div>
      </div>
      {(["left", "right"] as const).map((side) => (
        <div key={side} className={`absolute inset-y-0 z-[5] ${side === "left" ? "left-0" : "right-0"} w-[54%]`} style={panel(side)}>
          <span className={`absolute inset-y-0 ${side === "left" ? "right-0" : "left-0"} w-2`} style={{ background: `linear-gradient(180deg, ${t.gold}, #F2A65A, ${t.gold})`, boxShadow: `0 0 18px ${t.gold}` }} />
          <span className="pointer-events-none absolute inset-5 border" style={{ borderColor: `${t.gold}22` }} />
        </div>
      ))}
      {!pulled && (
        <>
          <span className="absolute top-1/2 left-[43%] z-20 h-14 w-3 -translate-y-1/2 rounded-full" style={{ background: `linear-gradient(180deg, ${t.gold}, #F2A65A)`, boxShadow: `0 0 18px ${t.gold}` }} />
          <span className="absolute top-1/2 right-[43%] z-20 h-14 w-3 -translate-y-1/2 rounded-full" style={{ background: `linear-gradient(180deg, ${t.gold}, #F2A65A)`, boxShadow: `0 0 18px ${t.gold}` }} />
          <button type="button" onClick={() => setPulled(true)}
            className="absolute bottom-20 left-1/2 z-20 -translate-x-1/2 rounded-full border px-9 py-4 font-sans text-[12px] font-medium uppercase tracking-luxe shadow-xl transition-transform hover:scale-105"
            style={{ background: `linear-gradient(135deg, ${t.gold}, ${t.accent})`, borderColor: "#ffffff70", color: t.dark ? t.bg : "#fff", boxShadow: `0 12px 40px ${t.gold}55` }}>
            Pull the Curtain
          </button>
        </>
      )}
      <Hint t={{ ...t, gold: "#F2A65A" }}>The stage is set for forever</Hint>
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
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden" style={{ background: `radial-gradient(circle at 50% 50%, ${t.gold}28 0%, transparent 30%), linear-gradient(135deg, ${t.bg}, #7B3F9833 56%, ${t.accent}66)`, perspective: 2200 }}>
      <div className="bg-grain absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute top-[16%] left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#E45B7622] blur-3xl" aria-hidden="true" />
      <div className="relative h-[min(68vh,560px)] w-[min(88vw,420px)] max-w-full">
        {/* right page (static) */}
        <div className="absolute inset-0 overflow-hidden rounded-r-xl border p-6 shadow-2xl sm:p-8"
          style={{ background: `linear-gradient(135deg, ${t.panel}, #FFF0F3 58%, #EDE4FA)`, borderColor: `${t.gold}70`, color: t.ink }}>
          <span className="pointer-events-none absolute inset-3 rounded-r-lg border" style={{ borderColor: `${t.gold}45` }} />
          <span className="pointer-events-none absolute top-8 bottom-8 right-7 w-px bg-gradient-to-b from-transparent via-[#E45B7645] to-transparent" />
          <p className="relative font-sans text-[10px] uppercase tracking-luxe" style={{ color: t.accent }}>Chapter One</p>
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
            style={{ background: `linear-gradient(145deg, ${t.accent}, #E45B76 38%, #7557B8 72%, ${t.gold})`, borderColor: `${t.gold}90`, color: "#fffaf5", backfaceVisibility: "hidden", boxShadow: `0 20px 60px ${t.accent}55 inset` }}>
            <span className="pointer-events-none absolute inset-3 rounded-r-lg border" style={{ borderColor: "#ffffff70" }} />
            <span className="pointer-events-none absolute -right-16 -bottom-20 h-56 w-56 rounded-full border border-white/20" />
            <Sparkles className="h-6 w-6 shrink-0" style={{ color: "#FFE19A" }} strokeWidth={1.5} />
            <Heart className="h-5 w-5" style={{ color: "#FFD0DD", fill: "#FFD0DD" }} strokeWidth={1.3} />
            <p className="font-sans text-[10px] uppercase tracking-luxe text-white/85">A keepsake invitation</p>
            <p className="max-w-full break-words font-script text-[clamp(2.75rem,12vw,3.75rem)]" style={{ color: "#FFF3D1" }}>{template.name}</p>
            <span style={{ color: "#FFE19A" }}><Ornament style={t.ornament} className="h-4 w-36 max-w-full" /></span>
            {!open && (
              <button type="button" onClick={() => setOpen(true)}
                className="mt-4 rounded-full border px-6 py-3.5 font-sans text-[10px] font-medium uppercase tracking-[0.16em] shadow-lg transition-transform hover:scale-105 sm:px-8 sm:text-[11px] sm:tracking-luxe"
                style={{ background: "#FFF6E8", borderColor: "#ffffff90", color: "#6B2349" }}>
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
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden" style={{ background: `radial-gradient(circle at 50% 54%, ${t.gold}42 0%, transparent 25%), radial-gradient(circle at 20% 20%, #E45B7626 0%, transparent 30%), linear-gradient(145deg, ${t.bg}, #7557B833 62%, ${t.accent})`, perspective: 1400 }}>
      <div className="bg-grain absolute inset-0 opacity-50" />
      <div className="pointer-events-none absolute top-1/4 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#F2A65A1f] blur-3xl" aria-hidden="true" />
      <div className="relative" style={{ transformStyle: "preserve-3d" }}>
        {/* sparkle burst */}
        {stage >= 1 && (
          <div className="pointer-events-none absolute top-1/2 left-1/2 z-20">
            {sparkles.map((s, i) => (
              <motion.span
                key={i}
                className="absolute h-2 w-2 rounded-full"
                style={{ background: i % 4 === 0 ? "#E45B76" : i % 4 === 1 ? "#43A59E" : i % 4 === 2 ? "#F2A65A" : "#fff" }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0.3 }}
                animate={{ x: s.x, y: s.y - 40, opacity: 0, scale: 1.1 }}
                transition={{ duration: 1.1, delay: s.delay, ease: "easeOut" }}
              />
            ))}
          </div>
        )}

        {/* box base */}
        <div className="relative z-10 h-40 w-56 rounded-b-2xl border shadow-2xl sm:h-44 sm:w-64"
          style={{ background: `linear-gradient(160deg, ${t.accent}, #E45B76 42%, #7557B8 76%, ${t.bg})`, borderColor: `${t.gold}90`, boxShadow: `0 24px 60px ${t.accent}55` }}>
          <span className="absolute inset-x-0 top-0 h-3" style={{ background: `linear-gradient(90deg, ${t.gold}, #F2A65A, #E45B76, ${t.gold})` }} />
          {/* inner cushion + ring */}
          <div className="absolute inset-x-6 top-3 bottom-4 flex items-center justify-center rounded-xl"
            style={{ background: `radial-gradient(circle at 50% 48%, #F2A65A55 0%, transparent 38%), linear-gradient(180deg, ${t.panel}, ${t.ink}44)` }}>
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
            background: `linear-gradient(200deg, #7557B8, ${t.accent} 52%, #E45B76 82%)`,
            borderColor: `${t.gold}90`,
            transform: stage >= 1 ? "rotateX(-118deg)" : "rotateX(0deg)",
            transition: "transform 1s cubic-bezier(.7,0,.3,1)",
            transformStyle: "preserve-3d",
          }}
        >
          <span className="absolute inset-x-0 bottom-0 h-2.5" style={{ background: `linear-gradient(90deg, ${t.gold}, #F2A65A, #E45B76, ${t.gold})` }} />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-script text-3xl" style={{ color: "#FFE19A" }}>
            {template.name.split(" ").map((w) => w[0]).join("")}
          </span>
        </div>
      </div>

      {stage === 0 && (
        <button type="button" onClick={() => setStage(1)}
          className="absolute bottom-24 rounded-full border px-9 py-4 font-sans text-[12px] font-medium uppercase tracking-luxe shadow-xl transition-transform hover:scale-105"
          style={{ background: `linear-gradient(135deg, ${t.gold}, #E45B76, #7557B8)`, borderColor: "#ffffff80", color: "#fffaf5", boxShadow: `0 12px 40px ${t.gold}55` }}>
          Open the Ring Box
        </button>
      )}
      <Hint t={{ ...t, gold: "#F2A65A" }}>A promise, kept forever</Hint>
    </div>
  );
}

/* ------------------------------ 6 · wax seal ------------------------------ */

function SealOpening({ t, template, data, onComplete }: { t: TemplateTheme; template: WeddingTemplate; data?: InvitationData; onComplete: () => void }) {
  const [stage, setStage] = useState<0 | 1 | 2 | 3>(0);
  const reduce = useReducedMotion();
  const colors = ["#C9A34E", "#E8D39A", "#8C1F35", "#B66A5D", t.gold];
  const rays = Array.from({ length: 10 }, (_, i) => i * 36);
  const confetti = Array.from({ length: 14 }, (_, i) => ({
    left: 10 + ((i * 47) % 80),
    top: 10 + ((i * 29) % 68),
    color: colors[i % colors.length],
    rotate: (i * 31) % 80 - 40,
  }));
  const fragments = Array.from({ length: 10 }, (_, i) => {
    const angle = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const distance = 42 + (i % 3) * 11;
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance - 8,
      rotate: (i % 2 ? 1 : -1) * (22 + (i % 4) * 13),
      color: colors[(i + 1) % colors.length],
    };
  });
  const sealInitials = data?.couple
    ? `${data.couple.groom?.[0] ?? ""}${data.couple.bride?.[0] ?? ""}`.toUpperCase()
    : "WS";

  useEffect(() => {
    if (stage === 1) {
      const id = window.setTimeout(() => setStage(2), reduce ? 120 : 500);
      return () => window.clearTimeout(id);
    }
    if (stage === 2) {
      const id = window.setTimeout(() => setStage(3), reduce ? 180 : 900);
      return () => window.clearTimeout(id);
    }
    if (stage === 3) {
      const id = window.setTimeout(onComplete, reduce ? 250 : 1600);
      return () => window.clearTimeout(id);
    }
  }, [stage, onComplete, reduce]);

  return (
    <div
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      style={{
        background: "radial-gradient(circle at 50% 42%, #C9A34E2E 0%, transparent 24%), radial-gradient(circle at 18% 22%, #8C1F3533 0%, transparent 32%), radial-gradient(circle at 86% 76%, #650D2233 0%, transparent 34%), #2A020B",
        perspective: 1600,
      }}
    >
      <div className="bg-grain absolute inset-0 opacity-45" />
      <ClassicRoyalFrame />
      <div className="pointer-events-none absolute inset-x-0 top-[14%] z-10 text-center">
        <p className="font-sans text-[10px] uppercase tracking-[0.28em] text-[#E8D39A]">A royal invitation awaits</p>
      </div>

      <div className="relative z-10 h-[min(68vh,460px)] w-auto max-w-[calc(100vw-2rem)] aspect-[0.72] sm:h-[min(80vh,1080px)] sm:aspect-[0.62]" style={{ transformStyle: "preserve-3d" }}>
        {/* celebratory rays and confetti make the seal feel alive before it is opened */}
        {rays.map((angle, i) => (
          <motion.span
            key={`ray-${angle}`}
            className="pointer-events-none absolute top-[58%] left-1/2 h-1 w-16 origin-left rounded-full sm:w-24"
            style={{ background: colors[i % colors.length], rotate: `${angle}deg`, transformOrigin: "left center" }}
            initial={{ opacity: 0, scaleX: 0 }}
            animate={stage >= 1 ? { opacity: [0, 0.8, 0], scaleX: [0, 1, 1.15] } : { opacity: 0, scaleX: 0 }}
            transition={{ duration: reduce ? 0.3 : 1.1, delay: i * 0.025, ease: "easeOut" }}
          />
        ))}
        {stage >= 1 && confetti.map((piece, i) => (
          <motion.span
            key={`confetti-${i}`}
            className="pointer-events-none absolute z-30 h-2 w-1.5 rounded-full"
            style={{ left: `${piece.left}%`, top: `${piece.top}%`, background: piece.color, rotate: `${piece.rotate}deg` }}
            initial={{ opacity: 0, y: 16, scale: 0.4 }}
            animate={{ opacity: [0, 1, 0], y: [16, -20 - (i % 3) * 10, 8], scale: [0.4, 1, 0.7] }}
            transition={{ duration: reduce ? 0.35 : 1.25, delay: (i % 5) * 0.04, ease: "easeOut" }}
          />
        ))}

        {/* cracks spread from the seal before the wax fragments fly away */}
        <motion.svg
          viewBox="0 0 100 100"
          className="pointer-events-none absolute top-[58%] left-1/2 z-[35] h-28 w-28 -translate-x-1/2 -translate-y-1/2"
          fill="none"
          stroke="#E8D39A"
          strokeLinecap="round"
          strokeWidth="1.7"
          initial={{ opacity: 0 }}
          animate={{ opacity: stage >= 1 ? 1 : 0 }}
          aria-hidden="true"
        >
          {[
            "M50 46 40 34 43 22",
            "M50 46 62 35 61 20",
            "M50 46 68 50 82 42",
            "M50 46 61 61 69 78",
            "M50 46 38 61 27 76",
            "M50 46 31 49 16 40",
          ].map((path, i) => (
            <motion.path
              key={path}
              d={path}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: stage >= 2 ? 1 : 0.55, opacity: stage >= 1 ? 1 : 0 }}
              transition={{ duration: reduce ? 0.15 : 0.32, delay: reduce ? 0 : i * 0.035, ease: "easeOut" }}
            />
          ))}
        </motion.svg>

        {/* envelope body */}
        <motion.div
          className="absolute inset-0 overflow-hidden rounded-[22px] border shadow-2xl"
          style={{
            background: "linear-gradient(145deg, #FFF7E8 0%, #F4E6C8 48%, #FFF7E8 100%)",
            borderColor: `${t.gold}90`,
            color: t.ink,
            boxShadow: "0 28px 70px #12000899, 0 0 0 8px #E8D39A26 inset, 0 0 0 2px #C9A34E88",
          }}
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: reduce ? 0.2 : 1, delay: reduce ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="pointer-events-none absolute inset-3 rounded-[16px] border" style={{ borderColor: `${t.gold}55` }} />
          <span className="pointer-events-none absolute inset-5 rounded-[13px] border" style={{ borderColor: "#8C1F3535" }} />
          <span className="absolute inset-x-0 top-0 h-2" style={{ background: "linear-gradient(90deg, #C9A34E, #E8D39A, #C9A34E)" }} />
          <span className="absolute inset-x-0 bottom-0 h-2" style={{ background: "linear-gradient(90deg, #C9A34E, #E8D39A, #C9A34E)" }} />

          {/* letter rising out of the envelope */}
          <motion.div
            className="absolute inset-x-5 top-5 bottom-5 overflow-hidden rounded-[15px] border shadow-lg"
            style={{ background: "linear-gradient(145deg, #FFF7E8, #F4E6C8 54%, #FFF7E8)", borderColor: "#C9A34E99", color: "#3B0A17" }}
            initial={{ y: 40, opacity: 0, scale: 0.96 }}
            animate={stage >= 3 ? { y: "-12%", opacity: 1, scale: 1, rotate: -0.5 } : { y: 40, opacity: 1, scale: 0.96, rotate: 0 }}
            transition={{ duration: reduce ? 0.2 : 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <SealInvitationCard t={t} data={data} />
          </motion.div>
          {stage >= 3 && (
            <motion.span
              className="pointer-events-none absolute inset-y-0 left-0 z-30 w-1/3 skew-x-[-18deg] bg-gradient-to-r from-transparent via-[#FFF0B855] to-transparent blur-md"
              initial={{ x: "-140%", opacity: 0 }}
              animate={{ x: "430%", opacity: [0, 1, 0] }}
              transition={{ duration: reduce ? 0.2 : 1.1, ease: "easeInOut" }}
            />
          )}
        </motion.div>

        {/* colourful envelope flap */}
        <motion.div
          className="absolute inset-x-0 top-0 z-10 h-1/2 origin-top"
          animate={{ rotateX: stage >= 2 ? -180 : 0 }}
          transition={{ duration: reduce ? 0.2 : 0.95, ease: [0.7, 0, 0.3, 1] }}
          style={{ transformStyle: "preserve-3d" }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(145deg, #8A1734 0%, #650D22 42%, #4A0715 78%, #2A020B 100%)",
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              filter: "saturate(1.08)",
            }}
          />
          <span className="pointer-events-none absolute inset-x-[16%] top-3 h-px" style={{ background: "#E8D39A99" }} />
          <div className="pointer-events-none absolute inset-x-0 top-5 z-10 flex flex-col items-center text-[#E8D39A]">
            <CrownEmblem className="h-14 w-28" />
            <div className="mt-1 flex items-center gap-2">
              <span className="h-px w-14 bg-gradient-to-r from-transparent to-[#E8D39A]" />
              <Ornament style="royal" className="h-3 w-32" />
              <span className="h-px w-14 bg-gradient-to-l from-transparent to-[#E8D39A]" />
            </div>
          </div>
          <svg viewBox="0 0 100 50" className="pointer-events-none absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden="true">
            <path d="M1 1H99L50 50Z" fill="none" stroke="#E8D39A" strokeOpacity="0.9" strokeWidth="0.7" />
          </svg>
        </motion.div>

        {/* the wax seal breaks into several soft-edged pieces */}
        {stage >= 1 && fragments.map((piece, i) => (
          <motion.span
            key={`fragment-${i}`}
            className="pointer-events-none absolute top-[58%] left-1/2 z-30 h-5 w-4 -translate-x-1/2 -translate-y-1/2 rounded-[45%_55%_48%_52%]"
            style={{ background: `linear-gradient(135deg, #E8D39A, ${piece.color} 58%, #4A0715)`, boxShadow: `0 2px 6px ${piece.color}66` }}
            initial={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
            animate={{ opacity: 0, x: piece.x, y: piece.y, rotate: piece.rotate, scale: 0.65 }}
            transition={{ duration: reduce ? 0.2 : 0.68 + (i % 3) * 0.08, delay: reduce ? 0 : (i % 4) * 0.025, ease: "easeOut" }}
          />
        ))}

        {/* satin ribbon tails sit behind the seal, like a real keepsake envelope */}
        <svg viewBox="0 0 120 150" className="pointer-events-none absolute top-[58%] left-1/2 z-[15] h-32 w-28 -translate-x-1/2 -translate-y-[8%]" aria-hidden="true">
          <defs>
            <linearGradient id="wax-ribbon-left" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor="#8A1734" />
              <stop offset="0.65" stopColor="#650D22" />
              <stop offset="1" stopColor="#2A020B" />
            </linearGradient>
            <linearGradient id="wax-ribbon-right" x1="1" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#8A1734" />
              <stop offset="0.65" stopColor="#650D22" />
              <stop offset="1" stopColor="#2A020B" />
            </linearGradient>
          </defs>
          <path d="M48 30 58 35 42 132 19 115 6 140 22 43Z" fill="url(#wax-ribbon-left)" stroke="#C9A34E" strokeWidth="2" />
          <path d="M72 30 62 35 78 132 101 115 114 140 98 43Z" fill="url(#wax-ribbon-right)" stroke="#C9A34E" strokeWidth="2" />
          <path d="M53 37h14v48H53z" fill="#8A1734" stroke="#E8D39A" strokeWidth="1.5" />
        </svg>

        {/* wax seal */}
        <motion.button
          type="button"
          onClick={() => stage === 0 && setStage(1)}
          whileHover={stage === 0 && !reduce ? { scale: 1.08 } : undefined}
          whileTap={stage === 0 ? { scale: 0.94 } : undefined}
          className="absolute top-[58%] left-1/2 z-20 flex h-[98px] w-[98px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full p-0 shadow-2xl sm:h-[132px] sm:w-[132px]"
          style={{ filter: "drop-shadow(0 14px 18px #12000899)" }}
          initial={{ opacity: 0, scale: 0.85, filter: "blur(4px)" }}
          animate={stage === 0 ? { opacity: 1, scale: [0.85, 1.06, 1, 1.02, 1], rotate: [0, 0, -1, 1, 0], filter: ["blur(4px)", "blur(0px)"] } : stage === 1 ? { scale: [1, 1.18, 0.15], rotate: [0, 14, 45], opacity: [1, 1, 0], filter: "blur(0px)" } : { opacity: 0 }}
          transition={stage === 0 ? { duration: reduce ? 0.2 : 1.4, delay: reduce ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] } : { duration: reduce ? 0.2 : 0.55, ease: "easeIn" }}
          aria-label="Break the colourful wax seal"
        >
          <WaxSealMark initials={sealInitials || "WS"} />
        </motion.button>
      </div>

      {stage === 0 && (
        <motion.button
          type="button"
          onClick={() => stage === 0 && setStage(1)}
          whileTap={{ scale: 0.97 }}
          className="absolute bottom-7 left-1/2 z-40 inline-flex min-h-12 w-[calc(100vw-2rem)] max-w-[360px] -translate-x-1/2 items-center justify-center gap-2 rounded-xl border px-5 py-3.5 font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-[#FFF3D1] shadow-xl transition-transform hover:scale-[1.03] sm:bottom-10 sm:w-auto sm:max-w-none sm:px-9 sm:text-[11px] sm:tracking-luxe"
          style={{ background: "linear-gradient(135deg, #4E0A24, #8F1239 52%, #5E1124)", borderColor: "#C9A34E", boxShadow: "0 10px 32px #12000899, 0 0 0 3px #C9A34E22" }}
          initial={{ opacity: 0, y: 18 }}
          animate={stage === 0 ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: reduce ? 0.2 : 0.7, delay: reduce ? 0 : 1.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <Sparkles className="h-4 w-4" style={{ color: "#E8D39A" }} strokeWidth={1.5} />
          Break the colourful wax seal
          <Sparkles className="h-4 w-4" style={{ color: "#E8D39A" }} strokeWidth={1.5} />
        </motion.button>
      )}
    </div>
  );
}

/** Detailed engraved corner motif used by the chosen classic reference style. */
function ClassicFiligreeCorner({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 116C5 62 29 23 83 9" strokeWidth="1.6" />
      <path d="M12 116c4-45 27-78 70-94" strokeWidth="0.9" opacity="0.7" />
      <path d="M4 92c19 4 37-5 43-23 5-14-5-28-19-23-10 3-14 14-8 22 5 6 14 5 18-1" strokeWidth="1.25" />
      <path d="M20 78c8 2 16-2 18-10 2-6-2-12-8-11-6 0-9 7-5 11 3 3 7 2 9-1" strokeWidth="0.8" />
      <path d="M32 53c-7-4-9-12-4-17 5-5 13-2 14 4 1 6-4 10-9 8" strokeWidth="1" />
      <path d="M47 36c-4-8-1-16 6-18 7-2 12 5 9 11-2 6-9 7-13 3" strokeWidth="1.1" />
      <path d="M62 24c-1-8 5-14 12-13 6 1 9 8 5 12-4 5-11 4-14 0" strokeWidth="0.9" />
      <path d="M22 97c11-1 20 3 24 12-11 2-20-2-24-12Z" strokeWidth="1" />
      <path d="M39 76c10-1 18 3 22 12-10 2-18-2-22-12Z" strokeWidth="0.9" />
      <path d="M54 53c9-1 17 3 21 11-9 2-17-2-21-11Z" strokeWidth="0.9" />
      <path d="M69 31c8-1 15 2 19 9-8 2-15-1-19-9Z" strokeWidth="0.8" />
      <path d="M6 111h30M9 103h21M13 95h14" strokeWidth="1" />
      <circle cx="20" cy="96" r="2.4" fill="currentColor" stroke="none" />
      <circle cx="40" cy="75" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="55" cy="53" r="1.7" fill="currentColor" stroke="none" />
      <circle cx="71" cy="31" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Classic engraved stationery frame used by the chosen Royal Wax Seal style. */
function ClassicRoyalFrame() {
  return (
    <motion.div
      className="pointer-events-none absolute inset-3 z-0 sm:inset-6"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden="true"
    >
      <span className="absolute inset-0 rounded-[18px] border border-[#C9A34E99] shadow-[0_0_18px_#C9A34E22_inset]" />
      <span className="absolute inset-2 rounded-[16px] border border-[#E8D39A55]" />
      <span className="absolute inset-5 rounded-[12px] border border-[#C9A34E66]" />
      <span className="absolute inset-7 rounded-[10px] border border-[#E8D39A2E]" />
      <ClassicFiligreeCorner className="absolute left-0 top-0 h-28 w-28 text-[#E8D39A] sm:h-40 sm:w-40" />
      <ClassicFiligreeCorner className="absolute right-0 top-0 h-28 w-28 -scale-x-100 text-[#E8D39A] sm:h-40 sm:w-40" />
      <ClassicFiligreeCorner className="absolute bottom-0 left-0 h-28 w-28 -scale-y-100 text-[#C9A34E] sm:h-40 sm:w-40" />
      <ClassicFiligreeCorner className="absolute right-0 bottom-0 h-28 w-28 -scale-100 text-[#C9A34E] sm:h-40 sm:w-40" />
      <span className="absolute top-7 bottom-7 left-5 w-px bg-gradient-to-b from-transparent via-[#C9A34E66] to-transparent sm:left-7" />
      <span className="absolute top-7 right-5 bottom-7 w-px bg-gradient-to-b from-transparent via-[#C9A34E66] to-transparent sm:right-7" />
      <span className="absolute inset-x-24 top-1 h-px bg-gradient-to-r from-transparent via-[#E8D39A] to-transparent" />
      <span className="absolute inset-x-24 bottom-1 h-px bg-gradient-to-r from-transparent via-[#E8D39A] to-transparent" />
      <Ornament style="royal" className="absolute top-4 left-1/2 h-4 w-36 -translate-x-1/2 text-[#E8D39A]" />
      <Ornament style="royal" className="absolute bottom-4 left-1/2 h-4 w-36 -translate-x-1/2 text-[#C9A34E]" />
    </motion.div>
  );
}

function CrownEmblem({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 76" className={className} fill="none" aria-hidden="true">
      <path d="M14 47 8 12l28 21L60 5l24 28 28-21-6 35Z" fill="#E8D39A" stroke="#C9A34E" strokeWidth="2" strokeLinejoin="round" />
      <path d="M19 45h82l-5 14H24Z" fill="#C9A34E" stroke="#F7E8B4" strokeWidth="1.6" />
      <path d="M25 52h70" stroke="#650D22" strokeOpacity="0.72" strokeWidth="2" />
      <path d="M29 59h62" stroke="#E8D39A" strokeWidth="1.5" opacity="0.8" />
      {Array.from({ length: 9 }, (_, i) => <circle key={`crown-bead-${i}`} cx={29 + i * 7.75} cy="46" r="1.7" fill="#FFF4CB" stroke="#C9A34E" strokeWidth="0.7" />)}
      <circle cx="60" cy="8" r="4" fill="#8C1F35" stroke="#E8D39A" strokeWidth="1.6" />
      <circle cx="36" cy="32" r="3" fill="#8C1F35" stroke="#E8D39A" strokeWidth="1.2" />
      <circle cx="84" cy="32" r="3" fill="#8C1F35" stroke="#E8D39A" strokeWidth="1.2" />
      <circle cx="22" cy="27" r="2" fill="#650D22" stroke="#E8D39A" strokeWidth="1" />
      <circle cx="98" cy="27" r="2" fill="#650D22" stroke="#E8D39A" strokeWidth="1" />
      <path d="M48 19c6-5 18-5 24 0" stroke="#FFF4CB" strokeOpacity="0.75" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function WaxSealMark({ initials }: { initials: string }) {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
      <defs>
        <radialGradient id="wax-ruby" cx="30%" cy="20%" r="85%">
          <stop offset="0" stopColor="#E8D39A" />
          <stop offset="0.16" stopColor="#B32649" />
          <stop offset="0.5" stopColor="#650D22" />
          <stop offset="1" stopColor="#2A020B" />
        </radialGradient>
        <linearGradient id="wax-edge" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#F7E8B4" />
          <stop offset="0.22" stopColor="#C9A34E" />
          <stop offset="0.58" stopColor="#8C1F35" />
          <stop offset="1" stopColor="#3A0612" />
        </linearGradient>
      </defs>
      <path
        d="M50 3c5-1 8 5 13 4 5-2 8 4 13 5 6 0 6 7 11 9 6 2 3 8 8 12 4 4-1 9 2 14 3 5-3 9-1 14 1 6-5 8-5 13-1 6-7 5-8 10-1 6-8 7-11 11-4 5-10 1-14 5-5 3-8-3-13 0-5 3-8-4-13-3-6 1-7-6-12-6-6 0-7-7-12-8-6-1-5-8-9-11-5-4 0-9-2-14-3-5 4-9 2-14-1-6 5-9 4-14 0-6 7-7 8-12 2-6 8-8 10-13 4-5 9-2 14-5 5-3 8 3 13 2Z"
        fill="url(#wax-ruby)"
        stroke="url(#wax-edge)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M50 16c18 0 33 14 33 33S68 82 50 82 17 68 17 49s15-33 33-33Z" fill="none" stroke="#F6E5A9" strokeOpacity="0.75" strokeWidth="1.4" />
      <circle cx="50" cy="49" r="27" fill="#650D22" stroke="#C9A34E" strokeWidth="2" />
      <circle cx="50" cy="49" r="23" fill="none" stroke="#E8D39A" strokeOpacity="0.5" strokeWidth="1" />
      <path d="M50 58c-2-3-13-9-13-16 0-5 6-8 10-3l3 3 3-3c4-5 10-2 10 3 0 7-11 13-13 16Z" fill="#E8D39A" stroke="#FFF3C9" strokeWidth="1" />
      <text x="50" y="76" textAnchor="middle" fill="#E8D39A" fontFamily="Georgia, serif" fontSize="13" fontWeight="700" letterSpacing="2">{initials}</text>
      <ellipse cx="36" cy="27" rx="15" ry="5" transform="rotate(-25 36 27)" fill="#fff" fillOpacity="0.22" />
      <path d="M21 47c1-13 10-23 21-28" stroke="#fff" strokeOpacity="0.28" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** The first page inside the envelope mirrors the tall, ornate invitation card. */
function SealInvitationCard({ t, data }: { t: TemplateTheme; data?: InvitationData }) {
  const couple = data?.couple ?? {
    groom: "Aarav",
    bride: "Meera",
    monogram: "A & M",
    familiesLine: "Together with their families",
    inviteLine: "invite you to celebrate the beginning of their forever",
  };
  const photos = data?.photos ?? {};
  const date = data?.dateLabel ?? "Monday, 14 December 2026";
  const venue = data?.venue ?? { name: "Grand Palace", city: "Chennai, Tamil Nadu" };

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden px-4 py-8 text-center sm:py-12">
      <span className="pointer-events-none absolute inset-2 rounded-[12px] border" style={{ borderColor: `${t.gold}60` }} />
      <CornerFlourish className="pointer-events-none absolute -left-2 -top-2 h-14 w-14" style={{ color: t.gold }} />
      <CornerFlourish className="pointer-events-none absolute -right-2 -top-2 h-14 w-14 -scale-x-100" style={{ color: t.gold }} />
      <CornerFlourish className="pointer-events-none absolute -bottom-2 -left-2 h-14 w-14 -scale-y-100" style={{ color: "#8C1F35" }} />
      <CornerFlourish className="pointer-events-none absolute -right-2 -bottom-2 h-14 w-14 -scale-100" style={{ color: "#8C1F35" }} />

      <p className="relative font-sans text-[8px] uppercase tracking-[0.22em]" style={{ color: t.accent }}>You are invited</p>
      <p className="relative mt-1 max-w-full break-words font-sans text-[7px] uppercase tracking-[0.18em]" style={{ color: t.ink, opacity: 0.72 }}>
        {couple.familiesLine}
      </p>
      <Ornament style={t.ornament} className="relative mt-2 h-3 w-28 max-w-full" />
      <Monogram text={couple.monogram || `${couple.groom[0] ?? "A"} & ${couple.bride[0] ?? "M"}`} className="relative mt-2 h-10 w-10 text-[10px]" style={{ color: t.gold, borderColor: `${t.gold}90` }} />

      <div className="relative mt-3 flex items-start justify-center gap-3">
        <SealPortrait src={photos.groom} name={couple.groom} theme={t} />
        <span className="mt-7 font-display text-lg italic" style={{ color: t.gold }}>&</span>
        <SealPortrait src={photos.bride} name={couple.bride} theme={t} />
      </div>

      <div className="relative mt-2 max-w-full leading-[0.9]">
        <p className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 font-script text-[clamp(2.5rem,10vw,3.4rem)] opacity-20" style={{ color: "#A42C4F" }}>Unveiled</p>
        <p className="relative break-words font-script text-[clamp(2rem,9vw,3rem)]" style={{ color: t.script }}>{couple.groom}</p>
        <p className="my-1 font-display text-[10px] italic tracking-wide-2" style={{ color: t.gold }}>&</p>
        <p className="break-words font-script text-[clamp(2rem,9vw,3rem)]" style={{ color: t.script }}>{couple.bride}</p>
      </div>
      <Ornament style={t.ornament} className="relative mt-3 h-3 w-28 max-w-full" />
      <p className="relative mt-2 max-w-[220px] font-sans text-[8px] uppercase leading-relaxed tracking-[0.14em]" style={{ color: t.ink, opacity: 0.82 }}>
        {couple.inviteLine}
      </p>
      <div className="relative mt-3 max-w-full border-y px-3 py-2" style={{ borderColor: `${t.gold}55` }}>
        <p className="break-words font-sans text-[8px] uppercase tracking-[0.14em]" style={{ color: t.ink }}>{date}</p>
        <p className="mt-1 break-words font-sans text-[8px] uppercase tracking-[0.14em]" style={{ color: t.accent }}>{venue.name} · {venue.city}</p>
      </div>
      <p className="relative mt-2 font-script text-xl" style={{ color: "#8C1F35" }}>The royal celebration begins</p>

      {/* Subtle layered rose blooms keep the bottom of the card rich without
          competing with the couple's names. */}
      <div className="pointer-events-none absolute -bottom-8 -left-5 h-24 w-24 rounded-full bg-[#8C1F35]/20 blur-xl" />
      <div className="pointer-events-none absolute -right-5 -bottom-8 h-24 w-24 rounded-full bg-[#C9A34E]/20 blur-xl" />
      <span className="pointer-events-none absolute bottom-2 left-8 h-5 w-5 rounded-full bg-[#8C1F35]/65" />
      <span className="pointer-events-none absolute right-8 bottom-2 h-5 w-5 rounded-full bg-[#B66A5D]/65" />
    </div>
  );
}

function SealPortrait({ src, name, theme }: { src?: string; name: string; theme: TemplateTheme }) {
  const initials = name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return (
    <figure className="flex w-[62px] flex-col items-center gap-1">
      <span className="flex h-[62px] w-[62px] items-center justify-center overflow-hidden rounded-full border-2 bg-gradient-to-br from-[#C9A34E] via-[#8C1F35] to-[#4A0715]" style={{ borderColor: theme.gold, boxShadow: `0 0 0 3px ${theme.gold}22` }}>
        {src ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={src} alt={name} className="h-full w-full object-cover" />
        ) : (
          <span className="font-display text-lg text-white">{initials}</span>
        )}
      </span>
      <figcaption className="max-w-full truncate font-sans text-[7px] uppercase tracking-[0.12em]" style={{ color: theme.accent }}>{name}</figcaption>
    </figure>
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
  const lanternColors = ["#F2A65A", "#E45B76", "#43A59E"];

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: `linear-gradient(180deg, #070A1D 0%, #392252 44%, ${t.bg} 90%)` }}>
      <div className="pointer-events-none absolute top-[12%] right-[16%] h-20 w-20 rounded-full bg-[#FFF2C680] shadow-[0_0_80px_#FFF2C650]" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 top-1/3 h-56 bg-gradient-to-b from-[#7557B822] to-transparent" aria-hidden="true" />
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
              style={{ background: `linear-gradient(180deg, #FFF2B8, ${lanternColors[i]}, #7557B8)`, borderColor: `${lanternColors[i]}cc`, boxShadow: `0 0 30px ${lanternColors[i]}aa` }}>
              <span className="absolute inset-x-3 top-2 bottom-2 rounded-[45%] animate-shimmer" style={{ background: `radial-gradient(circle at 50% 65%, #fff6d8, ${lanternColors[i]}88 35%, transparent 70%)`, animationDuration: "1.8s" }} />
            </div>
          </div>
        </motion.div>
      ))}

      {!released && (
        <button type="button" onClick={() => setReleased(true)}
          className="absolute bottom-20 left-1/2 z-10 -translate-x-1/2 rounded-full border px-9 py-4 font-sans text-[12px] font-medium uppercase tracking-luxe shadow-xl transition-transform hover:scale-105"
          style={{ background: `linear-gradient(135deg, #F2A65A, #E45B76, #7557B8)`, borderColor: "#FFF2B880", color: "#fffaf5", boxShadow: "0 12px 40px #7557B855" }}>
          Release the Lanterns
        </button>
      )}
      <Hint t={{ ...t, gold: "#F2A65A" }}>Send a wish into the night</Hint>
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
    const colors = ["#F2A65A", "#E45B76", "#43A59E", "#7557B8", t.gold, "#FFF2B8", "#ffffff"];
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
    <div className="absolute inset-0 overflow-hidden" style={{ background: `radial-gradient(circle at 50% 30%, #7557B833 0%, transparent 32%), linear-gradient(180deg, #05060f 0%, #17112d 58%, ${t.bg} 100%)` }}>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-1/3 bg-gradient-to-t from-[#E45B7626] to-transparent" />
      <svg viewBox="0 0 800 180" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-32 w-full opacity-80" aria-hidden="true">
        <path d="M0 180V112h48V88h30v58h36V74h52v72h28V99h52v47h34V62h38v84h32V92h52v54h32V78h56v68h42V50h38v96h36V106h54v40h42V72h44v74h48v34Z" fill="#090817" stroke="#F2A65A77" strokeWidth="2" />
      </svg>
      <div className="absolute inset-x-0 top-[18%] z-10 text-center">
        <p className="font-sans text-[10px] uppercase tracking-[0.28em] text-[#F2A65A]">A celebration in the sky</p>
        <p className="mt-3 max-w-full break-words font-script text-[clamp(2.5rem,12vw,3rem)]" style={{ color: "#FFF2B8" }}>{template.name}</p>
      </div>
      <canvas ref={canvasRef} className="absolute inset-0 z-0 h-full w-full" />
      {!launched && (
        <button type="button" onClick={() => setLaunched(true)}
          className="absolute bottom-20 left-1/2 z-10 -translate-x-1/2 rounded-full border px-9 py-4 font-sans text-[12px] font-medium uppercase tracking-luxe shadow-xl transition-transform hover:scale-105"
          style={{ background: "linear-gradient(135deg, #F2A65A, #E45B76, #7557B8)", borderColor: "#FFF2B880", color: "#fffaf5", boxShadow: "0 12px 40px #7557B855" }}>
          Light the Fireworks
        </button>
      )}
      <Hint t={{ ...t, gold: "#F2A65A" }}>Celebrate the beginning</Hint>
    </div>
  );
}
