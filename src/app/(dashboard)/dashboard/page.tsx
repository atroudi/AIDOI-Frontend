"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, Plus } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { TableSkeleton } from "@/components/ui/skeleton";
import { aidoiService } from "@/services";
import { formatDate } from "@/lib/utils";
import type { Aidoi } from "@/types";

export default function DashboardPage() {
  const [recentAidois, setRecentAidois] = useState<Aidoi[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRecentAidois() {
      try {
        const res = await aidoiService.getMany(0, 5);
        setRecentAidois(res.data.records);
      } catch {
        // Silently handle — user may not have any AIDOIs yet
      } finally {
        setIsLoading(false);
      }
    }
    loadRecentAidois();
  }, []);

  return (
    <div className="space-y-6">
      {/* Account Status Card */}
      <Card>
        <CardContent className="flex items-center gap-4 py-5">
          <CheckCircle className="h-10 w-10 text-success shrink-0" />
          <div>
            <p className="text-lg font-semibold text-gray-900">
              Account Status:{" "}
              <span className="text-success">Active</span>
            </p>
            <p className="text-sm text-gray-500">Verified Issuer</p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/institutions/new"
          className="flex items-center justify-center gap-2 px-6 py-8 rounded-xl text-white text-xl font-semibold bg-gradient-to-r from-sky-400 to-blue-600 hover:from-sky-500 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
        >
          Add New Institution <Plus className="h-6 w-6" />
        </Link>
        <Link
          href="/aidois/new"
          className="flex items-center justify-center gap-2 px-6 py-8 rounded-xl text-white text-xl font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl"
        >
          Create New AIDOI <Plus className="h-6 w-6" />
        </Link>
      </div>

      {/* Recent AIDOIs Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">
            Recent AIDOIs
          </h3>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4">
              <TableSkeleton rows={3} />
            </div>
          ) : recentAidois.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <p className="text-sm">No AIDOIs created yet.</p>
              <Link
                href="/aidois/new"
                className="mt-2 inline-block text-sm text-primary hover:text-primary-hover"
              >
                Create your first AIDOI →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                      AIDOI ID
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                      Object Name
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                      Date Created
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentAidois.map((aidoi) => (
                    <tr
                      key={aidoi.id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-3 text-sm text-gray-900 font-mono">
                        <Link
                          href={`/aidois/${aidoi.id}`}
                          className="text-primary hover:underline"
                        >
                          {aidoi.suffix}
                        </Link>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-700">
                        {aidoi.metadata?.title || "—"}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-500">
                        {formatDate(aidoi.created_at)}
                      </td>
                      <td className="px-6 py-3">
                        <StatusBadge status={aidoi.status} />
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
