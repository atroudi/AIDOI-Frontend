"use client";

import { Select } from "@/components/ui/select";
import type { UserRole } from "@/types";

interface UserRoleSelectProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
  className?: string;
}

const roleOptions = [
  { value: "authenticated", label: "Authenticated" },
  { value: "orgadmin", label: "Org Admin" },
  { value: "admin", label: "Admin" },
];

function roleToValue(role: UserRole): string {
  if (role.admin) return "admin";
  if (role.other === "OrgAdmin") return "orgadmin";
  return "authenticated";
}

function valueToRole(value: string): UserRole {
  switch (value) {
    case "admin":
      return { admin: true };
    case "orgadmin":
      return { other: "OrgAdmin" };
    default:
      return { authenticated: true };
  }
}

export function UserRoleSelect({
  value,
  onChange,
  className,
}: UserRoleSelectProps) {
  return (
    <Select
      className={className}
      options={roleOptions}
      value={roleToValue(value)}
      onChange={(e) => onChange(valueToRole(e.target.value))}
    />
  );
}
