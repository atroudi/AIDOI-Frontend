"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { StatusBadge } from "@/components/ui/status-badge";
import { LoadingSkeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { aidoiService } from "@/services";
import type { Aidoi, AidoiResourceType } from "@/types";

const updateSchema = z.object({
  title: z.string().min(1, "AI Object Name is required"),
  resource_type: z.string().min(1, "Object type is required"),
  description: z.string().optional(),
  target_url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  suffix: z.string().optional(),
});

type UpdateFormValues = z.infer<typeof updateSchema>;

const resourceTypeOptions = [
  { value: "software", label: "Model / Codebase" },
  { value: "dataset", label: "Dataset" },
  { value: "journalarticle", label: "Paper / Journal Article" },
  { value: "report", label: "Report" },
  { value: "image", label: "Image" },
  { value: "audio", label: "Audio" },
  { value: "video", label: "Video" },
];

export default function AidoiDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const [aidoi, setAidoi] = useState<Aidoi | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateFormValues>({
    resolver: zodResolver(updateSchema),
  });

  useEffect(() => {
    async function loadAidoi() {
      try {
        const res = await aidoiService.getById(params.id as string);
        const data = res.data;
        setAidoi(data);
        reset({
          title: data.metadata?.title || "",
          resource_type: data.metadata?.resource_type || "",
          description: data.metadata?.description || "",
          target_url: data.target_url || "",
          suffix: data.suffix || "",
        });
      } catch {
        showToast("Failed to load AIDOI", "error");
        router.push("/aidois");
      } finally {
        setIsLoading(false);
      }
    }
    loadAidoi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const onSubmit = async (data: UpdateFormValues) => {
    if (!aidoi) return;
    setIsSaving(true);
    try {
      await aidoiService.update({
        id: aidoi.id,
        suffix: data.suffix || undefined,
        target_url: data.target_url || undefined,
        metadata: {
          title: data.title,
          resource_type: data.resource_type as AidoiResourceType,
          description: data.description || undefined,
        },
      });
      showToast("AIDOI updated successfully!", "success");
      router.push("/aidois");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      showToast(
        axiosErr.response?.data?.message || "Failed to update AIDOI",
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "AIDOIs", href: "/aidois" },
          { label: aidoi?.metadata?.title || "Detail" },
        ]}
      />

      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {aidoi?.metadata?.title || "AIDOI Detail"}
        </h1>
        {aidoi && <StatusBadge status={aidoi.status} />}
      </div>

      <Card>
        <CardContent className="py-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              id="title"
              label="AI Object Name"
              error={errors.title?.message}
              {...register("title")}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                id="resource_type"
                label="Object Type"
                options={resourceTypeOptions}
                error={errors.resource_type?.message}
                {...register("resource_type")}
              />

              <Input
                id="suffix"
                label="AIDOI Suffix"
                error={errors.suffix?.message}
                {...register("suffix")}
              />
            </div>

            <Input
              id="target_url"
              label="Target URL"
              type="url"
              error={errors.target_url?.message}
              {...register("target_url")}
            />

            <Textarea
              id="description"
              label="Description"
              {...register("description")}
            />

            {/* Metadata display */}
            {aidoi?.metadata?.total_score !== undefined && (
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  AI Transparency Score
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Total Score</p>
                    <p className="text-lg font-semibold">
                      {aidoi.metadata.total_score}
                    </p>
                  </div>
                  {aidoi.metadata.is_eligible !== undefined && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">Eligible</p>
                      <p className="text-lg font-semibold">
                        {aidoi.metadata.is_eligible ? "Yes" : "No"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isSaving}>
                Update AIDOI
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
