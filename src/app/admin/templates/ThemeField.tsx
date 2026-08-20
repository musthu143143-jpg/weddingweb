"use client";

import { useState } from "react";
import type { OrnamentStyle, TemplateTheme } from "@/lib/types";

const COLOR_KEYS: { key: keyof TemplateTheme; label: string }[] = [
  { key: "bg", label: "Background" },
  { key: "panel", label: "Panel" },
  { key: "ink", label: "Text ink" },
  { key: "accent", label: "Accent" },
  { key: "gold", label: "Gold" },
  { key: "script", label: "Script" },
];

const ORNAMENTS: OrnamentStyle[] = ["royal", "line", "floral", "geo", "modern", "coastal"];

const PRESETS: { name: string; patch: Partial<TemplateTheme> }[] = [
  { name: "Ivory Light", patch: { bg: "#F6F0E1", panel: "#FCF8EE", ink: "#3E2E20", accent: "#8C1F35", gold: "#AC884A", script: "#5E1124", dark: false } },
  { name: "Royal Burgundy", patch: { bg: "#470C1B", panel: "#F6ECD8", ink: "#4A0D1C", accent: "#8C1F35", gold: "#C6A15B", script: "#5E1124", ornament: "royal", dark: true } },
  { name: "Midnight", patch: { bg: "#141210", panel: "#1C1916", ink: "#EDE6D8", accent: "#9A938A", gold: "#C9B98F", script: "#E8DFC9", dark: true } },
  { name: "Emerald", patch: { bg: "#0E2A22", panel: "#12352B", ink: "#EFE7D2", accent: "#B9924E", gold: "#D2B06A", script: "#E4C77F", ornament: "geo", dark: true } },
  { name: "Blush Garden", patch: { bg: "#FBF4F1", panel: "#FFFAF7", ink: "#5A4038", accent: "#C98A8A", gold: "#B98A6E", script: "#B06A6A", ornament: "floral", dark: false } },
];

function isHex(v: unknown): v is string {
  return typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v);
}

/**
 * Visual editor for a template's theme. Keeps a hidden `theme` form field in
 * sync so the existing server action receives the same JSON as before.
 */
export default function ThemeField({ initial }: { initial: TemplateTheme }) {
  const [theme, setTheme] = useState<TemplateTheme>(initial);
  const [json, setJson] = useState(JSON.stringify(initial, null, 2));
  const [jsonError, setJsonError] = useState(false);

  function set(patch: Partial<TemplateTheme>) {
    const next = { ...theme, ...patch };
    setTheme(next);
    setJson(JSON.stringify(next, null, 2));
    setJsonError(false);
  }

  function onJsonChange(value: string) {
    setJson(value);
    try {
      const parsed = JSON.parse(value) as TemplateTheme;
      if (parsed && typeof parsed === "object") {
        setTheme(parsed);
        setJsonError(false);
      }
    } catch {
      setJsonError(true);
    }
  }

  return (
    <div className="space-y-4 lg:col-span-2">
      <div className="flex items-center justify-between gap-3">
        <span className="admin-label">Theme builder</span>
        <span
          className="flex h-9 items-center gap-1 overflow-hidden rounded-full border border-gold/30 px-2"
          title="Live swatch of the current palette"
        >
          {COLOR_KEYS.map(({ key }) => (
            <span key={key} className="h-5 w-5 rounded-full border border-charcoal/10" style={{ background: String(theme[key] ?? "#ccc") }} />
          ))}
          <span className="ml-2 font-sans text-[10px] uppercase tracking-wide-2 text-ink-soft/60">{theme.ornament}</span>
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {COLOR_KEYS.map(({ key, label }) => (
          <label key={key} className="flex items-center justify-between gap-2 rounded-xl border border-gold/20 bg-white/70 px-3 py-2">
            <span className="font-sans text-[11px] uppercase tracking-wide-2 text-ink-soft/60">{label}</span>
            <span className="flex items-center gap-2">
              <code className="font-mono text-[10px] text-ink-soft/60">{String(theme[key])}</code>
              <input
                type="color"
                value={isHex(theme[key]) ? (theme[key] as string) : "#000000"}
                onChange={(e) => set({ [key]: e.target.value } as Partial<TemplateTheme>)}
                className="h-8 w-10 cursor-pointer rounded border border-gold/20 bg-transparent"
                aria-label={label}
              />
            </span>
          </label>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="admin-label">Ornament style</span>
          <select value={theme.ornament} onChange={(e) => set({ ornament: e.target.value as OrnamentStyle })} className="admin-input">
            {ORNAMENTS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </label>
        <label className="mt-5 flex items-center gap-2">
          <input type="checkbox" checked={Boolean(theme.dark)} onChange={(e) => set({ dark: e.target.checked })} className="h-4 w-4 accent-burgundy" />
          <span className="admin-label">Dark surfaces</span>
        </label>
      </div>

      <div>
        <span className="admin-label">Quick palettes</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => set(p.patch)}
              className="inline-flex items-center gap-2 rounded-full border border-gold/30 px-4 py-2 font-sans text-[10px] uppercase tracking-wide-2 text-ink-soft transition-colors hover:border-gold hover:bg-gold/10"
            >
              <span className="flex overflow-hidden rounded-full border border-charcoal/10">
                {[p.patch.bg, p.patch.gold, p.patch.script].filter(Boolean).map((c, i) => (
                  <span key={i} className="h-4 w-4" style={{ background: c }} />
                ))}
              </span>
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <details className="group">
        <summary className="cursor-pointer font-sans text-[11px] uppercase tracking-wide-2 text-burgundy">Advanced JSON</summary>
        <textarea
          value={json}
          onChange={(e) => onJsonChange(e.target.value)}
          rows={6}
          className={`admin-input mt-2 resize-none font-mono text-xs ${jsonError ? "!border-maroon" : ""}`}
        />
        {jsonError && <p className="mt-1 font-sans text-[11px] text-maroon">Invalid JSON — the form will submit the last valid theme.</p>}
      </details>

      {/* Hidden field consumed by the server action */}
      <input type="hidden" name="theme" value={jsonError ? JSON.stringify(theme) : json} />
    </div>
  );
}
