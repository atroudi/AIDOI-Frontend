"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/ui/skeleton";
import { RoleBadge } from "@/components/admin/role-badge";
import { UserRoleSelect } from "@/components/admin/user-role-select";
import { useToast } from "@/components/ui/toast";
import { adminService } from "@/services";
import type { AdminUser, UserRole } from "@/types";

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editRole, setEditRole] = useState<UserRole>({ authenticated: true });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await adminService.getUserById(params.id as string);
        setUser(res.data);
        setEditRole(res.data.role);
      } catch {
        showToast("Failed to load user", "error");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [params.id, showToast]);

  const handleSaveRole = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await adminService.updateUser({ id: user.id, role: editRole });
      showToast("Role updated", "success");
      // Refresh user data
      const res = await adminService.getUserById(user.id);
      setUser(res.data);
      setEditRole(res.data.role);
    } catch {
      showToast("Failed to update role", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleBan = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await adminService.updateUser({ id: user.id, banned: !user.banned });
      showToast(user.banned ? "User unbanned" : "User banned", "success");
      const res = await adminService.getUserById(user.id);
      setUser(res.data);
    } catch {
      showToast("Failed to update user", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleVerified = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await adminService.updateUser({ id: user.id, verified: !user.verified });
      showToast(
        user.verified ? "Verification revoked" : "User verified",
        "success"
      );
      const res = await adminService.getUserById(user.id);
      setUser(res.data);
    } catch {
      showToast("Failed to update user", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton className="h-8 w-64" />
        <Card>
          <CardContent className="space-y-4 py-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <LoadingSkeleton key={i} className="h-6 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12 text-gray-400">User not found.</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {user.first_name} {user.last_name}
        </h1>
        <RoleBadge role={user.role} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Info */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">
              User Information
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow label="ID" value={user.id} mono />
            <InfoRow label="Email" value={user.email} />
            <InfoRow label="First Name" value={user.first_name} />
            <InfoRow label="Last Name" value={user.last_name} />
          </CardContent>
        </Card>

        {/* Account Status */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">
              Account Status
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Verified
                </p>
                <p className="text-sm mt-0.5">
                  {user.verified ? (
                    <span className="text-green-600 font-medium">Yes</span>
                  ) : (
                    <span className="text-red-500 font-medium">No</span>
                  )}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleVerified}
                disabled={isSaving}
              >
                {user.verified ? "Revoke" : "Verify"}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Banned
                </p>
                <p className="text-sm mt-0.5">
                  {user.banned ? (
                    <span className="text-red-600 font-medium">Yes</span>
                  ) : (
                    <span className="text-green-600 font-medium">No</span>
                  )}
                </p>
              </div>
              <Button
                variant={user.banned ? "primary" : "danger"}
                size="sm"
                onClick={handleToggleBan}
                disabled={isSaving}
              >
                {user.banned ? "Unban" : "Ban"}
              </Button>
            </div>
            <InfoRow
              label="Logged Out"
              value={user.is_logged_out ? "Yes" : "No"}
            />
            <InfoRow
              label="Reset PWD Count"
              value={String(user.reset_pwd_count)}
            />
            <InfoRow
              label="Activation Count"
              value={String(user.activation_count)}
            />
          </CardContent>
        </Card>

        {/* Role Management */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">
              Role Management
            </h3>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-4">
              <div className="flex-1 max-w-xs">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  User Role
                </label>
                <UserRoleSelect value={editRole} onChange={setEditRole} />
              </div>
              <Button onClick={handleSaveRole} isLoading={isSaving}>
                <Save className="h-4 w-4 mr-1" />
                Save Role
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
        {label}
      </p>
      <p className={`text-sm text-gray-900 mt-0.5 ${mono ? "font-mono" : ""}`}>
        {value}
      </p>
    </div>
  );
}
