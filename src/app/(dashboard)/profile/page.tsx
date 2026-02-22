"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Key, Trash2, Copy, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ConfirmModal, Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/store/auth-store";
import {
  authService,
  profileService,
  apiKeyService,
  organizationService,
} from "@/services";
import { formatDate } from "@/lib/utils";
import type { ApiKey, Organization } from "@/types";

const changePasswordSchema = z
  .object({
    old_pwd: z.string().min(1, "Current password is required"),
    new_pwd: z.string().min(6, "New password must be at least 6 characters"),
    confirm_pwd: z.string(),
  })
  .refine((data) => data.new_pwd === data.confirm_pwd, {
    message: "Passwords do not match",
    path: ["confirm_pwd"],
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const { showToast } = useToast();

  // Password change
  const [isChangingPwd, setIsChangingPwd] = useState(false);
  const {
    register,
    handleSubmit,
    reset: resetPwdForm,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  // API Keys
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [isLoadingKeys, setIsLoadingKeys] = useState(true);
  const [newKeyToken, setNewKeyToken] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ApiKey | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const loadApiKeys = async () => {
    try {
      const res = await apiKeyService.getMany(0, 50);
      setApiKeys(res.data.records);
    } catch {
      // May not have keys
    } finally {
      setIsLoadingKeys(false);
    }
  };

  useEffect(() => {
    loadApiKeys();
    async function loadOrgs() {
      try {
        const res = await organizationService.getMany(0, 100);
        setOrgs(res.data.records);
      } catch {}
    }
    loadOrgs();
  }, []);

  const onChangePassword = async (data: ChangePasswordFormValues) => {
    setIsChangingPwd(true);
    try {
      await authService.changePassword({
        old_pwd: data.old_pwd,
        new_pwd: data.new_pwd,
      });
      showToast("Password changed successfully!", "success");
      resetPwdForm();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      showToast(
        axiosErr.response?.data?.message || "Failed to change password",
        "error"
      );
    } finally {
      setIsChangingPwd(false);
    }
  };

  const handleGenerateKey = async () => {
    if (orgs.length === 0) {
      showToast(
        "You need at least one institution to generate an API key",
        "error"
      );
      return;
    }
    setIsGenerating(true);
    try {
      const res = await apiKeyService.create({
        organization_id: orgs[0].id,
      });
      setNewKeyToken(res.data.api_key_token);
      loadApiKeys();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      showToast(
        axiosErr.response?.data?.message || "Failed to generate API key",
        "error"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteKey = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await apiKeyService.deleteById(deleteTarget.id);
      showToast("API key deleted", "success");
      setDeleteTarget(null);
      loadApiKeys();
    } catch {
      showToast("Failed to delete API key", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("Copied to clipboard!", "success");
  };

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Profile Settings" },
        ]}
      />

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Profile Settings
      </h1>

      <div className="space-y-6">
        {/* User Info */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">
              Account Information
            </h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="text-sm font-medium text-gray-900">
                  {user?.first_name} {user?.last_name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-900">
                  {user?.email}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">
              Change Password
            </h2>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit(onChangePassword)}
              className="space-y-4 max-w-md"
            >
              <Input
                id="old_pwd"
                label="Current Password"
                type="password"
                error={errors.old_pwd?.message}
                {...register("old_pwd")}
              />
              <Input
                id="new_pwd"
                label="New Password"
                type="password"
                error={errors.new_pwd?.message}
                {...register("new_pwd")}
              />
              <Input
                id="confirm_pwd"
                label="Confirm New Password"
                type="password"
                error={errors.confirm_pwd?.message}
                {...register("confirm_pwd")}
              />
              <Button type="submit" isLoading={isChangingPwd}>
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* API Keys */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                API Keys
              </h2>
              <Button
                size="sm"
                onClick={handleGenerateKey}
                isLoading={isGenerating}
              >
                <Key className="h-4 w-4 mr-1.5" />
                Generate New Key
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingKeys ? (
              <div className="p-6 text-sm text-gray-400">Loading keys...</div>
            ) : apiKeys.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-sm">
                No API keys generated yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                        Key ID
                      </th>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                        Created
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
                    {apiKeys.map((key) => (
                      <tr
                        key={key.id}
                        className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-3 text-sm font-mono text-gray-700">
                          {key.id.substring(0, 12)}...
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-500">
                          {formatDate(key.created_at)}
                        </td>
                        <td className="px-6 py-3 text-sm">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              key.is_active
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {key.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteTarget(key)}
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
      </div>

      {/* New API Key Modal */}
      <Modal
        isOpen={!!newKeyToken}
        onClose={() => {
          setNewKeyToken(null);
          setShowKey(false);
        }}
        title="API Key Generated"
        className="max-w-lg"
        footer={
          <Button
            onClick={() => {
              setNewKeyToken(null);
              setShowKey(false);
            }}
          >
            Done
          </Button>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Copy this key now — it will only be shown once.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 p-3 bg-gray-100 rounded-lg text-xs font-mono break-all">
              {showKey ? newKeyToken : "••••••••••••••••••••••••••••••••"}
            </code>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setShowKey(!showKey)}
                className="p-2 text-gray-500 hover:text-gray-700"
                title={showKey ? "Hide" : "Show"}
              >
                {showKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={() => copyToClipboard(newKeyToken || "")}
                className="p-2 text-gray-500 hover:text-gray-700"
                title="Copy"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteKey}
        title="Delete API Key"
        message="Are you sure you want to delete this API key? Any integrations using it will stop working."
        isLoading={isDeleting}
      />
    </div>
  );
}
