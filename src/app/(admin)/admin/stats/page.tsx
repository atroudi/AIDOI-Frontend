"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Building2,
  Link2,
  FileText,
  Image,
  Music,
  Video,
  Code,
  Package,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { LoadingSkeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { adminService } from "@/services";
import type { AdminUser, Organization, Aidoi } from "@/types";
import { getUserRoleKey, getUserRoleLabel } from "@/types";
import { formatDate } from "@/lib/utils";

export default function AdminStatsPage() {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalOrgs, setTotalOrgs] = useState(0);
  const [totalAidois, setTotalAidois] = useState(0);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [aidois, setAidois] = useState<Aidoi[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [usersRes, orgsRes, aidoisRes] = await Promise.all([
          adminService.getUsers(0, 100),
          adminService.getAllOrganizations(0, 100),
          adminService.getAllAidois(0, 100),
        ]);

        setUsers(usersRes.data.records);
        setTotalUsers(usersRes.data.total);
        setOrgs(orgsRes.data.records);
        setTotalOrgs(orgsRes.data.total);
        setAidois(aidoisRes.data.records);
        setTotalAidois(aidoisRes.data.total);
      } catch {
        showToast("Failed to load stats", "error");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [showToast]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-xl border border-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Computed stats
  const usersByRole = {
    admin: users.filter((u) => getUserRoleKey(u.role) === "admin").length,
    orgAdmin: users.filter((u) => getUserRoleKey(u.role) === "orgAdmin").length,
    authenticated: users.filter((u) => getUserRoleKey(u.role) === "authenticated").length,
  };

  const aidoisByStatus = {
    active: aidois.filter((a) => a.status === "active").length,
    inactive: aidois.filter((a) => a.status === "inactive").length,
    deleted: aidois.filter((a) => a.status === "deleted").length,
  };

  const aidoisByType: Record<string, number> = {};
  aidois.forEach((a) => {
    const type = a.metadata?.resource_type || "Other";
    aidoisByType[type] = (aidoisByType[type] || 0) + 1;
  });

  // Top orgs by AIDOI count
  const aidoiCountByOrg: Record<string, number> = {};
  aidois.forEach((a) => {
    aidoiCountByOrg[a.organization_id] = (aidoiCountByOrg[a.organization_id] || 0) + 1;
  });
  const topOrgs = Object.entries(aidoiCountByOrg)
    .map(([orgId, count]) => {
      const org = orgs.find((o) => o.id === orgId);
      return {
        orgId,
        name: org?.legal_name || orgId,
        count,
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const maxOrgCount = topOrgs.length > 0 ? topOrgs[0].count : 1;

  // Active orgs
  const activeOrgs = orgs.filter((o) => o.prefix.status === "active").length;

  // Recent AIDOIs
  const recentAidois = [...aidois]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const resourceTypeIcons: Record<string, React.ReactNode> = {
    dataset: <Package className="h-4 w-4" />,
    journalarticle: <FileText className="h-4 w-4" />,
    software: <Code className="h-4 w-4" />,
    report: <FileText className="h-4 w-4" />,
    image: <Image className="h-4 w-4" />,
    audio: <Music className="h-4 w-4" />,
    video: <Video className="h-4 w-4" />,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Portal Statistics</h1>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <AdminStatCard label="Total Users" count={totalUsers} icon={Users} iconColor="text-blue-600" />
        <AdminStatCard label="Total Organizations" count={totalOrgs} icon={Building2} iconColor="text-green-600" />
        <AdminStatCard label="Active Organizations" count={activeOrgs} icon={Building2} iconColor="text-emerald-600" />
        <AdminStatCard label="Total AIDOIs" count={totalAidois} icon={Link2} iconColor="text-purple-600" />
        <AdminStatCard
          label="Active AIDOIs"
          count={aidoisByStatus.active}
          icon={Link2}
          iconColor="text-indigo-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users by Role */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Users by Role</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(usersByRole).map(([role, count]) => (
                <div key={role} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        role === "admin"
                          ? "bg-red-500"
                          : role === "orgAdmin"
                            ? "bg-blue-500"
                            : "bg-gray-400"
                      }`}
                    />
                    <span className="text-sm text-gray-700 capitalize">
                      {getUserRoleLabel(
                        role === "admin"
                          ? { admin: true }
                          : role === "orgAdmin"
                            ? { other: "OrgAdmin" }
                            : { authenticated: true }
                      )}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AIDOIs by Status */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">AIDOIs by Status</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-700">{aidoisByStatus.active}</p>
                <p className="text-xs text-green-600 mt-1">Active</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-700">{aidoisByStatus.inactive}</p>
                <p className="text-xs text-yellow-600 mt-1">Inactive</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-700">{aidoisByStatus.deleted}</p>
                <p className="text-xs text-red-600 mt-1">Deleted</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AIDOIs by Resource Type */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">AIDOIs by Resource Type</h3>
          </CardHeader>
          <CardContent>
            {Object.keys(aidoisByType).length === 0 ? (
              <p className="text-sm text-gray-400">No data available.</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(aidoisByType)
                  .sort((a, b) => b[1] - a[1])
                  .map(([type, count]) => (
                    <div key={type} className="flex items-center gap-3">
                      <div className="text-gray-400">
                        {resourceTypeIcons[type] || <Link2 className="h-4 w-4" />}
                      </div>
                      <span className="text-sm text-gray-700 flex-1">{type}</span>
                      <span className="text-sm font-semibold text-gray-900">{count}</span>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Organizations by AIDOIs */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Top Organizations by AIDOIs</h3>
          </CardHeader>
          <CardContent>
            {topOrgs.length === 0 ? (
              <p className="text-sm text-gray-400">No data available.</p>
            ) : (
              <div className="space-y-3">
                {topOrgs.map((orgStat, index) => (
                  <div key={orgStat.orgId} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 truncate max-w-[200px]">
                        <span className="text-gray-400 mr-2">#{index + 1}</span>
                        {orgStat.name}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {orgStat.count}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{
                          width: `${(orgStat.count / maxOrgCount) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent AIDOIs */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Recent AIDOIs</h3>
        </CardHeader>
        <CardContent className="p-0">
          {recentAidois.length === 0 ? (
            <div className="py-8 text-center text-gray-400">
              <p className="text-sm">No AIDOIs yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Suffix</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Title</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Type</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAidois.map((aidoi) => (
                    <tr key={aidoi.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3 text-sm text-gray-900 font-mono">{aidoi.suffix}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{aidoi.metadata?.title || "—"}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{aidoi.metadata?.resource_type || "—"}</td>
                      <td className="px-6 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                            aidoi.status === "active"
                              ? "bg-green-100 text-green-700"
                              : aidoi.status === "inactive"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {aidoi.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-500">{formatDate(aidoi.created_at)}</td>
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
