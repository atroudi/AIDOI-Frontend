// Organization types matching backend Organization entity

export interface Address {
  street: string;
  city: string;
  state?: string;
  postal_code: number;
  country: string;
}

export type LegalStatus =
  | "nonprofit"
  | "forprofit"
  | "government"
  | "academic"
  | "ngo"
  | "other";

export type PrefixStatus = "active" | "suspended" | "retired";

export interface AidoiPrefix {
  value: string;
  status: PrefixStatus;
}

export interface Organization {
  id: string;
  legal_name: string;
  short_name: string;
  legal_status: LegalStatus;
  address: Address;
  website: string;
  admin_id: string;
  tech_id?: string;
  billing_id?: string;
  prefix: AidoiPrefix;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export interface CreateOrganizationDto {
  legal_name: string;
  short_name: string;
  legal_status: LegalStatus;
  address: Address;
  website: string;
}

export interface UpdateOrganizationDto {
  id: string;
  legal_name?: string;
  short_name?: string;
  legal_status?: LegalStatus;
  address?: Address;
  website?: string;
  admin_id?: string;
  tech_id?: string;
  billing_id?: string;
  prefix?: {
    value: string;
    status: PrefixStatus;
  };
}

export const LEGAL_STATUS_LABELS: Record<LegalStatus, string> = {
  academic: "University / Academic",
  forprofit: "Corporate R&D",
  nonprofit: "Non-Profit",
  government: "Government",
  ngo: "NGO",
  other: "Independent Lab / Other",
};
