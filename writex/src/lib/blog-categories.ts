export const BLOG_CATEGORY_TYPES = [
  "General",
  "Personal",
  "Business",
  "Tech",
  "Health",
  "Education",
  "Entertainment",
  "Sports",
  "Other",
] as const

export type BlogCategoryType = (typeof BLOG_CATEGORY_TYPES)[number]
export type BlogCategoryFilter = BlogCategoryType | "All"

const KNOWN_CATEGORIES = new Set<string>(
  BLOG_CATEGORY_TYPES.filter((category) => category !== "Other")
)

export function normalizeCategory(category?: string): BlogCategoryType {
  if (!category?.trim()) return "General"
  const normalized =
    category.trim().charAt(0).toUpperCase() +
    category.trim().slice(1).toLowerCase()
  return normalized as BlogCategoryType
}

export function resolveCategoryFilter(
  category?: string | null
): BlogCategoryFilter {
  if (!category || category === "All") return "All"
  const normalized = normalizeCategory(category)
  if (normalized === "Other") return "Other"
  if (KNOWN_CATEGORIES.has(normalized)) return normalized
  return "All"
}

export function blogMatchesCategory(
  blog: { category?: string },
  category: BlogCategoryFilter
): boolean {
  if (category === "All") return true
  if (category === "Other") {
    const normalized = normalizeCategory(blog.category)
    return !KNOWN_CATEGORIES.has(normalized)
  }
  return normalizeCategory(blog.category) === category
}

export function getCategoryFeedUrl(category: BlogCategoryFilter): string {
  if (category === "All") return "/blogs"
  return `/blogs?category=${encodeURIComponent(category)}`
}

export function filterBlogsByCategory<T extends { category?: string }>(
  blogs: T[],
  category: BlogCategoryFilter
): T[] {
  if (category === "All") return blogs
  return blogs.filter((blog) => blogMatchesCategory(blog, category))
}
