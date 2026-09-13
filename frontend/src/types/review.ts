/**
 * JACRAL – Customer Review Types.
 */

export interface CustomerReview {
  id: number;
  customer_name: string;
  customer_location?: string | null;
  customer_image_url?: string | null;
  review_text: string;
  rating: number;
  product_id?: number | null;
  display_order: number;
}

export interface CustomerReviewAdmin extends CustomerReview {
  is_active: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReviewCreateInput {
  customer_name: string;
  customer_location?: string;
  review_text: string;
  rating: number;
  product_id?: number | null;
  display_order?: number;
  is_active?: boolean;
  is_published?: boolean;
}

export interface ReviewUpdateInput {
  customer_name?: string;
  customer_location?: string;
  review_text?: string;
  rating?: number;
  product_id?: number | null;
  display_order?: number;
  is_active?: boolean;
  is_published?: boolean;
}
