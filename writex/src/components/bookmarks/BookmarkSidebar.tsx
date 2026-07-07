import { Bookmark, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  BOOKMARK_COLOR_STYLES,
  displayBookmarkLabel,
  type Bookmark as BookmarkType,
} from "@/lib/bookmarks"
import { cn } from "@/lib/utils"

interface BookmarkSidebarProps {
  bookmarks: BookmarkType[]
  onSelect: (id: string) => void
  onRemove: (id: string) => void
  className?: string
  variant?: "card" | "panel" | "blog"
}

function BlogBookmarkList({
  bookmarks,
  onSelect,
  onRemove,
}: Pick<BookmarkSidebarProps, "bookmarks" | "onSelect" | "onRemove">) {
  if (bookmarks.length === 0) {
    return (
      <p className="px-2 py-3 text-sm leading-relaxed text-muted-foreground">
        Select text in the article, then pick a color from the mark toolbar.
      </p>
    )
  }

  return (
    <div className="space-y-0.5">
      {bookmarks.map((bookmark) => {
        const { dot } = BOOKMARK_COLOR_STYLES[bookmark.color]
        const label = displayBookmarkLabel(bookmark.label)

        return (
          <div
            key={bookmark.id}
            className="group flex items-stretch rounded-lg transition-colors hover:bg-muted/50"
          >
            <button
              type="button"
              onClick={() => onSelect(bookmark.id)}
              title={label || bookmark.label}
              className="flex min-w-0 flex-1 items-start gap-3 px-3 py-2.5 text-left"
            >
              <span
                className="mt-[0.45rem] h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: dot }}
                aria-hidden
              />
              <span className="min-w-0 flex-1 break-words text-sm leading-snug text-foreground line-clamp-3">
                {label || bookmark.label}
              </span>
            </button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="my-1 mr-1 h-8 w-8 shrink-0 self-center text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => onRemove(bookmark.id)}
              aria-label={`Remove bookmark: ${label || bookmark.label}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )
      })}
    </div>
  )
}

function BookmarkList({
  bookmarks,
  onSelect,
  onRemove,
}: Pick<BookmarkSidebarProps, "bookmarks" | "onSelect" | "onRemove">) {
  if (bookmarks.length === 0) {
    return (
      <p className="text-sm leading-relaxed text-muted-foreground">
        Select text in the article, then pick a color from the mark toolbar.
      </p>
    )
  }

  return (
    <div className="space-y-1">
      {bookmarks.map((bookmark) => {
        const accent = BOOKMARK_COLOR_STYLES[bookmark.color].border

        return (
          <div
            key={bookmark.id}
            className="group flex items-start gap-1 rounded-md transition-colors hover:bg-muted/50"
          >
            <button
              type="button"
              onClick={() => onSelect(bookmark.id)}
              className="flex min-w-0 flex-1 items-start gap-2.5 px-2 py-2 text-left"
            >
              <Bookmark
                className="mt-0.5 h-4 w-4 shrink-0"
                strokeWidth={2}
                style={{ color: accent }}
              />
              <span className="min-w-0 flex-1 text-sm leading-snug text-foreground [overflow-wrap:anywhere]">
                {bookmark.label}
              </span>
            </button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="mt-0.5 h-8 w-8 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => onRemove(bookmark.id)}
              aria-label={`Remove bookmark: ${bookmark.label}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )
      })}
    </div>
  )
}

export function BookmarkSidebar({
  bookmarks,
  onSelect,
  onRemove,
  className = "",
  variant = "card",
}: BookmarkSidebarProps) {
  if (variant === "blog") {
    return (
      <section
        className={cn(
          "not-prose overflow-hidden rounded-xl border border-border bg-card shadow-sm",
          className
        )}
      >
        <div className="border-b border-border/60 px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">Bookmarks</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {bookmarks.length > 0
              ? `${bookmarks.length} saved mark${bookmarks.length === 1 ? "" : "s"}`
              : "Select text to add a bookmark"}
          </p>
        </div>
        <div className="p-2">
          <BlogBookmarkList
            bookmarks={bookmarks}
            onSelect={onSelect}
            onRemove={onRemove}
          />
        </div>
      </section>
    )
  }

  const isPanel = variant === "panel"

  if (isPanel) {
    return (
      <section
        className={cn("not-prose flex h-full min-h-0 flex-col", className)}
      >
        <div className="border-b border-border/60 px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">Bookmarks</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {bookmarks.length > 0
              ? `${bookmarks.length} saved mark${bookmarks.length === 1 ? "" : "s"}`
              : "Select text to add a bookmark"}
          </p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <BookmarkList
            bookmarks={bookmarks}
            onSelect={onSelect}
            onRemove={onRemove}
          />
        </div>
      </section>
    )
  }

  return (
    <Card className={cn("not-prose shadow-sm", className)}>
      <CardHeader>
        <CardTitle className="text-lg">Bookmarks</CardTitle>
        {bookmarks.length > 0 ? (
          <CardDescription>
            {bookmarks.length} saved mark{bookmarks.length === 1 ? "" : "s"}
          </CardDescription>
        ) : (
          <CardDescription>Select text to add a bookmark</CardDescription>
        )}
      </CardHeader>
      <CardContent className="max-h-[420px] overflow-y-auto pt-0">
        <BookmarkList
          bookmarks={bookmarks}
          onSelect={onSelect}
          onRemove={onRemove}
        />
      </CardContent>
    </Card>
  )
}
