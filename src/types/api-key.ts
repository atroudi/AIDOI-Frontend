// API Key types matching backend ApiKey entity

export interface ApiKey {
  id: string;
  organization_id: string;
  org_admin_id: string;
  key_hash: string;
  expires_at?: string;
  rate_limit?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export interface CreateApiKeyDto {
  organization_id: string;
  org_admin_id?: string;
}

export interface ApiKeyCreateResponse {
  api_key_token: string;
}
