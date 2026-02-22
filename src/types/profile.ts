// Profile types matching backend Profile entity

export interface Profile {
  id: string;
  user_id: string;
  organization_id?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export interface UpdateProfileDto {
  id: string;
  organization_id?: string;
}
