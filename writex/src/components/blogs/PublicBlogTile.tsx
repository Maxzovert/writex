import { ArrowRight, Eye } from "lucide-react"
import { Link } from "react-router-dom"
import { getSafeImageUrl } from "@/lib/image-url"
import { cn } from "@/lib/utils"

function firstUpperCase(str?: string) {
  if (!str) return "Unknown"
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function formatDate(dateString?: string) {
  if (!dateString) return "Unknown"
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export interface PublicBlogTileProps {
  blog: {
    _id: string
    title?: string
    description?: string
    mainImage?: string
    category?: string
    createdAt?: string
    viewCount?: number
    author?: {
      username?: string
      profileImage?: string
    }
    sharedBy?: {
      username?: string
    }
  }
  onOpen: () => void
  className?: string
}

export function PublicBlogTile({ blog, onOpen, className }: PublicBlogTileProps) {
  const safeMainImage = getSafeImageUrl(blog.mainImage)
  const safeAuthorImage = getSafeImageUrl(blog.author?.profileImage)
  const authorName = firstUpperCase(blog.author?.username)

  return (
    <article
      className={cn(
        "group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border/70 bg-background shadow-sm transition hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg",
        className
      )}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onOpen()
        }
      }}
      role="link"
      tabIndex={0}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {safeMainImage ? (
          <img
            src={safeMainImage}
            alt={blog.title || "Blog cover"}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-primary/15 via-muted to-muted">
            <span className="wx-serif text-3xl text-primary/70">WriteX</span>
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-card/95 px-2.5 py-1 text-[11px] font-semibold capitalize text-muted-foreground shadow-sm backdrop-blur-sm">
          {blog.category || "General"}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className="flex items-center gap-2.5">
          {safeAuthorImage ? (
            <Link
              to={
                blog.author?.username ? `/author/${blog.author.username}` : "#"
              }
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={safeAuthorImage}
                alt={authorName}
                loading="lazy"
                decoding="async"
                className="h-8 w-8 rounded-full object-cover ring-1 ring-border"
              />
            </Link>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
              {authorName.charAt(0)}
            </div>
          )}
          <div className="min-w-0 flex-1 text-xs text-muted-foreground">
            <Link
              to={
                blog.author?.username ? `/author/${blog.author.username}` : "#"
              }
              onClick={(e) => e.stopPropagation()}
              className="font-medium text-foreground hover:underline"
            >
              {authorName}
            </Link>
            <span className="mx-1.5">·</span>
            {formatDate(blog.createdAt)}
          </div>
        </div>

        <h2 className="wx-serif line-clamp-2 text-xl leading-snug text-foreground transition group-hover:text-primary">
          {blog.title || "Untitled"}
        </h2>

        {blog.sharedBy?.username ? (
          <p className="text-xs text-primary">
            Shared by {firstUpperCase(blog.sharedBy.username)}
          </p>
        ) : null}

        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {blog.description || "No description yet."}
        </p>

        <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-3">
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="h-3.5 w-3.5" />
            {blog.viewCount || 0} views
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
            Read
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </article>
  )
}
