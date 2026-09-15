"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { TemplateTheme } from "@/lib/types";

export default function WaterBridge({ theme }: { theme: TemplateTheme }) {
  const reduce = useReducedMotion();
  return (
    <section className="relative h-[430px] overflow-hidden bg-[#140725] sm:h-[500px]" aria-label="Water bridge transition">
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 18%, #C8960A38, transparent 42%), linear-gradient(180deg, #241044, #11051E 72%)" }} />
      <div className="absolute top-[13%] left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-[#E8D39A]/20 blur-3xl" />
      <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-[#0a0715] via-[#27134d99] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-[24%] h-24" aria-hidden="true">
        <Wave color="#E8D39A" opacity={0.34} delay={0} />
        <Wave color="#C8960A" opacity={0.28} delay={0.4} reverse />
        <Wave color="#F8F2E4" opacity={0.2} delay={0.8} />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-64" aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => (
          <motion.div key={i} className="absolute bottom-0 h-16 w-32 rounded-[50%] border-t" style={{ left: `${8 + i * 17}%`, borderColor: `${i % 2 ? "#E8D39A" : "#C8960A"}55`, opacity: 0.42 - i * 0.03 }} animate={reduce ? undefined : { y: [0, -8, 0], scaleX: [1, 1.18, 1] }} transition={{ duration: 4 + i * 0.35, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }} />
        ))}
      </div>
      <Swan side="left" theme={theme} reduce={reduce} />
      <Swan side="right" theme={theme} reduce={reduce} />
      <div className="absolute inset-x-0 bottom-10 text-center">
        <p className="font-script text-4xl text-[#E8D39A] sm:text-5xl">Two paths, one forever</p>
        <span className="mt-3 inline-block h-px w-28" style={{ background: `linear-gradient(90deg, transparent, ${theme.gold}, transparent)` }} />
      </div>
    </section>
  );
}

function Wave({ color, opacity, delay, reverse = false }: { color: string; opacity: number; delay: number; reverse?: boolean }) {
  return (
    <motion.svg viewBox="0 0 900 100" preserveAspectRatio="none" className="absolute inset-x-0 h-20 w-full" style={{ color, opacity }} initial={{ x: reverse ? "-8%" : "0%" }} animate={{ x: reverse ? "0%" : "-8%" }} transition={{ duration: 8, repeat: Infinity, repeatType: "mirror", ease: "easeInOut", delay }}>
      <path d="M0 52C130 6 220 96 350 52s220 44 350 0 180-20 200 0" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M0 70C130 24 220 118 350 70s220 44 350 0 180-20 200 0" fill="none" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1" />
    </motion.svg>
  );
}

function Swan({ side, theme, reduce }: { side: "left" | "right"; theme: TemplateTheme; reduce: boolean | null }) {
  const left = side === "left";
  return (
    <motion.div
      className="absolute bottom-32 z-10"
      style={{ left: left ? "18%" : "72%" }}
      initial={{ x: left ? -80 : 80, opacity: 0 }}
      animate={{ x: 0, opacity: 0.86 }}
      transition={{ duration: reduce ? 0.2 : 2.2, delay: left ? 0.5 : 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <svg viewBox="0 0 120 80" className={`h-20 w-28 ${left ? "" : "-scale-x-100"}`} fill="none" aria-hidden="true">
        <path d="M28 56c11-20 24-30 32-30 5 0 7 3 6 8-2 8-10 13-15 16 17-8 35-5 46 3-14 9-34 11-52 9-9-1-15-3-17-6Z" fill="#F8F2E4" stroke="#E8D39A" strokeWidth="1.3" />
        <path d="M56 29c-4-15 2-27 14-27 7 0 12 4 13 9-9-3-16 1-18 10" stroke="#F8F2E4" strokeWidth="6" strokeLinecap="round" />
        <circle cx="82" cy="8" r="2" fill={theme.gold} />
        <path d="M30 66c20 9 45 7 66-1" stroke="#E8D39A" strokeOpacity="0.5" strokeWidth="1" />
      </svg>
    </motion.div>
  );
}
