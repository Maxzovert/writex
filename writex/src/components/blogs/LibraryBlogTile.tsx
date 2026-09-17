import {
  Clock,
  Eye,
  FileText,
  FolderInput,
  MoreHorizontal,
  PenLine,
  Trash2,
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { LibraryBlog } from "@/lib/folders-api"
import { cn } from "@/lib/utils"

function formatDate(value?: string) {
  if (!value) return "Recently updated"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Recently updated"
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date)
}

function statusBadgeClass(status?: string) {
  if (status === "published") return "bg-emerald-600 text-white"
  if (status === "personal") return "bg-violet-600 text-white"
  if (status === "saved") return "bg-sky-600 text-white"
  return "bg-amber-500 text-white"
}

export interface LibraryBlogTileProps {
  blog: LibraryBlog
  itemType?: "own" | "saved"
  onOpen: () => void
  onMove?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onRemove?: () => void
  /** Extra meta line under description (e.g. author) */
  subtitle?: string
}

export function LibraryBlogTile({
  blog,
  itemType = "own",
  onOpen,
  onMove,
  onEdit,
  onDelete,
  onRemove,
  subtitle,
}: LibraryBlogTileProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const isSaved = itemType === "saved"
  const badgeLabel = isSaved ? "saved" : blog.status || "draft"
  const hasActions = Boolean(onMove || onEdit || onDelete || onRemove)

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-background shadow-sm transition hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg">
      <button
        type="button"
        onClick={onOpen}
        className="relative block w-full overflow-hidden text-left"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          {blog.mainImage ? (
            <img
              src={blog.mainImage}
              alt={blog.title || "Blog cover"}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-primary/15 via-muted to-muted">
              <span className="wx-serif text-3xl text-primary/70">WriteX</span>
              <FileText className="mt-2 h-5 w-5 text-muted-foreground/50" />
            </div>
          )}
          <span
            className={cn(
              "absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize shadow-sm",
              statusBadgeClass(badgeLabel)
            )}
          >
            {badgeLabel}
          </span>
        </div>
      </button>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <button
          type="button"
          onClick={onOpen}
          className="min-w-0 flex-1 text-left"
        >
          <h3 className="wx-serif line-clamp-2 text-xl leading-snug text-foreground transition group-hover:text-primary">
            {blog.title || "Untitled"}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {blog.description || "No description yet."}
          </p>
          {subtitle ? (
            <p className="mt-2 truncate text-xs text-muted-foreground/80">
              {subtitle}
            </p>
          ) : null}
        </button>

        <div className="mt-4 flex items-center justify-between gap-2 border-t border-border/60 pt-3">
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              {formatDate(blog.updatedAt || blog.createdAt)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3.5 w-3.5 shrink-0" />
              {blog.viewCount || 0}
            </span>
            {blog.category ? (
              <span className="truncate">{blog.category}</span>
            ) : null}
          </div>

          {hasActions ? (
            <Popover open={menuOpen} onOpenChange={setMenuOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground"
                  aria-label="Blog actions"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="z-[200] w-44 p-1.5">
                {onMove ? (
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted"
                    onClick={() => {
                      setMenuOpen(false)
                      onMove()
                    }}
                  >
                    <FolderInput className="h-4 w-4 text-muted-foreground" />
                    Move
                  </button>
                ) : null}
                {!isSaved && onEdit ? (
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted"
                    onClick={() => {
                      setMenuOpen(false)
                      onEdit()
                    }}
                  >
                    <PenLine className="h-4 w-4 text-muted-foreground" />
                    Edit
                  </button>
                ) : null}
                {!isSaved && onDelete ? (
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      setMenuOpen(false)
                      onDelete()
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                ) : null}
                {isSaved && onRemove ? (
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      setMenuOpen(false)
                      onRemove()
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                ) : null}
              </PopoverContent>
            </Popover>
          ) : null}
        </div>
      </div>
    </article>
  )
}
