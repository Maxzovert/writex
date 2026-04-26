const LEGACY_SUPABASE_PATH_FRAGMENT = "/storage/v1/object/public/";

export const isLegacySupabaseImageUrl = (value?: string | null): boolean => {
  if (!value || typeof value !== "string") return false;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return false;
  return normalized.includes("supabase.co") && normalized.includes(LEGACY_SUPABASE_PATH_FRAGMENT);
};

export const getSafeImageUrl = (value?: string | null): string | null => {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (isLegacySupabaseImageUrl(trimmed)) return null;
  return trimmed;
};
