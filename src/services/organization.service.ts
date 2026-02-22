import apiClient from "@/lib/api-client";
import type {
  Organization,
  CreateOrganizationDto,
  UpdateOrganizationDto,
  ApiResponse,
  PaginatedResponse,
} from "@/types";

export const organizationService = {
  async create(
    data: CreateOrganizationDto
  ): Promise<ApiResponse<Organization>> {
    const response = await apiClient.post<ApiResponse<Organization>>(
      "/organization",
      data
    );
    return response.data;
  },

  async getMany(
    page = 0,
    limit = 10
  ): Promise<ApiResponse<PaginatedResponse<Organization>>> {
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<Organization>>
    >("/organization", {
      params: { page, limit },
    });
    return response.data;
  },

  async getById(id: string): Promise<ApiResponse<Organization>> {
    const response = await apiClient.get<ApiResponse<Organization>>(
      `/organization/${id}`
    );
    return response.data;
  },

  async update(
    data: UpdateOrganizationDto
  ): Promise<ApiResponse<Organization>> {
    const response = await apiClient.put<ApiResponse<Organization>>(
      "/organization",
      data
    );
    return response.data;
  },

  async deleteById(id: string): Promise<ApiResponse<Organization>> {
    const response = await apiClient.delete<ApiResponse<Organization>>(
      `/organization/${id}`
    );
    return response.data;
  },
};
