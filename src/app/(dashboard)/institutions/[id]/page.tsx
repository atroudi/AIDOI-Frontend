"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { LoadingSkeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { organizationService } from "@/services";
import type { Organization, LegalStatus } from "@/types";

const updateSchema = z.object({
  legal_name: z.string().min(2, "Institution name is required"),
  legal_status: z.string().min(1, "Institution type is required"),
  website: z.string().url("Please enter a valid URL"),
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  postal_code: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
});

type UpdateFormValues = z.infer<typeof updateSchema>;

const institutionTypeOptions = [
  { value: "academic", label: "University / Academic" },
  { value: "forprofit", label: "Corporate R&D" },
  { value: "nonprofit", label: "Non-Profit" },
  { value: "government", label: "Government" },
  { value: "ngo", label: "NGO" },
  { value: "other", label: "Independent Lab / Other" },
];

export default function InstitutionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const [org, setOrg] = useState<Organization | null>(null);
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
    async function loadOrg() {
      try {
        const res = await organizationService.getById(params.id as string);
        const data = res.data;
        setOrg(data);
        reset({
          legal_name: data.legal_name,
          legal_status: data.legal_status,
          website: data.website,
          street: data.address?.street || "",
          city: data.address?.city || "",
          state: data.address?.state || "",
          postal_code: data.address?.postal_code?.toString() || "",
          country: data.address?.country || "",
        });
      } catch {
        showToast("Failed to load institution", "error");
        router.push("/institutions");
      } finally {
        setIsLoading(false);
      }
    }
    loadOrg();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const onSubmit = async (data: UpdateFormValues) => {
    if (!org) return;
    setIsSaving(true);
    try {
      await organizationService.update({
        id: org.id,
        legal_name: data.legal_name,
        legal_status: data.legal_status as LegalStatus,
        website: data.website,
        address: {
          street: data.street,
          city: data.city,
          state: data.state || undefined,
          postal_code: parseInt(data.postal_code) || 0,
          country: data.country,
        },
      });
      showToast("Institution updated successfully!", "success");
      router.push("/institutions");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      showToast(
        axiosErr.response?.data?.message || "Failed to update institution",
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
          { label: "Institutions", href: "/institutions" },
          { label: org?.legal_name || "Detail" },
        ]}
      />

      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        {org?.legal_name}
      </h1>
      {org?.prefix && (
        <p className="text-sm text-gray-500 mb-6">
          Prefix: <span className="font-mono">{org.prefix.value}</span> ·
          Status: {org.prefix.status}
        </p>
      )}

      <Card>
        <CardContent className="py-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              id="legal_name"
              label="Institution Name"
              error={errors.legal_name?.message}
              {...register("legal_name")}
            />

            <Select
              id="legal_status"
              label="Institution Type"
              options={institutionTypeOptions}
              error={errors.legal_status?.message}
              {...register("legal_status")}
            />

            <Input
              id="website"
              label="Website URL"
              type="url"
              error={errors.website?.message}
              {...register("website")}
            />

            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Address
              </h3>
              <div className="space-y-4">
                <Input
                  id="street"
                  label="Street"
                  error={errors.street?.message}
                  {...register("street")}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    id="city"
                    label="City"
                    error={errors.city?.message}
                    {...register("city")}
                  />
                  <Input
                    id="state"
                    label="State / Region"
                    {...register("state")}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    id="postal_code"
                    label="Postal Code"
                    error={errors.postal_code?.message}
                    {...register("postal_code")}
                  />
                  <Input
                    id="country"
                    label="Country"
                    error={errors.country?.message}
                    {...register("country")}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isSaving}>
                Update Institution
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
