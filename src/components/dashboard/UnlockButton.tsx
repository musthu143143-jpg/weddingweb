"use client";

import { Lock } from "lucide-react";
import { useState } from "react";
import UnlockFlow from "@/components/dashboard/UnlockFlow";

export default function UnlockButton({
  invitationId,
  templateName,
  price,
}: {
  invitationId: string;
  templateName: string;
  price: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#9a7a3c] via-[#c2a05a] to-[#9a7a3c] px-5 py-2.5 font-sans text-[11px] font-medium uppercase tracking-wide-2 text-burgundy-deep transition-transform hover:-translate-y-0.5"
      >
        <Lock className="h-3.5 w-3.5" /> Unlock ₹{price.toLocaleString("en-IN")}
      </button>
      {open && <UnlockFlow invitationId={invitationId} templateName={templateName} price={price} onClose={() => setOpen(false)} />}
    </>
  );
}
