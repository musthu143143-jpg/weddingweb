"use client";

import type { WeddingTemplate } from "@/lib/types";
import { CornerFlourish, Monogram, Ornament } from "@/components/ui/core";
import { themeVars } from "@/components/invitation/widgets";

/**
 * A small, configuration-driven rendering of an invitation.
 * The template's theme + ornament language fully controls the look,
 * so one component presents every design differently.
 */
export default function MiniPreview({
  template,
  bride,
  groom,
  dateLabel,
  familiesLine,
  className = "",
}: {
  template: WeddingTemplate;
  bride?: string;
  groom?: string;
  dateLabel?: string;
  familiesLine?: string;
  className?: string;
}) {
  const t = template.theme;
  const b = bride ?? "Meera";
  const g = groom ?? "Aarav";
  const date = dateLabel ?? "14 December 2026";
  const families = familiesLine ?? "Together with their families";
  const orn = t.ornament;

  return (
    <div
      className={`relative flex h-full w-full flex-col items-center justify-center overflow-hidden px-6 py-8 text-center ${className}`}
      style={{ ...themeVars(t), background: t.panel, color: t.ink }}
    >
      {/* Frame language per ornament style */}
      {orn === "royal" && (
        <>
          <span className="pointer-events-none absolute inset-2 rounded-[18px] border" style={{ borderColor: `${t.gold}80` }} />
          <span className="pointer-events-none absolute inset-3.5 rounded-[14px] border" style={{ borderColor: `${t.gold}40` }} />
          <CornerFlourish className="pointer-events-none absolute -left-1 -top-1 h-16 w-16" style={{ color: t.gold }} />
          <CornerFlourish className="pointer-events-none absolute -right-1 -top-1 h-16 w-16 -scale-x-100" style={{ color: t.gold }} />
          <CornerFlourish className="pointer-events-none absolute -bottom-1 -left-1 h-16 w-16 -scale-y-100" style={{ color: t.gold }} />
          <CornerFlourish className="pointer-events-none absolute -bottom-1 -right-1 h-16 w-16 -scale-100" style={{ color: t.gold }} />
        </>
      )}
      {orn === "geo" && (
        <svg viewBox="0 0 200 260" className="pointer-events-none absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden="true">
          <path d="M8 252V70L100 10l92 60v182" fill="none" stroke={t.gold} strokeOpacity="0.7" strokeWidth="1.4" />
          <path d="M16 252V76L100 20l84 56v176" fill="none" stroke={t.gold} strokeOpacity="0.3" strokeWidth="1" />
        </svg>
      )}
      {orn === "floral" && (
        <>
          <CornerFlourish className="pointer-events-none absolute -left-2 -top-2 h-20 w-20" style={{ color: t.accent }} />
          <CornerFlourish className="pointer-events-none absolute -bottom-2 -right-2 h-20 w-20 -scale-100" style={{ color: t.accent }} />
          <span className="pointer-events-none absolute inset-3 rounded-[20px] border" style={{ borderColor: `${t.accent}35` }} />
        </>
      )}
      {(orn === "line" || orn === "modern") && (
        <span className="pointer-events-none absolute inset-4 border" style={{ borderColor: `${t.gold}55`, borderWidth: orn === "modern" ? 1 : 0.5 }} />
      )}
      {orn === "coastal" && (
        <>
          <span className="pointer-events-none absolute inset-3 rounded-[18px] border" style={{ borderColor: `${t.accent}40` }} />
          <svg viewBox="0 0 200 20" className="pointer-events-none absolute bottom-4 left-1/2 h-4 w-32 -translate-x-1/2" aria-hidden="true">
            <path d="M0 10c12-7 22 7 34 0s22 7 34 0 22 7 34 0 22 7 34 0 22 7 34 0 22 7 30 0" fill="none" stroke={t.accent} strokeOpacity="0.6" />
          </svg>
        </>
      )}

      <p className="font-sans text-[8px] uppercase tracking-luxe sm:text-[9px]" style={{ color: t.accent }}>
        {families}
      </p>

      <Monogram
        text={`${g[0]} & ${b[0]}`}
        className="mt-3 h-9 w-9 text-[9px]"
        style={{ color: t.gold, borderColor: `${t.gold}90` }}
      />

      <div className="mt-3 leading-[0.95]">
        <p className="font-script text-[clamp(1.6rem,4vw,2.6rem)]" style={{ color: t.script }}>{g}</p>
        <p className="font-display text-[11px] italic tracking-wide-2" style={{ color: t.gold }}>&</p>
        <p className="font-script text-[clamp(1.6rem,4vw,2.6rem)]" style={{ color: t.script }}>{b}</p>
      </div>

      <Ornament style={orn} className="mt-3 h-3 w-24" />
      <p className="mt-2 font-sans text-[8px] uppercase tracking-wide-2 sm:text-[9px]" style={{ color: t.ink, opacity: 0.75 }}>
        {date}
      </p>
    </div>
  );
}
