"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Building2, Link2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { RoleBadge } from "@/components/admin/role-badge";
import { TableSkeleton } from "@/components/ui/skeleton";
import { adminService } from "@/services";
import { formatDate } from "@/lib/utils";
import type { AdminUser } from "@/types";
import { getUserRoleKey } from "@/types";

export default function AdminOverviewPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalOrgs, setTotalOrgs] = useState(0);
  const [totalAidois, setTotalAidois] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [usersRes, orgsRes, aidoisRes] = await Promise.all([
          adminService.getUsers(0, 10),
          adminService.getAllOrganizations(0, 1),
          adminService.getAllAidois(0, 1),
        ]);

        setUsers(usersRes.data.records);
        setTotalUsers(usersRes.data.total);
        setTotalOrgs(orgsRes.data.total);
        setTotalAidois(aidoisRes.data.total);

        // Count pending approvals (verified but still "authenticated")
        const pending = usersRes.data.records.filter(
          (u) => getUserRoleKey(u.role) === "authenticated" && u.verified && !u.banned
        ).length;
        setPendingCount(pending);
      } catch {
        // handled silently
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-xl border border-gray-100 animate-pulse" />
          ))}
        </div>
        <Card>
          <CardHeader>
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <TableSkeleton rows={5} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          label="Total Users"
          count={totalUsers}
          icon={Users}
          iconColor="text-blue-600"
        />
        <AdminStatCard
          label="Total Organizations"
          count={totalOrgs}
          icon={Building2}
          iconColor="text-green-600"
        />
        <AdminStatCard
          label="Total AIDOIs"
          count={totalAidois}
          icon={Link2}
          iconColor="text-purple-600"
        />
        <Link href="/admin/pending">
          <AdminStatCard
            label="Pending Approvals"
            count={pendingCount}
            icon={Clock}
            iconColor="text-orange-600"
          />
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/admin/pending"
          className="flex items-center justify-center gap-2 px-6 py-5 rounded-xl text-white text-lg font-semibold bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl"
        >
          <Clock className="h-5 w-5" />
          View Pending Requests
        </Link>
        <Link
          href="/admin/users"
          className="flex items-center justify-center gap-2 px-6 py-5 rounded-xl text-white text-lg font-semibold bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
        >
          <Users className="h-5 w-5" />
          Manage Users
        </Link>
      </div>

      {/* Recent Users */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
            <Link
              href="/admin/users"
              className="text-sm text-primary hover:text-primary-hover"
            >
              View all →
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {users.length === 0 ? (
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
                  </tr>
                </thead>
                <tbody>
                  {users.slice(0, 5).map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-3 text-sm text-gray-900">
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
                        ) : (
                          <span className="text-green-600">Active</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
