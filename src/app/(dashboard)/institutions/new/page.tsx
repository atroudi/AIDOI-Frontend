"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useToast } from "@/components/ui/toast";
import { organizationService } from "@/services";
import type { LegalStatus } from "@/types";

const institutionSchema = z.object({
  legal_name: z.string().min(2, "Institution name is required"),
  legal_status: z.string().min(1, "Institution type is required"),
  website: z.string().url("Please enter a valid URL"),
  contact_email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  description: z.string().optional(),
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  postal_code: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
});

type InstitutionFormValues = z.infer<typeof institutionSchema>;

const institutionTypeOptions = [
  { value: "academic", label: "University / Academic" },
  { value: "forprofit", label: "Corporate R&D" },
  { value: "nonprofit", label: "Non-Profit" },
  { value: "government", label: "Government" },
  { value: "ngo", label: "NGO" },
  { value: "other", label: "Independent Lab / Other" },
];

export default function NewInstitutionPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InstitutionFormValues>({
    resolver: zodResolver(institutionSchema),
    defaultValues: {
      legal_status: "",
    },
  });

  const onSubmit = async (data: InstitutionFormValues) => {
    setIsLoading(true);
    try {
      // Derive short_name from legal_name (acronym or first word)
      const words = data.legal_name.split(/\s+/);
      const short_name =
        words.length > 1
          ? words.map((w) => w[0]).join("").toUpperCase()
          : words[0].toUpperCase();

      await organizationService.create({
        legal_name: data.legal_name,
        short_name,
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

      showToast("Institution submitted successfully!", "success");
      router.push("/institutions");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      showToast(
        axiosErr.response?.data?.message || "Failed to create institution",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Institutions", href: "/institutions" },
          { label: "New" },
        ]}
      />

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Add New Institution
      </h1>

      <Card>
        <CardContent className="py-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              id="legal_name"
              label="Institution Name"
              placeholder="e.g. Qatar Computing Research Institute"
              error={errors.legal_name?.message}
              {...register("legal_name")}
            />

            <Select
              id="legal_status"
              label="Institution Type"
              options={institutionTypeOptions}
              placeholder="University, Corporate R&D, Independent Lab"
              error={errors.legal_status?.message}
              {...register("legal_status")}
            />

            <Input
              id="website"
              label="Website URL"
              type="url"
              placeholder="https://www.institution.edu"
              error={errors.website?.message}
              {...register("website")}
            />

            <Input
              id="contact_email"
              label="Official Contact Email"
              type="email"
              placeholder="admin@institution.edu"
              error={errors.contact_email?.message}
              {...register("contact_email")}
            />

            <Textarea
              id="description"
              label="Description / Notes"
              placeholder="Brief description of your institution..."
              {...register("description")}
            />

            {/* Address Section */}
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Address
              </h3>
              <div className="space-y-4">
                <Input
                  id="street"
                  label="Street"
                  placeholder="123 Research Ave"
                  error={errors.street?.message}
                  {...register("street")}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    id="city"
                    label="City"
                    placeholder="Doha"
                    error={errors.city?.message}
                    {...register("city")}
                  />
                  <Input
                    id="state"
                    label="State / Region"
                    placeholder="Optional"
                    error={errors.state?.message}
                    {...register("state")}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    id="postal_code"
                    label="Postal Code"
                    placeholder="00000"
                    error={errors.postal_code?.message}
                    {...register("postal_code")}
                  />
                  <Input
                    id="country"
                    label="Country"
                    placeholder="Qatar"
                    error={errors.country?.message}
                    {...register("country")}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isLoading}>
                Submit Institution for Review
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
