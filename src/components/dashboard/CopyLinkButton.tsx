"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export default function CopyLinkButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${path}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full border border-gold/45 px-4 py-1.5 font-sans text-[10px] uppercase tracking-wide-2 text-burgundy transition-colors hover:bg-gold/10"
    >
      {copied ? <Check className="h-3 w-3" strokeWidth={2.2} /> : <Copy className="h-3 w-3" strokeWidth={1.8} />}
      {copied ? "Copied" : "Copy link"}
    </button>
  );
}
