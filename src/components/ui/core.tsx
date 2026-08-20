"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";
import { useMemo } from "react";
import type { OrnamentStyle } from "@/lib/types";

/* ---------------------------------- Reveal --------------------------------- */

export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : y, filter: reduce ? "none" : "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once, margin: "-70px" }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* --------------------------------- Button ---------------------------------- */

type ButtonVariant = "gold" | "outline" | "outlineLight" | "dark" | "ivory" | "ghost";

export function Button({
  children,
  href,
  onClick,
  variant = "gold",
  className = "",
  type = "button",
  ariaLabel,
  disabled,
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: ButtonVariant;
  className?: string;
  type?: "button" | "submit";
  ariaLabel?: string;
  disabled?: boolean;
}) {
  const base =
    "group inline-flex items-center justify-center gap-2.5 rounded-full font-sans text-[12px] font-medium uppercase tracking-wide-2 transition-all duration-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:opacity-50";
  const sizes = "px-7 py-3.5";
  const variants: Record<ButtonVariant, string> = {
    gold: "bg-gradient-to-r from-[#9a7a3c] via-[#c2a05a] to-[#9a7a3c] bg-[length:200%_100%] bg-left text-burgundy-deep shadow-[0_10px_30px_-12px_rgb(176_141_74/0.7)] hover:bg-right hover:shadow-[0_14px_36px_-12px_rgb(176_141_74/0.9)] hover:-translate-y-0.5",
    outline:
      "border border-gold/60 text-charcoal hover:border-gold hover:bg-gold/10 hover:-translate-y-0.5",
    outlineLight:
      "border border-gold-soft/50 text-gold-pale hover:border-gold-soft hover:bg-gold-soft/10 hover:-translate-y-0.5",
    dark: "bg-charcoal text-ivory hover:bg-burgundy-deep hover:-translate-y-0.5",
    ivory: "bg-ivory text-burgundy hover:bg-gold-pale hover:-translate-y-0.5",
    ghost: "text-charcoal/70 hover:text-burgundy",
  };
  const cls = `${base} ${sizes} ${variants[variant]} ${className}`;
  if (href) {
    return (
      <a href={href} className={cls} aria-label={ariaLabel}>
        {children}
      </a>
    );
  }
  return (
    <button type={type} onClick={onClick} className={cls} aria-label={ariaLabel} disabled={disabled}>
      {children}
    </button>
  );
}

/* ------------------------------ Section heading ---------------------------- */

export function SectionHeading({
  eyebrow,
  title,
  sub,
  align = "center",
  dark = false,
  ornament = "royal",
}: {
  eyebrow?: string;
  title: ReactNode;
  sub?: string;
  align?: "center" | "left";
  dark?: boolean;
  ornament?: OrnamentStyle;
}) {
  const alignCls = align === "center" ? "items-center text-center" : "items-start text-left";
  return (
    <Reveal className={`flex flex-col ${alignCls} gap-5`}>
      {eyebrow && (
        <span
          className={`font-sans text-[11px] uppercase tracking-luxe ${dark ? "text-gold-soft" : "text-gold"}`}
        >
          {eyebrow}
        </span>
      )}
      <h2
        className={`font-display text-4xl leading-[1.08] font-medium sm:text-5xl lg:text-[3.4rem] ${
          dark ? "text-ivory" : "text-charcoal"
        }`}
      >
        {title}
      </h2>
      <Ornament style={ornament} className={`h-5 w-40 ${dark ? "text-gold-soft/70" : "text-gold/70"}`} />
      {sub && (
        <p
          className={`max-w-xl font-sans text-[15px] leading-relaxed font-light ${
            dark ? "text-ivory/70" : "text-ink-soft/80"
          }`}
        >
          {sub}
        </p>
      )}
    </Reveal>
  );
}

/* -------------------------------- Ornaments -------------------------------- */

export function Ornament({
  style,
  className = "",
}: {
  style: OrnamentStyle;
  className?: string;
}) {
  const stroke = { stroke: "currentColor", fill: "none", strokeWidth: 1.1 } as const;
  return (
    <svg viewBox="0 0 200 24" className={className} aria-hidden="true">
      {style === "royal" && (
        <g {...stroke}>
          <path d="M0 12h66" />
          <path d="M134 12h66" />
          <path d="M78 12c6-7 14-7 22 0-8 7-16 7-22 0Z" />
          <path d="M100 5v-3M100 19v3" />
          <circle cx="70" cy="12" r="1.6" fill="currentColor" stroke="none" />
          <circle cx="130" cy="12" r="1.6" fill="currentColor" stroke="none" />
        </g>
      )}
      {style === "line" && (
        <g {...stroke}>
          <path d="M20 12h160" strokeWidth="0.7" />
          <path d="M100 7l5 5-5 5-5-5Z" />
        </g>
      )}
      {style === "floral" && (
        <g {...stroke}>
          <path d="M0 12h70M130 12h70" />
          <path d="M100 12c-4-6-12-6-14 0 2 6 10 6 14 0Zm0 0c4-6 12-6 14 0-2 6-10 6-14 0Z" />
          <path d="M100 12v-6M96 8c2-2 6-2 8 0" />
        </g>
      )}
      {style === "geo" && (
        <g {...stroke}>
          <path d="M0 12h74M126 12h74" />
          <path d="M100 3l3.5 5.5L110 12l-6.5 3.5L100 21l-3.5-5.5L90 12l6.5-3.5Z" />
        </g>
      )}
      {style === "modern" && (
        <g {...stroke}>
          <path d="M40 12h120" strokeWidth="0.8" />
          <path d="M40 8v8" />
        </g>
      )}
      {style === "coastal" && (
        <g {...stroke}>
          <path d="M0 14c14-8 26 8 40 0s26 8 40 0 26 8 40 0 26 8 40 0 26 8 40 0" strokeWidth="0.9" />
        </g>
      )}
    </svg>
  );
}

export function CornerFlourish({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 120 120" className={className} style={style} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M4 116C4 60 30 22 78 10" />
      <path d="M12 116c2-44 24-78 64-92" opacity="0.6" />
      <path d="M78 10c8-2 16 0 22 6-8 2-14 0-22-6Z" />
      <path d="M30 62c-6-2-10 2-10 8 6 2 10-2 10-8Z" />
      <path d="M46 40c-2-6 2-10 8-10 2 6-2 10-8 10Z" />
      <circle cx="20" cy="96" r="2.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

/* --------------------------------- Monogram -------------------------------- */

export function Monogram({ text, className = "", style }: { text: string; className?: string; style?: CSSProperties }) {
  return (
    <span
      className={`relative inline-flex items-center justify-center rounded-full border ${className}`}
      style={style}
      aria-hidden="true"
    >
      <span className="absolute inset-[3px] rounded-full border border-current opacity-60" />
      <span className="font-display text-[0.95em] tracking-[0.08em]">{text}</span>
    </span>
  );
}

/* ------------------------------- Petal field ------------------------------- */

export function PetalField({ count = 14, className = "" }: { count?: number; className?: string }) {
  const petals = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 14,
        duration: 11 + Math.random() * 10,
        size: 7 + Math.random() * 9,
        opacity: 0.35 + Math.random() * 0.45,
      })),
    [count],
  );
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {petals.map((p) => (
        <span
          key={p.id}
          className="absolute top-0 block animate-petal rounded-[60%_40%_55%_45%/55%_45%_60%_40%]"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.82,
            opacity: p.opacity,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            background: "radial-gradient(circle at 35% 30%, #d98a96, #a13a52 70%)",
          }}
        />
      ))}
    </div>
  );
}

/* -------------------------------- Page hero -------------------------------- */

export function PageHero({
  eyebrow,
  title,
  script,
  sub,
}: {
  eyebrow: string;
  title: string;
  script?: string;
  sub?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-burgundy-deep pt-40 pb-24 text-center text-ivory">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute top-0 left-1/2 h-72 w-[640px] -translate-x-1/2 rounded-full bg-gold/10 blur-[110px]" />
        <div className="absolute inset-0 bg-grain opacity-40" />
      </div>
      <PetalField count={8} />
      <Reveal className="relative mx-auto flex max-w-3xl flex-col items-center gap-5 px-5">
        <span className="font-sans text-[11px] uppercase tracking-luxe text-gold-soft">{eyebrow}</span>
        <h1 className="font-display text-5xl leading-[1.05] font-medium sm:text-6xl">
          {title}
          {script && <span className="mt-2 block font-script text-6xl text-gold-gradient sm:text-7xl">{script}</span>}
        </h1>
        <Ornament style="royal" className="h-5 w-40 text-gold-soft/60" />
        {sub && <p className="max-w-xl font-sans text-[15px] leading-relaxed font-light text-ivory/70">{sub}</p>}
      </Reveal>
    </section>
  );
}

/* ------------------------------ Price label -------------------------------- */

export function PriceTag({ value, className = "", dark = false }: { value: string; className?: string; dark?: boolean }) {
  return (
    <span className={`font-display text-2xl font-semibold ${dark ? "text-gold-soft" : "text-burgundy"} ${className}`}>
      {value}
    </span>
  );
}
