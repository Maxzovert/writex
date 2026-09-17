import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { ArrowRight, Eye } from "lucide-react"
import { getSafeImageUrl } from "@/lib/image-url"
import {
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
        const normalizedCategory = normalizeCategory(category)
        const params = new URLSearchParams({
          exclude: currentBlogId,
          limit: String(limit),
        })
        if (normalizedCategory && normalizedCategory !== "All") {
          params.set("category", normalizedCategory)
        }

        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/public/posts/related?${params.toString()}`
        )
        const blogs: RelatedBlog[] = response.data.blogs ?? []

        if (!cancelled) {
          setRelatedBlogs(blogs)
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
        "not-prose overflow-hidden rounded-2xl border border-[var(--wx-line)] bg-[var(--wx-elev)]",
        className
      )}
    >
      <div className="border-b border-[var(--wx-line)] px-4 py-3.5">
        <h2 className="wx-serif text-lg text-[var(--wx-text)]">Related notes</h2>
        <p className="mt-0.5 text-xs text-[var(--wx-mute)]">{normalizedCategory}</p>
      </div>

      <div className="p-2">
        {loading ? (
          <div className="space-y-2 px-2 py-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-14 animate-pulse rounded-lg bg-[var(--wx-soft)]"
              />
            ))}
          </div>
        ) : relatedBlogs.length === 0 ? (
          <p className="px-2 py-3 text-sm leading-relaxed text-[var(--wx-mute)]">
            No other notes in {normalizedCategory} yet.
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
                  className="group flex w-full items-start gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-[var(--wx-soft)]"
                >
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[var(--wx-soft)]">
                    {safeImage ? (
                      <img
                        src={safeImage}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-[var(--wx-mute)]">
                        —
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium leading-snug text-[var(--wx-text)]">
                      {item.title || "Untitled note"}
                    </p>
                    <p className="mt-1 line-clamp-1 text-xs text-[var(--wx-mute)]">
                      {item.author?.username || "Unknown"}
                      {item.createdAt ? ` · ${formatDate(item.createdAt)}` : ""}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-[var(--wx-mute)]">
                      <Eye className="h-3 w-3" />
                      {item.viewCount ?? 0}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {!loading && relatedBlogs.length > 0 && (
        <div className="border-t border-[var(--wx-line)] px-4 py-2.5">
          <button
            type="button"
            onClick={() => navigate(getCategoryFeedUrl(normalizedCategory))}
            className="inline-flex items-center gap-1 text-xs font-medium text-[var(--wx-accent)] transition-opacity hover:opacity-80"
          >
            Browse all
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      )}
    </section>
  )
}
