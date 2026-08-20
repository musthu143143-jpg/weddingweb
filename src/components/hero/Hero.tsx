"use client";

import Image from "next/image";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { ChevronDown, RotateCcw } from "lucide-react";
import { useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Button, Monogram, Ornament, PetalField } from "@/components/ui/core";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function Hero() {
  return (
    <section className="relative flex min-h-svh items-center overflow-hidden bg-burgundy-deep text-ivory">
      {/* Ambient background */}
      <div className="absolute inset-0" aria-hidden="true">
        <Image
          src="/images/hero-mandap.jpg"
          alt=""
          fill
          priority
          className="object-cover object-center opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-burgundy-deep via-burgundy-deep/85 to-burgundy-deep/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-burgundy-deep via-transparent to-burgundy-deep/70" />
        <div className="absolute top-1/3 left-1/4 h-[480px] w-[480px] rounded-full bg-gold/12 blur-[120px]" />
        <div className="absolute inset-0 bg-grain opacity-50" />
      </div>
      <PetalField count={12} />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-16 px-5 pt-28 pb-24 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:pt-24">
        {/* Copy */}
        <div className="flex flex-col items-start">
          <motion.span
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease }}
            className="inline-flex items-center gap-3 font-sans text-[11px] uppercase tracking-luxe text-gold-soft"
          >
            <span className="h-px w-10 bg-gold-soft/60" /> Premium Digital Wedding Invitations
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 0.15, ease }}
            className="mt-6 font-display text-5xl leading-[1.02] font-medium sm:text-6xl lg:text-[4.6rem]"
          >
            Your Love Story,
            <span className="mt-2 block font-script text-6xl leading-[1.05] text-gold-gradient sm:text-7xl lg:text-[5.4rem]">
              Beautifully Invited.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.35, ease }}
            className="mt-7 max-w-lg font-sans text-[16px] leading-relaxed font-light text-ivory/75"
          >
            Create a wedding invitation that feels as unforgettable as the day itself. 3D openings,
            cinematic motion and timeless design — crafted for every kind of love story.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5, ease }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <Button href="/templates" variant="gold">Explore Invitations</Button>
            <Button href="/how-it-works" variant="outlineLight">See How It Works</Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.75 }}
            className="mt-10 flex flex-wrap gap-2.5"
          >
            {["3D", "Cinematic", "Luxury", "Traditional", "Minimal", "Destination"].map((c) => (
              <span key={c} className="rounded-full border border-ivory/20 px-4 py-1.5 font-sans text-[10px] uppercase tracking-wide-2 text-ivory/60">
                {c}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Interactive invitation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.3, ease }}
          className="relative mx-auto w-full max-w-[420px]"
        >
          <FloatingCard src="/images/garden.jpg" className="-left-10 top-6 hidden rotate-[-8deg] md:block" delay={0} />
          <FloatingCard src="/images/ocean.jpg" className="-right-8 bottom-10 hidden rotate-[7deg] md:block" delay={1.4} />
          <InteractiveInvitation />
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.a
        href="#emotional"
        aria-label="Scroll to learn more"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-ivory/50 transition-colors hover:text-gold-soft sm:flex"
      >
        <span className="font-sans text-[10px] uppercase tracking-luxe">Scroll</span>
        <ChevronDown className="h-4 w-4 animate-float-soft" strokeWidth={1.5} />
      </motion.a>
    </section>
  );
}

function FloatingCard({ src, className = "", delay }: { src: string; className?: string; delay: number }) {
  return (
    <div
      className={`absolute z-0 h-44 w-32 overflow-hidden rounded-xl border border-gold-soft/40 shadow-lux animate-float-soft ${className}`}
      style={{ animationDelay: `${delay}s` }}
      aria-hidden="true"
    >
      <Image src={src} alt="" fill className="object-cover" />
      <div className="absolute inset-0 bg-burgundy-deep/20" />
    </div>
  );
}

/* ---------------------- Interactive opening invitation --------------------- */

function InteractiveInvitation() {
  const reduce = useReducedMotion();
  const [opened, setOpened] = useState(false);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(my, { stiffness: 120, damping: 18 });
  const ry = useSpring(mx, { stiffness: 120, damping: 18 });

  function onMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    mx.set(px * 14);
    my.set(-py * 12);
  }
  function onLeave() {
    mx.set(0);
    my.set(0);
  }

  return (
    <div className="perspective-1200 relative z-10">
      <motion.div
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={{ rotateX: reduce ? 0 : rx, rotateY: reduce ? 0 : ry }}
        className="preserve-3d relative mx-auto aspect-[3/4] w-[300px] cursor-pointer select-none sm:w-[360px]"
        onClick={() => setOpened((o) => !o)}
        role="button"
        tabIndex={0}
        aria-pressed={opened}
        aria-label={opened ? "Close the sample invitation" : "Open the sample invitation"}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpened((o) => !o);
          }
        }}
      >
        {/* glow */}
        <div className="absolute -inset-8 rounded-full bg-gold/15 blur-3xl" aria-hidden="true" />

        {/* envelope back */}
        <div className="absolute inset-0 overflow-hidden rounded-[20px] border border-gold-soft/50 bg-gradient-to-b from-[#6d1329] to-[#470c1b] shadow-[0_40px_80px_-30px_rgb(0_0_0/0.7)]">
          <div className="absolute inset-0 bg-grain opacity-40" />
        </div>

        {/* letter */}
        <motion.div
          animate={{ y: opened ? "-38%" : "0%" }}
          transition={{ duration: reduce ? 0.2 : 1, delay: opened ? (reduce ? 0 : 0.35) : 0, ease }}
          className="absolute inset-x-4 top-4 bottom-4 z-10 flex flex-col items-center justify-start overflow-hidden rounded-[14px] border border-gold/50 bg-[#f6ecd8] px-6 pt-8 text-center text-burgundy shadow-inner"
        >
          <div className="absolute inset-0 bg-paper opacity-60" aria-hidden="true" />
          <p className="relative font-sans text-[9px] uppercase tracking-luxe text-maroon/80">Together with their families</p>
          <p className="relative mt-4 font-script text-[44px] leading-[0.95] text-burgundy sm:text-[52px]">Aarav</p>
          <span className="relative font-display text-lg italic text-gold">&</span>
          <p className="relative font-script text-[44px] leading-[0.95] text-burgundy sm:text-[52px]">Meera</p>
          <Ornament style="royal" className="relative mt-4 h-4 w-32 text-gold" />
          <p className="relative mt-4 font-sans text-[10px] uppercase tracking-wide-2 text-maroon">14 December 2026</p>
          <p className="relative mt-2 font-sans text-[9px] uppercase tracking-wide-2 text-maroon/70">The Royal Palace · Chennai</p>
          <p className="relative mt-4 font-display text-[13px] italic text-maroon/80">
            Request the honour of your presence
          </p>
        </motion.div>

        {/* front pocket */}
        <div className="absolute inset-x-0 bottom-0 z-20 h-[58%] rounded-b-[20px] border-t border-gold-soft/60 bg-gradient-to-b from-[#5e1124] to-[#3c0916]">
          <div className="absolute inset-x-0 top-0 h-px bg-gold-soft/70" />
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
            <Monogram text="A & M" className="h-14 w-14 text-[15px] text-gold-soft" />
            <p className="font-sans text-[10px] uppercase tracking-luxe text-gold-soft/90">The Wedding Of</p>
            <p className="font-script text-3xl text-ivory">Aarav & Meera</p>
            {!opened && (
              <span className="mt-1 inline-flex items-center gap-2 rounded-full border border-gold-soft/40 px-4 py-1.5 font-sans text-[9px] uppercase tracking-wide-2 text-gold-soft/90">
                <span className="h-1.5 w-1.5 animate-shimmer rounded-full bg-gold-soft" /> Tap to open
              </span>
            )}
          </div>
        </div>

        {/* flap */}
        <motion.div
          animate={{ rotateX: opened ? -178 : 0 }}
          transition={{ duration: reduce ? 0.2 : 0.9, ease }}
          className="absolute inset-x-0 top-0 z-30 h-[56%] origin-top"
          style={{ transformStyle: "preserve-3d" }}
          aria-hidden="true"
        >
          <div
            className="absolute inset-0 border-t border-gold-soft/50 bg-gradient-to-b from-[#7a1430] to-[#5e1124]"
            style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
          >
            <div className="absolute inset-0 bg-grain opacity-40" />
          </div>
          <motion.div
            animate={{ opacity: opened ? 0 : 1 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-2 left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full border border-gold-soft bg-[#470c1b] shadow-lg"
          >
            <span className="font-display text-[13px] tracking-wide text-gold-soft">A·M</span>
          </motion.div>
        </motion.div>
      </motion.div>

      <div className="mt-6 flex items-center justify-center">
        <button
          type="button"
          onClick={() => setOpened((o) => !o)}
          className="inline-flex items-center gap-2 font-sans text-[11px] uppercase tracking-wide-2 text-ivory/60 transition-colors hover:text-gold-soft"
        >
          <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.6} /> {opened ? "Close invitation" : "Open the invitation"}
        </button>
      </div>
    </div>
  );
}
