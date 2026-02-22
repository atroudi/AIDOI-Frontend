import apiClient from "@/lib/api-client";
import type {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  ApiResponse,
  User,
} from "@/types";
import Cookies from "js-cookie";

export const authService = {
  async login(data: LoginRequest): Promise<{ user: User; token: string }> {
    const response = await apiClient.post<LoginResponse>(
      "/login",
      data
    );
    const token = response.headers["x-auth-token"];
    if (token) {
      Cookies.set("aidoi_token", token, { expires: 7 });
      localStorage.setItem("aidoi_token", token);
    }
    return { user: response.data.user, token };
  },

  async register(data: RegisterRequest): Promise<void> {
    await apiClient.post<ApiResponse<unknown>>("/register", data);
  },

  async verifyAccount(data: {
    email: string;
    token: string;
  }): Promise<void> {
    await apiClient.post<ApiResponse<unknown>>("/activate-account", data);
  },

  async logout(email: string): Promise<void> {
    try {
      await apiClient.post("/logout", { email });
    } finally {
      Cookies.remove("aidoi_token");
      localStorage.removeItem("aidoi_token");
    }
  },

  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    await apiClient.post("/forgot-password", data);
  },

  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    await apiClient.post("/reset-password", data);
  },

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await apiClient.post("/change-pwd", data);
  },
};
