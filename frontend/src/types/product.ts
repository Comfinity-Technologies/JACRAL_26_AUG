/**
 * JACRAL – Product Type Definitions.
 */

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku?: string | null;
  category_id?: number | null;
  description: string;
  price: number;
  discount_price?: number | null;
  stock: number;
  weight?: number | null;
  unit?: string | null;
  image_url?: string | null;
  hover_image_url?: string | null;
  category?: { id?: number; name: string; slug?: string } | string | null;
  badge?: string | null;
  featured: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}
