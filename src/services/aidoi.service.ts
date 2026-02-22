import apiClient from "@/lib/api-client";
import type {
  Aidoi,
  CreateAidoiDto,
  UpdateAidoiDto,
  ApiResponse,
  PaginatedResponse,
} from "@/types";

export const aidoiService = {
  async create(data: CreateAidoiDto): Promise<ApiResponse<Aidoi>> {
    const response = await apiClient.post<ApiResponse<Aidoi>>("/aidoi", data);
    return response.data;
  },

  async getMany(
    page = 0,
    limit = 10
  ): Promise<ApiResponse<PaginatedResponse<Aidoi>>> {
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<Aidoi>>
    >("/aidoi", {
      params: { page, limit },
    });
    return response.data;
  },

  async getById(id: string): Promise<ApiResponse<Aidoi>> {
    const response = await apiClient.get<ApiResponse<Aidoi>>(`/aidoi/${id}`);
    return response.data;
  },

  async update(data: UpdateAidoiDto): Promise<ApiResponse<Aidoi>> {
    const response = await apiClient.put<ApiResponse<Aidoi>>("/aidoi", data);
    return response.data;
  },

  async deleteById(id: string): Promise<ApiResponse<Aidoi>> {
    const response = await apiClient.delete<ApiResponse<Aidoi>>(
      `/aidoi/${id}`
    );
    return response.data;
  },
};
