import apiClient from "@/lib/api-client";
import type {
  Profile,
  UpdateProfileDto,
  ApiResponse,
  PaginatedResponse,
} from "@/types";

export const profileService = {
  async getMyProfile(): Promise<ApiResponse<PaginatedResponse<Profile>>> {
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<Profile>>
    >("/profile", {
      params: { page: 0, limit: 1 },
    });
    return response.data;
  },

  async getById(id: string): Promise<ApiResponse<Profile>> {
    const response = await apiClient.get<ApiResponse<Profile>>(
      `/profile/${id}`
    );
    return response.data;
  },

  async update(data: UpdateProfileDto): Promise<ApiResponse<Profile>> {
    const response = await apiClient.put<ApiResponse<Profile>>(
      "/profile",
      data
    );
    return response.data;
  },
};
