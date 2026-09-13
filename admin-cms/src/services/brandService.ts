import { apiClient } from "../api/client";
import type { BrandInfo } from "../types/landingPage";

export async function getBrand(): Promise<BrandInfo> {
  const response = await apiClient.get<BrandInfo>("/api/v1/content/brand");
  return response.data;
}
