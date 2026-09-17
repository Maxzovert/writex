import {
  ArrowBigUp,
  BookA,
  BookHeart,
  CircuitBoard,
  Handshake,
  HeartPulse,
  Medal,
  Sparkles,
  Tag,
  Tv,
  type LucideIcon,
} from "lucide-react"
import {
  BLOG_CATEGORY_TYPES,
  type BlogCategoryFilter,
  type BlogCategoryType,
} from "@/lib/blog-categories"
import { cn } from "@/lib/utils"

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

export type TopicRailItem = {
  type: BlogCategoryFilter
  count?: number
}

interface TopicFilterRailProps {
  activeCategory: BlogCategoryFilter
  onSelect: (category: BlogCategoryFilter) => void
  counts?: Partial<Record<BlogCategoryFilter, number>>
  /** Include All chip at the start */
  includeAll?: boolean
  allCount?: number
  className?: string
  size?: "sm" | "md"
}

export function TopicFilterRail({
  activeCategory,
  onSelect,
  counts,
  includeAll = true,
  allCount,
  className,
  size = "md",
}: TopicFilterRailProps) {
  const items: TopicRailItem[] = [
    ...(includeAll ? [{ type: "All" as const, count: allCount }] : []),
    ...BLOG_CATEGORY_TYPES.map((type) => ({
      type,
      count: counts?.[type],
    })),
  ]

  const isMd = size === "md"

  return (
    <div
      className={cn(
        "flex w-full gap-1.5 overflow-x-auto pb-0.5 scrollbar-none",
        className
      )}
      role="tablist"
      aria-label="Filter by topic"
    >
      {items.map((item) => {
        const isActive = activeCategory === item.type
        const Icon =
          item.type === "All" ? Sparkles : CATEGORY_ICONS[item.type as BlogCategoryType]

        return (
          <button
            key={item.type}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(item.type)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border font-medium transition",
              isMd ? "px-3.5 py-2 text-sm" : "px-2.5 py-1.5 text-xs",
              isActive
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
            )}
          >
            <Icon className={cn("shrink-0 opacity-80", isMd ? "h-3.5 w-3.5" : "h-3 w-3")} />
            <span>{item.type}</span>
            {typeof item.count === "number" ? (
              <span
                className={cn(
                  "tabular-nums",
                  isActive
                    ? "text-primary-foreground/80"
                    : "text-muted-foreground/80"
                )}
              >
                {item.count}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
