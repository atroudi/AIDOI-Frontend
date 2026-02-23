"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { organizationService } from "@/services";
import { formatDate } from "@/lib/utils";
import type { Organization } from "@/types";
import { LEGAL_STATUS_LABELS } from "@/types";

export default function AdminOrganizationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const [org, setOrg] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await organizationService.getById(params.id as string);
        setOrg(res.data);
      } catch {
        showToast("Failed to load organization", "error");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [params.id, showToast]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton className="h-8 w-64" />
        <Card>
          <CardContent className="space-y-4 py-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <LoadingSkeleton key={i} className="h-6 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="text-center py-12 text-gray-400">
        Organization not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">{org.legal_name}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Info */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">General Information</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow label="Legal Name" value={org.legal_name} />
            <InfoRow label="Short Name" value={org.short_name} />
            <InfoRow
              label="Type"
              value={LEGAL_STATUS_LABELS[org.legal_status] || org.legal_status}
            />
            <InfoRow
              label="Website"
              value={
                <a
                  href={org.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {org.website}
                </a>
              }
            />
            <InfoRow label="Admin ID" value={org.admin_id} mono />
            {org.tech_id && <InfoRow label="Tech ID" value={org.tech_id} mono />}
            {org.billing_id && <InfoRow label="Billing ID" value={org.billing_id} mono />}
          </CardContent>
        </Card>

        {/* Prefix & Dates */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Prefix & Audit</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow label="Prefix" value={org.prefix.value} mono />
            <InfoRow
              label="Prefix Status"
              value={<StatusBadge status={org.prefix.status} />}
            />
            <InfoRow label="Created At" value={formatDate(org.created_at)} />
            <InfoRow label="Updated At" value={formatDate(org.updated_at)} />
            <InfoRow label="Created By" value={org.created_by} mono />
            <InfoRow label="Updated By" value={org.updated_by} mono />
          </CardContent>
        </Card>

        {/* Address */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Address</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <InfoRow label="Street" value={org.address.street} />
              <InfoRow label="City" value={org.address.city} />
              {org.address.state && <InfoRow label="State" value={org.address.state} />}
              <InfoRow label="Postal Code" value={String(org.address.postal_code)} />
              <InfoRow label="Country" value={org.address.country} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
      <p className={`text-sm text-gray-900 mt-0.5 ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}
