"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export default function CopyCode({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label={`Copy ${value}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch { /* ignore */ }
      }}
      className="ml-2 shrink-0 text-gold transition-colors hover:text-burgundy"
    >
      {copied ? <Check className="h-3.5 w-3.5" strokeWidth={2.2} /> : <Copy className="h-3.5 w-3.5" strokeWidth={1.8} />}
    </button>
  );
}
