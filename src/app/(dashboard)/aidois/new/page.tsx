"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TagInput } from "@/components/ui/tag-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useToast } from "@/components/ui/toast";
import { aidoiService, organizationService } from "@/services";
import type { Organization, AidoiResourceType } from "@/types";

const aidoiSchema = z.object({
  title: z.string().min(1, "AI Object Name is required"),
  resource_type: z.string().min(1, "Object type is required"),
  version: z.string().optional(),
  organization_id: z.string().min(1, "Issuing institution is required"),
  description: z.string().optional(),
  target_url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

type AidoiFormValues = z.infer<typeof aidoiSchema>;

const resourceTypeOptions = [
  { value: "Software", label: "Model" },
  { value: "Dataset", label: "Dataset" },
  { value: "JournalArticle", label: "Paper" },
  { value: "Report", label: "Report" },
  { value: "Image", label: "Image" },
  { value: "Audio", label: "Audio" },
  { value: "Video", label: "Video" },
  { value: "Other", label: "Other" },
];

export default function NewAidoiPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [orgs, setOrgs] = useState<Organization[]>([]);

  const {
    register,
    handleSubmit,
    control,
    getValues,
    formState: { errors },
  } = useForm<AidoiFormValues>({
    resolver: zodResolver(aidoiSchema),
    defaultValues: {
      resource_type: "",
      organization_id: "",
    },
  });

  useEffect(() => {
    async function loadOrgs() {
      try {
        const res = await organizationService.getMany(0, 100);
        setOrgs(res.data.records);
      } catch {
        // May not have orgs yet
      }
    }
    loadOrgs();
  }, []);

  const submitAidoi = async (data: AidoiFormValues, isDraft: boolean) => {
    const setLoading = isDraft ? setIsSavingDraft : setIsLoading;
    setLoading(true);
    try {
      // Generate a suffix from the title
      const suffix = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .substring(0, 50);

      await aidoiService.create({
        suffix: data.version ? `${suffix}/v${data.version}` : suffix,
        target_url: data.target_url || `https://aidoi.org/${suffix}`,
        organization_id: data.organization_id,
        metadata: {
          title: data.title,
          resource_type: data.resource_type as AidoiResourceType,
          description: data.description || undefined,
        },
      });

      showToast(
        isDraft ? "Draft saved!" : "AIDOI minted successfully!",
        "success"
      );
      router.push("/aidois");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      showToast(
        axiosErr.response?.data?.message || "Failed to create AIDOI",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (data: AidoiFormValues) => submitAidoi(data, false);

  const handleSaveDraft = () => {
    const data = getValues();
    // Skip validation for draft
    if (!data.title) {
      showToast("Please enter at least an object name", "error");
      return;
    }
    submitAidoi(
      {
        ...data,
        organization_id: data.organization_id || orgs[0]?.id || "",
      },
      true
    );
  };

  const orgOptions = orgs.map((org) => ({
    value: org.id,
    label: org.legal_name,
  }));

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "AIDOIs", href: "/aidois" },
          { label: "New" },
        ]}
      />

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Create New AIDOI (Digital Object Identifier)
      </h1>

      <Card>
        <CardContent className="py-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              id="title"
              label="AI Object Name"
              placeholder="e.g. GPT-4 Model Card"
              error={errors.title?.message}
              {...register("title")}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                id="resource_type"
                label="Object Type"
                options={resourceTypeOptions}
                placeholder="Model, Dataset, Paper, Codebase"
                error={errors.resource_type?.message}
                {...register("resource_type")}
              />

              <Input
                id="version"
                label="Current Version"
                placeholder="e.g. v1.2.0"
                {...register("version")}
              />
            </div>

            <Select
              id="organization_id"
              label="Issuing Institution"
              options={orgOptions}
              placeholder="Select from user's registered institutions"
              error={errors.organization_id?.message}
              {...register("organization_id")}
            />

            {/* Metadata section */}
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Metadata
              </h3>

              <div className="space-y-5">
                <Textarea
                  id="description"
                  label="Abstract / Description"
                  placeholder="Describe the AI object, its purpose, and key characteristics..."
                  {...register("description")}
                />

                <Input
                  id="target_url"
                  label="Target URL"
                  type="url"
                  placeholder="https://example.com/resource"
                  error={errors.target_url?.message}
                  {...register("target_url")}
                />

                <Controller
                  name="title"
                  control={control}
                  render={() => (
                    <TagInput
                      label="Keywords/Tags"
                      tags={tags}
                      onChange={setTags}
                      placeholder="Type a keyword and press Enter"
                    />
                  )}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                isLoading={isSavingDraft}
              >
                Save Draft
              </Button>
              <Button type="submit" isLoading={isLoading}>
                Mint AIDOI
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
