// Auth types matching backend core_server auth endpoints

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  new_password: string;
}

export interface ChangePasswordRequest {
  old_pwd: string;
  new_pwd: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
}

export interface UserRole {
  admin?: boolean;
  authenticated?: boolean;
  other?: string;
}

export interface Claims {
  user_id: string;
  user_role: UserRole;
  first_name: string;
  last_name: string;
  email: string;
  exp: number;
  api_key?: string;
}

export interface LoginResponse {
  user: User;
  refresh_token?: string;
}
