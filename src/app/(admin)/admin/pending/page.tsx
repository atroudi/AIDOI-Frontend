"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TableSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { useToast } from "@/components/ui/toast";
import { adminService } from "@/services";
import type { AdminUser } from "@/types";
import { getUserRoleKey } from "@/types";

export default function AdminPendingPage() {
  const { showToast } = useToast();
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionTarget, setActionTarget] = useState<{
    user: AdminUser;
    action: "approve" | "reject";
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch all users to filter pending ones
      const res = await adminService.getUsers(0, 100);
      setAllUsers(res.data.records);
    } catch {
      showToast("Failed to load users", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Pending = verified users with 'authenticated' role (not yet promoted to OrgAdmin)
  const pendingUsers = allUsers.filter(
    (u) => getUserRoleKey(u.role) === "authenticated" && u.verified && !u.banned
  );

  const handleAction = async () => {
    if (!actionTarget) return;
    setIsProcessing(true);
    try {
      if (actionTarget.action === "approve") {
        await adminService.updateUser({
          id: actionTarget.user.id,
          role: { other: "OrgAdmin" },
        });
        showToast(
          `${actionTarget.user.first_name} ${actionTarget.user.last_name} promoted to Org Admin`,
          "success"
        );
      } else {
        await adminService.updateUser({
          id: actionTarget.user.id,
          banned: true,
        });
        showToast(
          `${actionTarget.user.first_name} ${actionTarget.user.last_name} has been banned`,
          "success"
        );
      }
      setActionTarget(null);
      loadUsers();
    } catch {
      showToast("Failed to process action", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Pending Requests</h1>
        {!isLoading && (
          <span className="text-sm text-gray-500">
            {pendingUsers.length} pending
          </span>
        )}
      </div>

      <Card>
        <CardHeader>
          <p className="text-sm text-gray-500">
            Verified users awaiting Org Admin role promotion. Approve to grant organization
            management permissions.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4">
              <TableSkeleton rows={5} cols={5} />
            </div>
          ) : pendingUsers.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-400" />
              <p className="text-sm">No pending requests.</p>
              <p className="text-xs mt-1 text-gray-300">
                All verified users have been assigned roles.
              </p>
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
                      Verified
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pendingUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-3 text-sm text-gray-900 font-medium">
                        {user.first_name} {user.last_name}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">
                        {user.email}
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <span className="text-green-600">Verified</span>
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                          Pending
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() =>
                              setActionTarget({ user, action: "approve" })
                            }
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() =>
                              setActionTarget({ user, action: "reject" })
                            }
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
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

      <ConfirmAction
        isOpen={!!actionTarget}
        onClose={() => setActionTarget(null)}
        onConfirm={handleAction}
        title={
          actionTarget?.action === "approve"
            ? "Approve Org Admin Request"
            : "Reject & Ban User"
        }
        message={
          actionTarget?.action === "approve"
            ? `Promote "${actionTarget?.user.first_name} ${actionTarget?.user.last_name}" to Org Admin? They will be able to create organizations and manage AIDOIs.`
            : `Ban "${actionTarget?.user.first_name} ${actionTarget?.user.last_name}"? They will no longer be able to access the portal.`
        }
        confirmLabel={actionTarget?.action === "approve" ? "Approve" : "Ban User"}
        confirmVariant={actionTarget?.action === "approve" ? "primary" : "danger"}
        isLoading={isProcessing}
      />
    </div>
  );
}
