const configuredApiUrl = import.meta.env.VITE_API_URL || "";

const getBackendOrigin = () => {
  if (typeof window === "undefined") return "";

  try {
    return new URL(configuredApiUrl || window.location.origin, window.location.origin).origin;
  } catch {
    return window.location.origin;
  }
};

export function resolveImageUrl(imageUrl) {
  if (!imageUrl || typeof imageUrl !== "string") return "";

  const trimmedUrl = imageUrl.trim();
  if (!trimmedUrl) return "";
  if (/^https?:\/\//i.test(trimmedUrl)) return trimmedUrl;

  const backendOrigin = getBackendOrigin();
  if (!backendOrigin) return trimmedUrl;

  try {
    return new URL(trimmedUrl, `${backendOrigin}/`).toString();
  } catch {
    return trimmedUrl;
  }
}
