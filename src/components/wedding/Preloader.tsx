"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import type { InvitationData, TemplateTheme } from "@/lib/types";

export default function Preloader({ data, theme, onComplete }: { data: InvitationData; theme: TemplateTheme; onComplete: () => void }) {
  const reduce = useReducedMotion();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setReady(true);
      window.setTimeout(onComplete, reduce ? 120 : 650);
    }, reduce ? 180 : 1900);
    return () => window.clearTimeout(id);
  }, [onComplete, reduce]);

  return (
    <motion.div
      className="fixed inset-0 z-[90] flex items-center justify-center overflow-hidden bg-[#16071f] px-6 text-center"
      initial={{ opacity: 1 }}
      animate={{ opacity: ready ? 0 : 1 }}
      transition={{ duration: reduce ? 0.2 : 0.7, ease: [0.22, 1, 0.36, 1] }}
      aria-label="Opening wedding invitation"
    >
      <div className="absolute inset-0 bg-grain opacity-50" />
      <div className="absolute top-1/2 left-1/2 h-[min(80vw,520px)] w-[min(80vw,520px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C8960A]/10 blur-3xl" />
      <motion.div
        initial={{ opacity: 0, scale: 0.82 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: reduce ? 0.2 : 1, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex w-full max-w-sm flex-col items-center"
      >
        <motion.div
          initial={{ rotate: -80, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: reduce ? 0.2 : 1.1, ease: "easeOut" }}
          className="relative flex h-32 w-32 items-center justify-center rounded-full border border-[#C8960A] sm:h-40 sm:w-40"
          style={{ boxShadow: "0 0 0 8px #C8960A18, 0 0 0 14px #C8960A09, 0 0 60px #C8960A35" }}
        >
          <span className="absolute inset-3 rounded-full border border-[#E8D39A55]" />
          <span className="absolute inset-6 rounded-full border border-[#C8960A55]" />
          <Mandala className="absolute inset-7 h-auto w-auto text-[#E8D39A]" />
          <span className="relative font-display text-4xl text-[#E8D39A]">✦</span>
        </motion.div>
        <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.7 }} className="mt-8 font-script text-5xl text-[#E8D39A] sm:text-6xl">
          {data.couple.groom}
        </motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }} className="my-1 font-display text-xl italic text-[#C8960A]">weds</motion.p>
        <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.7 }} className="font-script text-5xl text-[#E8D39A] sm:text-6xl">
          {data.couple.bride}
        </motion.p>
        <motion.div initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }} transition={{ delay: 1.2, duration: 0.7 }} className="mt-6 h-px w-40" style={{ background: `linear-gradient(90deg, transparent, ${theme.gold}, transparent)` }} />
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.35 }} className="mt-4 font-sans text-[10px] uppercase tracking-[0.32em] text-[#E8D39A99]">
          {data.dateLabel}
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

function Mandala({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" aria-hidden="true">
      <circle cx="50" cy="50" r="45" stroke="currentColor" strokeOpacity="0.75" />
      <circle cx="50" cy="50" r="32" stroke="currentColor" strokeOpacity="0.55" />
      {Array.from({ length: 8 }, (_, i) => <ellipse key={i} cx="50" cy="22" rx="7" ry="20" transform={`rotate(${i * 45} 50 50)`} stroke="currentColor" strokeOpacity="0.65" />)}
      <path d="M50 36 64 50 50 64 36 50Z" stroke="currentColor" strokeOpacity="0.75" />
      <circle cx="50" cy="50" r="4" fill="currentColor" />
    </svg>
  );
}
