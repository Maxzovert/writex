import { useNavigate } from "react-router-dom"
import {
  BLOG_CATEGORY_TYPES,
  getCategoryFeedUrl,
  normalizeCategory,
} from "@/lib/blog-categories"
import { TopicFilterRail } from "@/components/blog/TopicFilterRail"
import { cn } from "@/lib/utils"

interface CategoryBrowseSectionProps {
  currentCategory?: string
  className?: string
}

export function CategoryBrowseSection({
  currentCategory,
  className = "",
}: CategoryBrowseSectionProps) {
  const navigate = useNavigate()
  const activeCategory = normalizeCategory(currentCategory)

  return (
    <section
      className={cn(
        "not-prose overflow-hidden rounded-2xl border border-border bg-card shadow-sm",
        className
      )}
    >
      <div className="border-b border-border px-4 py-3.5">
        <h2 className="wx-serif text-lg text-foreground">Topics</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">Browse the feed</p>
      </div>

      <div className="p-3">
        <TopicFilterRail
          activeCategory={
            BLOG_CATEGORY_TYPES.includes(activeCategory as never)
              ? activeCategory
              : "General"
          }
          onSelect={(category) => navigate(getCategoryFeedUrl(category))}
          includeAll={false}
          size="sm"
          className="flex-wrap overflow-visible"
        />
      </div>
    </section>
  )
}
