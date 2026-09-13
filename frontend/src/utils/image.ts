/**
 * Helper to construct full media URL for product images.
 * Prepends backend URL if relative path is provided.
 */
export function getImageUrl(url?: string | null): string {
  if (!url) {
    return "/images/products_serving_board_clean.jpg";
  }
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  if (
    url.startsWith("/images/") ||
    url.startsWith("/favicon") ||
    url.startsWith("/hero") ||
    url.startsWith("/icons")
  ) {
    return url;
  }
  const baseUrl = (import.meta.env.VITE_API_URL as string) || "http://localhost:8000";
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  return `${baseUrl}${cleanUrl}`;
}
