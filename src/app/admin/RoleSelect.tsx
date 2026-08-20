"use client";

import { useTransition } from "react";
import type { UserRole } from "@/lib/profile";
import { changeUserRole } from "@/app/admin/actions";

const ROLES: UserRole[] = ["user", "reseller", "admin"];

export default function RoleSelect({
  userId,
  currentRole,
  disabled,
}: {
  userId: string;
  currentRole: UserRole;
  disabled?: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function onChange(role: UserRole) {
    const formData = new FormData();
    formData.set("userId", userId);
    formData.set("role", role);
    startTransition(() => {
      changeUserRole(formData);
    });
  }

  return (
    <select
      defaultValue={currentRole}
      disabled={disabled || pending}
      onChange={(e) => onChange(e.target.value as UserRole)}
      aria-label="Change account role"
      className="rounded-full border border-gold/40 bg-white px-4 py-1.5 font-sans text-[11px] uppercase tracking-wide-2 text-charcoal outline-none transition-colors focus:border-gold disabled:cursor-not-allowed disabled:opacity-50"
    >
      {ROLES.map((r) => (
        <option key={r} value={r}>
          {r}
        </option>
      ))}
    </select>
  );
}
