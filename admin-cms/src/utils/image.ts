export function getImageUrl(url?: string | null): string {
  if (!url) {
    return "/images/products_serving_board_clean.jpg";
  }
  let targetUrl = url;
  if (targetUrl.startsWith("http://localhost:3000")) {
    targetUrl = targetUrl.replace("http://localhost:3000", "");
  }
  if (targetUrl.startsWith("http://") || targetUrl.startsWith("https://") || targetUrl.startsWith("data:")) {
    return targetUrl;
  }
  if (
    targetUrl.startsWith("/images/") ||
    targetUrl.startsWith("/favicon") ||
    targetUrl.startsWith("/hero") ||
    targetUrl.startsWith("/icons")
  ) {
    return targetUrl;
  }
  const baseUrl = (import.meta.env.VITE_API_URL as string) || "http://localhost:8000";
  const cleanUrl = targetUrl.startsWith("/") ? targetUrl : `/${targetUrl}`;
  return `${baseUrl}${cleanUrl}`;
}
