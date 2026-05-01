export const API_BASE = import.meta.env.VITE_API_URL || ''

// Resolves /uploads/ and /api/ paths to the backend origin in production.
export const resolveUrl = (url) => {
  if (!url || url.startsWith('http') || url.startsWith('//')) return url
  return API_BASE + url
}
