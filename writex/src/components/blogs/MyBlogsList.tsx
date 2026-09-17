import {
  Clock,
  Eye,
  FileText,
  PenLine,
  Shield,
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LibraryBlogTile } from "@/components/blogs/LibraryBlogTile"
import type { BlogFolderNode, LibraryBlog } from "@/lib/folders-api"
import { cn } from "@/lib/utils"
import { MoveToFolderDialog } from "@/components/folders/MoveToFolderDialog"

type BlogFilter = "all" | "draft" | "personal" | "published"

interface MyBlogsListProps {
  allBlogs: LibraryBlog[]
  blogs: LibraryBlog[]
  activeFilter: BlogFilter
  onFilterChange: (filter: BlogFilter) => void
  onReadBlog: (blogId: string) => void
  onEditBlog: (blog: LibraryBlog) => void
  onDeleteBlog?: (blogId: string) => void
  onNewBlog?: () => void
  folderTree: BlogFolderNode[]
  onMoveBlog: (blogId: string, folderId: string | null) => Promise<void>
}

const FILTERS: Array<{
  key: BlogFilter
  label: string
  icon: typeof FileText
}> = [
  { key: "all", label: "All", icon: FileText },
  { key: "published", label: "Published", icon: Eye },
  { key: "draft", label: "Drafts", icon: Clock },
  { key: "personal", label: "Personal", icon: Shield },
]

export function MyBlogsList({
  allBlogs,
  blogs,
  activeFilter,
  onFilterChange,
  onReadBlog,
  onEditBlog,
  onDeleteBlog,
  onNewBlog,
  folderTree,
  onMoveBlog,
}: MyBlogsListProps) {
  const [moveDialog, setMoveDialog] = useState<{
    open: boolean
    blogId: string | null
  }>({
    open: false,
    blogId: null,
  })

  const sortedBlogs = [...blogs].sort((left, right) => {
    const leftTime = left.updatedAt ? new Date(left.updatedAt).getTime() : 0
    const rightTime = right.updatedAt ? new Date(right.updatedAt).getTime() : 0
    return rightTime - leftTime
  })

  return (
    <div className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm">
      <div className="border-b border-border px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                Browse
              </p>
              <h2 className="wx-serif mt-1 text-3xl text-foreground sm:text-4xl">
                All blogs
              </h2>
              <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
                Filter by status, open a page, or file it into a folder.
              </p>
            </div>
            {onNewBlog ? (
              <Button className="self-start rounded-full px-5" onClick={onNewBlog}>
                <PenLine className="h-4 w-4" />
                New blog
              </Button>
            ) : null}
          </div>

          <div
            role="tablist"
            aria-label="Filter blogs by status"
            className="flex w-full flex-wrap gap-1 rounded-2xl bg-muted p-1.5 sm:flex-nowrap"
          >
            {FILTERS.map((filter) => {
              const isActive = activeFilter === filter.key
              const count =
                filter.key === "all"
                  ? allBlogs.length
                  : allBlogs.filter((blog) => blog.status === filter.key).length
              const Icon = filter.icon

              return (
                <button
                  key={filter.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onFilterChange(filter.key)}
                  className={cn(
                    "inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition sm:px-4 sm:text-base",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-background/80 hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0 opacity-80" />
                  <span>{filter.label}</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums sm:text-sm",
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-background text-muted-foreground"
                    )}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {sortedBlogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <FileText className="h-7 w-7" />
          </div>
          <p className="wx-serif text-2xl text-foreground">No blogs in this view</p>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Switch filters or start a new post to fill this shelf.
          </p>
          {onNewBlog ? (
            <Button className="mt-6 rounded-full" onClick={onNewBlog}>
              <PenLine className="h-4 w-4" />
              Start writing
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">
          {sortedBlogs.map((blog) => (
            <LibraryBlogTile
              key={blog._id}
              blog={blog}
              onOpen={() => onReadBlog(blog._id)}
              onMove={() => setMoveDialog({ open: true, blogId: blog._id })}
              onEdit={() => onEditBlog(blog)}
              onDelete={
                onDeleteBlog ? () => onDeleteBlog(blog._id) : undefined
              }
            />
          ))}
        </div>
      )}

      <MoveToFolderDialog
        open={moveDialog.open}
        onOpenChange={(open) => setMoveDialog((prev) => ({ ...prev, open }))}
        tree={folderTree}
        allowUnfiled
        onSelect={async (targetFolderId) => {
          if (!moveDialog.blogId) return
          await onMoveBlog(moveDialog.blogId, targetFolderId)
        }}
      />
    </div>
  )
}
