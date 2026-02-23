"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Search, Trash2, Eye } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { TableSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/admin/pagination";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { useToast } from "@/components/ui/toast";
import { adminService } from "@/services";
import { organizationService } from "@/services";
import { formatDate } from "@/lib/utils";
import type { Organization } from "@/types";
import { LEGAL_STATUS_LABELS } from "@/types";

const PAGE_SIZE = 10;

export default function AdminOrganizationsPage() {
  const { showToast } = useToast();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Organization | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadOrganizations = useCallback(async (pageNum: number) => {
    setIsLoading(true);
    try {
      const res = await adminService.getAllOrganizations(pageNum, PAGE_SIZE);
      setOrganizations(res.data.records);
      setTotal(res.data.total);
      setHasNext(res.data.has_next);
      setPage(res.data.current_page);
    } catch {
      showToast("Failed to load organizations", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadOrganizations(0);
  }, [loadOrganizations]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await organizationService.deleteById(deleteTarget.id);
      showToast("Organization deleted successfully", "success");
      setDeleteTarget(null);
      loadOrganizations(page);
    } catch {
      showToast("Failed to delete organization", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = search
    ? organizations.filter((org) =>
        org.legal_name.toLowerCase().includes(search.toLowerCase()) ||
        org.short_name.toLowerCase().includes(search.toLowerCase())
      )
    : organizations;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">All Organizations</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search organizations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
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
              <p className="text-sm">No organizations found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Name</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Type</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Website</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Prefix</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Created</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((org) => (
                    <tr
                      key={org.id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-3 text-sm text-gray-900 font-medium">
                        {org.legal_name}
                        <div className="text-xs text-gray-400">{org.short_name}</div>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">
                        {LEGAL_STATUS_LABELS[org.legal_status] || org.legal_status}
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <a
                          href={org.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline truncate block max-w-[180px]"
                        >
                          {org.website}
                        </a>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-900 font-mono">
                        {org.prefix.value}
                      </td>
                      <td className="px-6 py-3">
                        <StatusBadge status={org.prefix.status} />
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-500">
                        {formatDate(org.created_at)}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/organizations/${org.id}`}>
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

          {!isLoading && total > PAGE_SIZE && (
            <Pagination
              currentPage={page}
              hasNext={hasNext}
              total={total}
              limit={PAGE_SIZE}
              onPageChange={loadOrganizations}
            />
          )}
        </CardContent>
      </Card>

      <ConfirmAction
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Organization"
        message={`Are you sure you want to delete "${deleteTarget?.legal_name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
      />
    </div>
  );
}
