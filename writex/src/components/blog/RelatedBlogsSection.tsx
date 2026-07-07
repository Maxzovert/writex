import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { ArrowRight, Eye, Tag } from "lucide-react"
import { getSafeImageUrl } from "@/lib/image-url"
import {
  blogMatchesCategory,
  getCategoryFeedUrl,
  normalizeCategory,
} from "@/lib/blog-categories"
import { cn } from "@/lib/utils"

interface RelatedBlog {
  _id: string
  title?: string
  category?: string
  mainImage?: string
  description?: string
  viewCount?: number
  createdAt?: string
  author?: {
    username?: string
    profileImage?: string
  }
}

interface RelatedBlogsSectionProps {
  currentBlogId: string
  category?: string
  className?: string
  limit?: number
}

function formatDate(dateString?: string): string {
  if (!dateString) return ""
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

export function RelatedBlogsSection({
  currentBlogId,
  category,
  className = "",
  limit = 5,
}: RelatedBlogsSectionProps) {
  const navigate = useNavigate()
  const [relatedBlogs, setRelatedBlogs] = useState<RelatedBlog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const fetchRelatedBlogs = async () => {
      try {
        setLoading(true)
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/public/posts/blogs/`
        )
        const allBlogs: RelatedBlog[] = response.data.allBlogs ?? []
        const normalizedCategory = normalizeCategory(category)

        const filtered = allBlogs
          .filter(
            (item) =>
              item._id !== currentBlogId &&
              blogMatchesCategory(item, normalizedCategory)
          )
          .slice(0, limit)

        if (!cancelled) {
          setRelatedBlogs(filtered)
        }
      } catch {
        if (!cancelled) {
          setRelatedBlogs([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    if (currentBlogId) {
      fetchRelatedBlogs()
    }

    return () => {
      cancelled = true
    }
  }, [currentBlogId, category, limit])

  const normalizedCategory = normalizeCategory(category)

  return (
    <section
      className={cn(
        "not-prose overflow-hidden rounded-xl border border-border bg-card shadow-sm",
        className
      )}
    >
      <div className="border-b border-border/60 px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">
          Read more related blogs
        </h2>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
          <Tag className="h-3 w-3 shrink-0" />
          {normalizedCategory}
        </p>
      </div>

      <div className="p-2">
        {loading ? (
          <div className="space-y-2 px-2 py-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-16 animate-pulse rounded-lg bg-muted/60"
              />
            ))}
          </div>
        ) : relatedBlogs.length === 0 ? (
          <p className="px-2 py-3 text-sm leading-relaxed text-muted-foreground">
            No other blogs in {normalizedCategory} yet.
          </p>
        ) : (
          <div className="space-y-0.5">
            {relatedBlogs.map((item) => {
              const safeImage = getSafeImageUrl(item.mainImage)

              return (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => navigate(`/blog/${item._id}`)}
                  className="group flex w-full items-start gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-muted/50"
                >
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                    {safeImage ? (
                      <img
                        src={safeImage}
                        alt=""
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium leading-snug text-foreground group-hover:text-foreground/80">
                      {item.title || "Untitled blog"}
                    </p>
                    <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                      {item.author?.username || "Unknown author"}
                      {item.createdAt ? ` · ${formatDate(item.createdAt)}` : ""}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <Eye className="h-3 w-3" />
                      {item.viewCount ?? 0} views
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {!loading && relatedBlogs.length > 0 && (
        <div className="border-t border-border/60 px-4 py-2.5">
          <button
            type="button"
            onClick={() => navigate(getCategoryFeedUrl(normalizedCategory))}
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Browse all blogs
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      )}
    </section>
  )
}
