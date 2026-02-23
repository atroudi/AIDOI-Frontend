"use client";

import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";
import { getUserRoleLabel } from "@/types";

interface RoleBadgeProps {
  role: UserRole;
  className?: string;
}

const roleStyles: Record<string, string> = {
  admin: "bg-red-100 text-red-700",
  orgAdmin: "bg-blue-100 text-blue-700",
  authenticated: "bg-gray-100 text-gray-600",
};

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const key = role.admin
    ? "admin"
    : role.other === "OrgAdmin"
      ? "orgAdmin"
      : "authenticated";
  const style = roleStyles[key] || roleStyles.authenticated;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        style,
        className
      )}
    >
      {getUserRoleLabel(role)}
    </span>
  );
}
