"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ConfirmModal } from "@/components/ui/modal";
import { TableSkeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { aidoiService } from "@/services";
import { formatDate } from "@/lib/utils";
import type { Aidoi } from "@/types";

export default function AidoisPage() {
  const { showToast } = useToast();
  const [aidois, setAidois] = useState<Aidoi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Aidoi | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadAidois = async () => {
    try {
      const res = await aidoiService.getMany(0, 50);
      setAidois(res.data.records);
    } catch {
      showToast("Failed to load AIDOIs", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAidois();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await aidoiService.deleteById(deleteTarget.id);
      showToast("AIDOI deleted successfully", "success");
      setDeleteTarget(null);
      loadAidois();
    } catch {
      showToast("Failed to delete AIDOI", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "AIDOIs" },
        ]}
      />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage AIDOIs</h1>
        <Link href="/aidois/new">
          <Button>
            <Plus className="h-4 w-4 mr-1.5" />
            Create New AIDOI
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4">
              <TableSkeleton rows={5} />
            </div>
          ) : aidois.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
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
                      Type
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                      Date Created
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="text-right px-6 py-3 text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {aidois.map((aidoi) => (
                    <tr
                      key={aidoi.id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-3 text-sm font-mono text-gray-900">
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
                      <td className="px-6 py-3 text-sm text-gray-600">
                        {aidoi.metadata?.resource_type || "—"}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-500">
                        {formatDate(aidoi.created_at)}
                      </td>
                      <td className="px-6 py-3">
                        <StatusBadge status={aidoi.status} />
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/aidois/${aidoi.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTarget(aidoi)}
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
        </CardContent>
      </Card>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete AIDOI"
        message={`Are you sure you want to delete AIDOI "${deleteTarget?.suffix}"? This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </div>
  );
}
