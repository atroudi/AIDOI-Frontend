import apiClient from "@/lib/api-client";
import type {
  ApiKey,
  CreateApiKeyDto,
  ApiKeyCreateResponse,
  ApiResponse,
  PaginatedResponse,
} from "@/types";

export const apiKeyService = {
  async create(
    data: CreateApiKeyDto
  ): Promise<ApiResponse<ApiKeyCreateResponse>> {
    const response = await apiClient.post<ApiResponse<ApiKeyCreateResponse>>(
      "/api-key",
      data
    );
    return response.data;
  },

  async getMany(
    page = 0,
    limit = 10
  ): Promise<ApiResponse<PaginatedResponse<ApiKey>>> {
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<ApiKey>>
    >("/api-key", {
      params: { page, limit },
    });
    return response.data;
  },

  async deleteById(id: string): Promise<ApiResponse<ApiKey>> {
    const response = await apiClient.delete<ApiResponse<ApiKey>>(
      `/api-key/${id}`
    );
    return response.data;
  },
};
