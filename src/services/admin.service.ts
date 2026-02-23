import apiClient from "@/lib/api-client";
import type {
  AdminUser,
  UpdateUserDto,
  ApiResponse,
  PaginatedResponse,
  Organization,
  Aidoi,
} from "@/types";

export const adminService = {
  // ────────────────────────────────────────────── Users
  async getUsers(
    page = 0,
    limit = 10
  ): Promise<ApiResponse<PaginatedResponse<AdminUser>>> {
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<AdminUser>>
    >("/user", { params: { page, limit } });
    return response.data;
  },

  async getUserById(id: string): Promise<ApiResponse<AdminUser>> {
    const response = await apiClient.get<ApiResponse<AdminUser>>(
      `/user/${id}`
    );
    return response.data;
  },

  async updateUser(dto: UpdateUserDto): Promise<ApiResponse<AdminUser>> {
    const response = await apiClient.put<ApiResponse<AdminUser>>(
      "/user",
      dto
    );
    return response.data;
  },

  async deleteUser(userId: string): Promise<ApiResponse<unknown>> {
    const response = await apiClient.delete<ApiResponse<unknown>>("/user", {
      data: { user_id: userId },
    });
    return response.data;
  },

  // ────────────────────────────────────────── Organizations (admin sees all)
  async getAllOrganizations(
    page = 0,
    limit = 10
  ): Promise<ApiResponse<PaginatedResponse<Organization>>> {
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<Organization>>
    >("/organization", { params: { page, limit } });
    return response.data;
  },

  // ────────────────────────────────────────── AIDOIs (admin sees all)
  async getAllAidois(
    page = 0,
    limit = 10
  ): Promise<ApiResponse<PaginatedResponse<Aidoi>>> {
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<Aidoi>>
    >("/aidoi", { params: { page, limit } });
    return response.data;
  },
};
