/**
 * Helper to construct full media URL for images.
 * Prepends backend URL if relative path is provided.
 */
export function getImageUrl(url?: string | null): string {
  if (!url) {
    return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80";
  }
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  const baseUrl = (import.meta.env.VITE_API_URL as string) || "http://localhost:8000";
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  return `${baseUrl}${cleanUrl}`;
}
