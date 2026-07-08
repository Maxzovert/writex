import { Clock, Eye, FileText, FolderInput, PenLine, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { BlogFolderNode, LibraryBlog } from "@/lib/folders-api"
import { cn } from "@/lib/utils"
import { MoveToFolderDialog } from "@/components/folders/MoveToFolderDialog"
import { useState } from "react"

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

const FILTERS: Array<{ key: BlogFilter; label: string }> = [
  { key: "all", label: "All" },
  { key: "draft", label: "Drafts" },
  { key: "personal", label: "Personal" },
  { key: "published", label: "Published" },
]

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
  const [moveDialog, setMoveDialog] = useState<{ open: boolean; blogId: string | null }>({
    open: false,
    blogId: null,
  })
  const sortedBlogs = [...blogs].sort((left, right) => {
    const leftTime = left.updatedAt ? new Date(left.updatedAt).getTime() : 0
    const rightTime = right.updatedAt ? new Date(right.updatedAt).getTime() : 0
    return rightTime - leftTime
  })

  return (
    <Card className="border-border/70 shadow-sm">
      <CardContent className="p-0">
        <div className="flex flex-col gap-4 border-b border-border px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                All Blogs
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                See every draft and published post in one place, then organize them
                with folders only when you need to.
              </p>
            </div>
            {onNewBlog && (
              <Button className="rounded-full self-start" onClick={onNewBlog}>
                <PenLine className="h-4 w-4" />
                New blog
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {FILTERS.map((filter) => {
              const isActive = activeFilter === filter.key
              const count =
                filter.key === "all"
                  ? allBlogs.length
                  : allBlogs.filter((blog) => blog.status === filter.key).length

              return (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => onFilterChange(filter.key)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors",
                    isActive
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <span>{filter.label}</span>
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-xs",
                      isActive
                        ? "bg-background/15 text-background"
                        : "bg-muted text-foreground/70"
                    )}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {sortedBlogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <FileText className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="font-medium text-foreground">No blogs in this view</p>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Switch filters or start writing a new post to fill up this section.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3 2xl:grid-cols-4">
            {sortedBlogs.map((blog) => (
              <Card
                key={blog._id}
                className="border-border/70 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <CardContent className="flex h-full flex-col p-4">
                  <button
                    type="button"
                    onClick={() => onReadBlog(blog._id)}
                    className="flex min-w-0 flex-1 flex-col text-left"
                  >
                    <div className="relative overflow-hidden rounded-xl bg-muted">
                      {blog.mainImage ? (
                        <img
                          src={blog.mainImage}
                          alt={blog.title || "Blog cover"}
                          className="h-44 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-44 w-full items-center justify-center">
                          <FileText className="h-8 w-8 text-muted-foreground/60" />
                        </div>
                      )}
                      <span
                        className={cn(
                          "absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-medium capitalize backdrop-blur",
                          blog.status === "published"
                            ? "bg-emerald-500/90 text-white"
                            : blog.status === "personal"
                              ? "bg-violet-500/90 text-white"
                              : "bg-amber-500/90 text-white"
                        )}
                      >
                        {blog.status || "draft"}
                      </span>
                    </div>

                    <div className="mt-4 min-w-0">
                      <h3 className="line-clamp-2 text-base font-semibold text-foreground">
                        {blog.title || "Untitled"}
                      </h3>
                      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                        {blog.description || "No description yet."}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDate(blog.updatedAt || blog.createdAt)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {blog.viewCount || 0} views
                      </span>
                      {blog.category && <span>{blog.category}</span>}
                    </div>
                  </button>

                  <div className="mt-4 flex flex-wrap gap-2 border-t border-border/60 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setMoveDialog({ open: true, blogId: blog._id })}
                    >
                      <FolderInput className="h-4 w-4" />
                      Move
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onEditBlog(blog)}>
                      Edit
                    </Button>
                    {onDeleteBlog && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => onDeleteBlog(blog._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>

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
    </Card>
  )
}
