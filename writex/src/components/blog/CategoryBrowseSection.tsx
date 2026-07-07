import { useNavigate } from "react-router-dom"
import {
  ArrowBigUp,
  BookA,
  BookHeart,
  CircuitBoard,
  Handshake,
  HeartPulse,
  Medal,
  Tag,
  Tv,
  type LucideIcon,
} from "lucide-react"
import {
  BLOG_CATEGORY_TYPES,
  getCategoryFeedUrl,
  normalizeCategory,
  type BlogCategoryType,
} from "@/lib/blog-categories"
import { cn } from "@/lib/utils"

interface CategoryBrowseSectionProps {
  currentCategory?: string
  className?: string
}

const CATEGORY_ICONS: Record<BlogCategoryType, LucideIcon> = {
  General: Tag,
  Personal: BookHeart,
  Business: Handshake,
  Tech: CircuitBoard,
  Health: HeartPulse,
  Education: BookA,
  Entertainment: Tv,
  Sports: Medal,
  Other: ArrowBigUp,
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
        "not-prose overflow-hidden rounded-xl border border-border bg-card shadow-sm",
        className
      )}
    >
      <div className="border-b border-border/60 px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">Read by category</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Explore blogs from the feed
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 p-3">
        {BLOG_CATEGORY_TYPES.map((category) => {
          const Icon = CATEGORY_ICONS[category]
          const isActive = category === activeCategory

          return (
            <button
              key={category}
              type="button"
              onClick={() => navigate(getCategoryFeedUrl(category))}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs font-medium transition-colors",
                isActive
                  ? "border-foreground/20 bg-muted text-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-foreground/15 hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{category}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
