"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Search, Trash2, Eye, Ban, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TableSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RoleBadge } from "@/components/admin/role-badge";
import { Pagination } from "@/components/admin/pagination";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { UserRoleSelect } from "@/components/admin/user-role-select";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { adminService } from "@/services";
import type { AdminUser, UserRole } from "@/types";
import { getUserRoleKey } from "@/types";

const PAGE_SIZE = 10;

type RoleFilter = "all" | "admin" | "orgAdmin" | "authenticated";

export default function AdminUsersPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");

  // Action states
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [banTarget, setBanTarget] = useState<AdminUser | null>(null);
  const [isBanning, setIsBanning] = useState(false);
  const [roleEditTarget, setRoleEditTarget] = useState<AdminUser | null>(null);
  const [newRole, setNewRole] = useState<UserRole>({ authenticated: true });
  const [isSavingRole, setIsSavingRole] = useState(false);

  const loadUsers = useCallback(
    async (pageNum: number) => {
      setIsLoading(true);
      try {
        const res = await adminService.getUsers(pageNum, PAGE_SIZE);
        setUsers(res.data.records);
        setTotal(res.data.total);
        setHasNext(res.data.has_next);
        setPage(res.data.current_page);
      } catch {
        showToast("Failed to load users", "error");
      } finally {
        setIsLoading(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    loadUsers(0);
  }, [loadUsers]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await adminService.deleteUser(deleteTarget.id);
      showToast("User deleted successfully", "success");
      setDeleteTarget(null);
      loadUsers(page);
    } catch {
      showToast("Failed to delete user", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBanToggle = async () => {
    if (!banTarget) return;
    setIsBanning(true);
    try {
      await adminService.updateUser({
        id: banTarget.id,
        banned: !banTarget.banned,
      });
      showToast(
        banTarget.banned ? "User unbanned" : "User banned",
        "success"
      );
      setBanTarget(null);
      loadUsers(page);
    } catch {
      showToast("Failed to update user", "error");
    } finally {
      setIsBanning(false);
    }
  };

  const handleRoleChange = async () => {
    if (!roleEditTarget) return;
    setIsSavingRole(true);
    try {
      await adminService.updateUser({
        id: roleEditTarget.id,
        role: newRole,
      });
      showToast("Role updated successfully", "success");
      setRoleEditTarget(null);
      loadUsers(page);
    } catch {
      showToast("Failed to update role", "error");
    } finally {
      setIsSavingRole(false);
    }
  };

  // Filter by search and role tab
  const filtered = users.filter((user) => {
    const matchesSearch =
      !search ||
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole =
      roleFilter === "all" || getUserRoleKey(user.role) === roleFilter;
    return matchesSearch && matchesRole;
  });

  const filterTabs: { label: string; value: RoleFilter }[] = [
    { label: "All", value: "all" },
    { label: "Admins", value: "admin" },
    { label: "Org Admins", value: "orgAdmin" },
    { label: "Regular", value: "authenticated" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">All Users</h1>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              {filterTabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setRoleFilter(tab.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    roleFilter === tab.value
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500">{total} total</p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4">
              <TableSkeleton rows={5} cols={6} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <p className="text-sm">No users found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Name</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Email</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Role</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Verified</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-3 text-sm text-gray-900 font-medium">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="text-primary hover:underline"
                        >
                          {user.first_name} {user.last_name}
                        </Link>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-3">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-6 py-3 text-sm">
                        {user.verified ? (
                          <span className="text-green-600">Yes</span>
                        ) : (
                          <span className="text-red-500">No</span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-sm">
                        {user.banned ? (
                          <span className="text-red-600 font-medium">Banned</span>
                        ) : user.is_logged_out ? (
                          <span className="text-gray-400">Offline</span>
                        ) : (
                          <span className="text-green-600">Active</span>
                        )}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-1">
                          <Link href={`/admin/users/${user.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setRoleEditTarget(user);
                              setNewRole(user.role);
                            }}
                          >
                            <ShieldCheck className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setBanTarget(user)}
                            className={
                              user.banned
                                ? "text-green-600 hover:text-green-700 hover:bg-green-50"
                                : "text-orange-500 hover:text-orange-700 hover:bg-orange-50"
                            }
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTarget(user)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!isLoading && total > PAGE_SIZE && (
            <Pagination
              currentPage={page}
              hasNext={hasNext}
              total={total}
              limit={PAGE_SIZE}
              onPageChange={loadUsers}
            />
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <ConfirmAction
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete "${deleteTarget?.first_name} ${deleteTarget?.last_name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
      />

      {/* Ban/Unban Confirmation */}
      <ConfirmAction
        isOpen={!!banTarget}
        onClose={() => setBanTarget(null)}
        onConfirm={handleBanToggle}
        title={banTarget?.banned ? "Unban User" : "Ban User"}
        message={
          banTarget?.banned
            ? `Unban "${banTarget?.first_name} ${banTarget?.last_name}"? They will regain portal access.`
            : `Ban "${banTarget?.first_name} ${banTarget?.last_name}"? They will lose all portal access.`
        }
        confirmLabel={banTarget?.banned ? "Unban" : "Ban"}
        confirmVariant={banTarget?.banned ? "primary" : "danger"}
        isLoading={isBanning}
      />

      {/* Role Edit Modal */}
      <Modal
        isOpen={!!roleEditTarget}
        onClose={() => setRoleEditTarget(null)}
        title="Change User Role"
        footer={
          <>
            <Button variant="outline" onClick={() => setRoleEditTarget(null)}>
              Cancel
            </Button>
            <Button onClick={handleRoleChange} isLoading={isSavingRole}>
              Save Role
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Change role for{" "}
            <span className="font-medium text-gray-900">
              {roleEditTarget?.first_name} {roleEditTarget?.last_name}
            </span>
          </p>
          <UserRoleSelect value={newRole} onChange={setNewRole} />
        </div>
      </Modal>
    </div>
  );
}
