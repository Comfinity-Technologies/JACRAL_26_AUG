import { apiClient } from "../api/client";
import type {
  CustomerReview,
  CustomerReviewAdmin,
  ReviewCreateInput,
  ReviewUpdateInput,
} from "../types/review";

/**
 * Public: Fetch published active reviews for homepage.
 */
export async function getPublishedReviews(): Promise<CustomerReview[]> {
  const response = await apiClient.get<CustomerReview[]>("/api/v1/reviews");
  return response.data;
}

/**
 * Admin: Fetch all customer reviews (draft & published).
 */
export async function getAdminReviews(): Promise<CustomerReviewAdmin[]> {
  const response = await apiClient.get<CustomerReviewAdmin[]>("/api/v1/admin/reviews");
  return response.data;
}

/**
 * Admin: Create a new customer review.
 */
export async function createReview(data: ReviewCreateInput): Promise<CustomerReviewAdmin> {
  const response = await apiClient.post<CustomerReviewAdmin>("/api/v1/admin/reviews", data);
  return response.data;
}

/**
 * Admin: Update an existing customer review.
 */
export async function updateReview(
  id: number,
  data: ReviewUpdateInput
): Promise<CustomerReviewAdmin> {
  const response = await apiClient.put<CustomerReviewAdmin>(`/api/v1/admin/reviews/${id}`, data);
  return response.data;
}

/**
 * Admin: Delete a customer review.
 */
export async function deleteReview(id: number): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.delete(`/api/v1/admin/reviews/${id}`);
  return response.data;
}

/**
 * Admin: Publish a review.
 */
export async function publishReview(id: number): Promise<CustomerReviewAdmin> {
  const response = await apiClient.post<CustomerReviewAdmin>(`/api/v1/admin/reviews/${id}/publish`);
  return response.data;
}

/**
 * Admin: Unpublish a review.
 */
export async function unpublishReview(id: number): Promise<CustomerReviewAdmin> {
  const response = await apiClient.post<CustomerReviewAdmin>(
    `/api/v1/admin/reviews/${id}/unpublish`
  );
  return response.data;
}
