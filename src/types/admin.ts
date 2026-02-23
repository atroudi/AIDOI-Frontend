// Admin-specific types for the super admin dashboard

import type { UserRole } from "./auth";

// Full user object as returned by GET /api/user (backend UserResponseDto)
export interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  verified: boolean;
  role: UserRole;
  reset_pwd_token?: string | null;
  reset_pwd_count: number;
  activation_token?: string | null;
  activation_count: number;
  is_logged_out: boolean;
  banned: boolean;
}

// DTO for updating a user's role / status (admin-only fields)
export interface UpdateUserDto {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: UserRole;
  verified?: boolean;
  banned?: boolean;
}

// DTO for deleting a user
export interface DeleteUserDto {
  user_id: string;
}

// Computed stats for the admin stats page
export interface AdminStats {
  totalUsers: number;
  totalOrganizations: number;
  totalAidois: number;
  activeAidois: number;
  inactiveAidois: number;
  pendingApprovals: number;
  usersByRole: {
    admin: number;
    orgAdmin: number;
    authenticated: number;
  };
  aidoisByResourceType: Record<string, number>;
  topOrganizationsByAidois: {
    organizationId: string;
    organizationName: string;
    count: number;
  }[];
}

// Helper to determine role display label
export function getUserRoleLabel(role: UserRole): string {
  if (role.admin) return "Admin";
  if (role.other) return role.other === "OrgAdmin" ? "Org Admin" : role.other;
  return "Authenticated";
}

// Helper to determine role key for filtering
export function getUserRoleKey(role: UserRole): "admin" | "orgAdmin" | "authenticated" {
  if (role.admin) return "admin";
  if (role.other === "OrgAdmin") return "orgAdmin";
  return "authenticated";
}
