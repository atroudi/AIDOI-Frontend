"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Search, Eye, Ban, ArrowDown } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { TableSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RoleBadge } from "@/components/admin/role-badge";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { useToast } from "@/components/ui/toast";
import { adminService } from "@/services";
import type { AdminUser, Organization } from "@/types";
import { getUserRoleKey } from "@/types";

export default function AdminOrgAdminsPage() {
  const { showToast } = useToast();
  const [orgAdmins, setOrgAdmins] = useState<AdminUser[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionTarget, setActionTarget] = useState<{
    user: AdminUser;
    action: "demote" | "ban";
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [usersRes, orgsRes] = await Promise.all([
        adminService.getUsers(0, 100),
        adminService.getAllOrganizations(0, 100),
      ]);

      const admins = usersRes.data.records.filter(
        (u) => getUserRoleKey(u.role) === "orgAdmin"
      );
      setOrgAdmins(admins);
      setOrganizations(orgsRes.data.records);
    } catch {
      showToast("Failed to load data", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getOrgForAdmin = (adminId: string): Organization | undefined => {
    return organizations.find((org) => org.admin_id === adminId);
  };

  const handleAction = async () => {
    if (!actionTarget) return;
    setIsProcessing(true);
    try {
      if (actionTarget.action === "demote") {
        await adminService.updateUser({
          id: actionTarget.user.id,
          role: { authenticated: true },
        });
        showToast(
          `${actionTarget.user.first_name} ${actionTarget.user.last_name} demoted to Authenticated`,
          "success"
        );
      } else {
        await adminService.updateUser({
          id: actionTarget.user.id,
          banned: true,
        });
        showToast(
          `${actionTarget.user.first_name} ${actionTarget.user.last_name} banned`,
          "success"
        );
      }
      setActionTarget(null);
      loadData();
    } catch {
      showToast("Failed to process action", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const filtered = search
    ? orgAdmins.filter(
        (u) =>
          `${u.first_name} ${u.last_name}`
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
      )
    : orgAdmins;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Organization Admins</h1>
        {!isLoading && (
          <span className="text-sm text-gray-500">
            {orgAdmins.length} org admins
          </span>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4">
              <TableSkeleton rows={5} cols={6} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <p className="text-sm">No org admins found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                      Name
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                      Email
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                      Role
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                      Organization
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                      Prefix
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                      Org Status
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((admin) => {
                    const org = getOrgForAdmin(admin.id);
                    return (
                      <tr
                        key={admin.id}
                        className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-3 text-sm text-gray-900 font-medium">
                          <Link
                            href={`/admin/users/${admin.id}`}
                            className="text-primary hover:underline"
                          >
                            {admin.first_name} {admin.last_name}
                          </Link>
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-600">
                          {admin.email}
                        </td>
                        <td className="px-6 py-3">
                          <RoleBadge role={admin.role} />
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-900">
                          {org ? (
                            <Link
                              href={`/admin/organizations/${org.id}`}
                              className="text-primary hover:underline"
                            >
                              {org.legal_name}
                            </Link>
                          ) : (
                            <span className="text-gray-400 italic">
                              No organization
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-900 font-mono">
                          {org?.prefix.value || "—"}
                        </td>
                        <td className="px-6 py-3">
                          {org ? (
                            <StatusBadge status={org.prefix.status} />
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-1">
                            {org && (
                              <Link href={`/admin/organizations/${org.id}`}>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setActionTarget({ user: admin, action: "demote" })
                              }
                              className="text-orange-500 hover:text-orange-700 hover:bg-orange-50"
                              title="Demote to Authenticated"
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setActionTarget({ user: admin, action: "ban" })
                              }
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              title="Ban"
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmAction
        isOpen={!!actionTarget}
        onClose={() => setActionTarget(null)}
        onConfirm={handleAction}
        title={
          actionTarget?.action === "demote"
            ? "Demote Org Admin"
            : "Ban Org Admin"
        }
        message={
          actionTarget?.action === "demote"
            ? `Demote "${actionTarget?.user.first_name} ${actionTarget?.user.last_name}" from Org Admin to Authenticated? They will lose organization management permissions.`
            : `Ban "${actionTarget?.user.first_name} ${actionTarget?.user.last_name}"? They will lose all portal access.`
        }
        confirmLabel={actionTarget?.action === "demote" ? "Demote" : "Ban"}
        confirmVariant="danger"
        isLoading={isProcessing}
      />
    </div>
  );
}
