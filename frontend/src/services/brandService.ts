import { apiClient } from "../api/client";
import type { BrandInfo } from "../types/landingPage";

/**
 * Fetch published brand info (logo, name, favicon).
 */
export async function getBrand(): Promise<BrandInfo> {
  const response = await apiClient.get<BrandInfo>("/api/v1/content/brand");
  return response.data;
}
