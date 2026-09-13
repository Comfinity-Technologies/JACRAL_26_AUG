import { apiClient } from "../api/client";
import type {
  LandingPageData,
  AdminLandingPageData,
  HeroSlideAdmin,
} from "../types/landingPage";

export async function getLandingPage(): Promise<LandingPageData> {
  const response = await apiClient.get<LandingPageData>("/api/v1/content/landing-page");
  return response.data;
}

export async function getAdminLandingPage(): Promise<AdminLandingPageData> {
  const response = await apiClient.get<AdminLandingPageData>("/api/v1/admin/content/landing-page");
  return response.data;
}

export async function updateBrandDraft(data: { brand_name?: string; tagline?: string }) {
  const response = await apiClient.post("/api/v1/admin/content/brand", data);
  return response.data;
}

export async function uploadBrandLogo(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await apiClient.post("/api/v1/admin/content/brand/logo", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function removeBrandLogo() {
  const response = await apiClient.delete("/api/v1/admin/content/brand/logo");
  return response.data;
}

export async function uploadBrandFavicon(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await apiClient.post("/api/v1/admin/content/brand/favicon", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function createSlide(data: Partial<HeroSlideAdmin>) {
  const response = await apiClient.post<HeroSlideAdmin>("/api/v1/admin/content/landing-page/slides", data);
  return response.data;
}

export async function updateSlide(slideId: number, data: Partial<HeroSlideAdmin>) {
  const response = await apiClient.put<HeroSlideAdmin>(
    `/api/v1/admin/content/landing-page/slides/${slideId}`,
    data
  );
  return response.data;
}

export async function deleteSlide(slideId: number) {
  const response = await apiClient.delete(`/api/v1/admin/content/landing-page/slides/${slideId}`);
  return response.data;
}

export async function uploadSlideImage(
  slideId: number,
  file: File,
  target: "desktop" | "mobile" = "desktop"
) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("target", target);
  const response = await apiClient.post(
    `/api/v1/admin/content/landing-page/slides/${slideId}/image`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return response.data;
}

export async function updateSectionDraft(sectionKey: string, data: any) {
  const response = await apiClient.post(
    `/api/v1/admin/content/landing-page/sections/${sectionKey}`,
    data
  );
  return response.data;
}

export async function publishLandingPage() {
  const response = await apiClient.post("/api/v1/admin/content/landing-page/publish");
  return response.data;
}

// ── How To Use Step Management ──

export interface HowToUseStepAdmin {
  id: number;
  step_number: number;
  title: string;
  description?: string;
  image_url?: string | null;
  sort_order: number;
  is_active: boolean;
}

export async function adminGetHowToUseSteps(): Promise<HowToUseStepAdmin[]> {
  const response = await apiClient.get<HowToUseStepAdmin[]>("/api/v1/admin/content/how-to-use");
  return response.data;
}

export async function adminCreateHowToUseStep(data: {
  step_number: number;
  title: string;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
}): Promise<HowToUseStepAdmin> {
  const response = await apiClient.post<HowToUseStepAdmin>("/api/v1/admin/content/how-to-use", data);
  return response.data;
}

export async function adminUpdateHowToUseStep(
  stepId: number,
  data: Partial<Omit<HowToUseStepAdmin, "id">>
): Promise<HowToUseStepAdmin> {
  const response = await apiClient.put<HowToUseStepAdmin>(
    `/api/v1/admin/content/how-to-use/${stepId}`,
    data
  );
  return response.data;
}

export async function adminDeleteHowToUseStep(stepId: number) {
  const response = await apiClient.delete(`/api/v1/admin/content/how-to-use/${stepId}`);
  return response.data;
}

export async function adminUploadHowToUseStepImage(stepId: number, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await apiClient.post(
    `/api/v1/admin/content/how-to-use/${stepId}/image`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data;
}
