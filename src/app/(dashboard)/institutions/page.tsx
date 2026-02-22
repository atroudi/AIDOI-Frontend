"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Eye } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ConfirmModal } from "@/components/ui/modal";
import { TableSkeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { organizationService } from "@/services";
import { formatDate } from "@/lib/utils";
import { LEGAL_STATUS_LABELS } from "@/types/organization";
import type { Organization } from "@/types";

export default function InstitutionsPage() {
  const { showToast } = useToast();
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Organization | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadOrgs = async () => {
    try {
      const res = await organizationService.getMany(0, 50);
      setOrgs(res.data.records);
    } catch {
      showToast("Failed to load institutions", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrgs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await organizationService.deleteById(deleteTarget.id);
      showToast("Institution deleted successfully", "success");
      setDeleteTarget(null);
      loadOrgs();
    } catch {
      showToast("Failed to delete institution", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Institutions" },
        ]}
      />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Institutions</h1>
        <Link href="/institutions/new">
          <Button>
            <Plus className="h-4 w-4 mr-1.5" />
            Add New Institution
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4">
              <TableSkeleton rows={4} />
            </div>
          ) : orgs.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <p className="text-sm">No institutions registered yet.</p>
              <Link
                href="/institutions/new"
                className="mt-2 inline-block text-sm text-primary hover:text-primary-hover"
              >
                Register your first institution →
              </Link>
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
                      Type
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                      Website
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                      Prefix
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                      Created
                    </th>
                    <th className="text-right px-6 py-3 text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orgs.map((org) => (
                    <tr
                      key={org.id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">
                        {org.legal_name}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">
                        {LEGAL_STATUS_LABELS[org.legal_status] ||
                          org.legal_status}
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <a
                          href={org.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {org.website}
                        </a>
                      </td>
                      <td className="px-6 py-3 text-sm font-mono text-gray-700">
                        {org.prefix?.value || "—"}
                      </td>
                      <td className="px-6 py-3">
                        <StatusBadge
                          status={org.prefix?.status || "active"}
                        />
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-500">
                        {formatDate(org.created_at)}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/institutions/${org.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTarget(org)}
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
        title="Delete Institution"
        message={`Are you sure you want to delete "${deleteTarget?.legal_name}"? This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </div>
  );
}
