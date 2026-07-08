import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import {
  ChevronRight,
  FileText,
  FolderInput,
  FolderOpen,
  FolderPlus,
  Pencil,
  PenLine,
  Pin,
  Trash2,
} from "lucide-react"
import { FolderTreeSidebar } from "@/components/folders/FolderTreeSidebar"
import { FolderFormDialog } from "@/components/folders/FolderFormDialog"
import { MoveToFolderDialog } from "@/components/folders/MoveToFolderDialog"
import {
  formatFolderCount,
  FolderCountBadge,
} from "@/components/folders/FolderCountBadge"
import { Button } from "@/components/ui/button"
import {
  createFolder,
  deleteFolder,
  fetchFolderTree,
  fetchLibraryContents,
  moveBlogToFolder,
  removeBlogFromLibrary,
  updateFolder,
  type BlogFolderNode,
  type FolderItemEntry,
  type LibraryBlog,
  type LibraryContents,
} from "@/lib/folders-api"
import { getFolderColor } from "@/lib/folder-colors"
import { cn } from "@/lib/utils"

interface BlogLibraryExplorerProps {
  onEditBlog: (blog: LibraryBlog) => void
  onReadBlog: (blogId: string) => void
  onDeleteBlog?: (blogId: string) => void
  onNewBlog?: () => void
}

function FolderCard({
  folder,
  onOpen,
  onEdit,
  onDelete,
}: {
  folder: BlogFolderNode
  onOpen: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const total = folder.totalItemCount ?? 0
  const direct = folder.directItemCount ?? 0
  const color = getFolderColor(folder.color)

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={onOpen}
        className="flex h-full w-full flex-col rounded-xl border border-border/70 bg-card p-3 text-left shadow-sm transition-all hover:border-border hover:shadow-md"
        style={{ borderTop: `3px solid ${color}` }}
      >
        <div className="flex w-full items-start justify-between gap-2">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: color }}
          >
            <FolderOpen className="h-4 w-4 text-foreground/65" />
          </span>
          <FolderCountBadge count={total} className="rounded-full bg-muted px-2 py-0.5" />
        </div>
        <span className="mt-2.5 line-clamp-2 text-sm font-medium leading-snug text-foreground">
          {folder.name}
        </span>
        <span className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
          {formatFolderCount(total)}
          {folder.isPinned && <Pin className="h-3 w-3 shrink-0" />}
        </span>
        {total !== direct && (
          <span className="mt-0.5 text-[10px] text-muted-foreground/80">
            {direct > 0 ? `${direct} in this folder` : "Items in subfolders"}
          </span>
        )}
      </button>
      <div className="absolute right-1.5 top-1.5 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          variant="secondary"
          size="icon"
          className="h-7 w-7 bg-background/90 shadow-sm"
          onClick={(e) => {
            e.stopPropagation()
            onEdit()
          }}
        >
          <Pencil className="h-3 w-3" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="h-7 w-7 bg-background/90 text-destructive shadow-sm"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

function BlogRow({
  blog,
  itemType,
  onOpen,
  onMove,
  onEdit,
  onDelete,
  onRemove,
}: {
  blog: LibraryBlog
  itemType?: "own" | "saved"
  onOpen: () => void
  onMove: () => void
  onEdit?: () => void
  onDelete?: () => void
  onRemove?: () => void
}) {
  const isSaved = itemType === "saved"

  return (
    <div className="group rounded-xl border border-border/70 bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <button
        type="button"
        onClick={onOpen}
        className="flex min-w-0 w-full flex-col text-left"
      >
        <div className="relative overflow-hidden rounded-t-xl bg-muted">
          {blog.mainImage ? (
            <img
              src={blog.mainImage}
              alt={blog.title || "Blog cover"}
              className="h-40 w-full object-cover"
            />
          ) : (
            <div className="flex h-40 w-full items-center justify-center">
              <FileText className="h-8 w-8 text-muted-foreground/60" />
            </div>
          )}
          {isSaved ? (
            <span className="absolute right-3 top-3 rounded-full bg-blue-500/90 px-2.5 py-1 text-[10px] font-medium text-white">
              Saved
            </span>
          ) : (
            <span
              className={cn(
                "absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-medium capitalize text-white",
                blog.status === "published"
                  ? "bg-emerald-500/90"
                  : blog.status === "personal"
                    ? "bg-violet-500/90"
                    : "bg-amber-500/90"
              )}
            >
              {blog.status}
            </span>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col p-4">
          <div className="min-w-0">
            <h3 className="line-clamp-2 font-medium text-foreground">
              {blog.title || "Untitled"}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {blog.description || "No description yet."}
            </p>
          </div>
          <p className="mt-3 truncate text-xs text-muted-foreground">
            {blog.author?.username || "Unknown"}
          </p>
        </div>
      </button>
      <div className="flex flex-wrap gap-2 border-t border-border/60 p-4 pt-3">
        <Button variant="outline" size="sm" onClick={onMove} title="Move">
          <FolderInput className="h-3.5 w-3.5" />
          Move
        </Button>
        {!isSaved && onEdit && (
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
        )}
        {!isSaved && onDelete && (
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        )}
        {isSaved && onRemove && (
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={onRemove}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove
          </Button>
        )}
      </div>
    </div>
  )
}

export function BlogLibraryExplorer({
  onEditBlog,
  onReadBlog,
  onDeleteBlog,
  onNewBlog,
}: BlogLibraryExplorerProps) {
  const [tree, setTree] = useState<BlogFolderNode[]>([])
  const [unfiledCount, setUnfiledCount] = useState(0)
  const [contents, setContents] = useState<LibraryContents | null>(null)
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  const [folderDialog, setFolderDialog] = useState<{
    open: boolean
    mode: "create" | "edit"
    folder?: BlogFolderNode | null
  }>({ open: false, mode: "create" })

  const [moveDialog, setMoveDialog] = useState<{
    open: boolean
    blogId: string | null
    itemType?: "own" | "saved"
  }>({ open: false, blogId: null })

  const loadAll = async (folderId: string | null = currentFolderId) => {
    const [treeData, libraryData] = await Promise.all([
      fetchFolderTree(),
      fetchLibraryContents(folderId),
    ])
    setTree(treeData.tree)
    setUnfiledCount(treeData.unfiledCount ?? 0)
    setContents(libraryData)
  }

  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        await loadAll(null)
      } catch {
        toast.error("Failed to load library")
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const navigateToFolder = async (folderId: string | null) => {
    setCurrentFolderId(folderId)
    if (folderId) setExpandedIds((prev) => new Set(prev).add(folderId))
    try {
      setContents(await fetchLibraryContents(folderId))
    } catch {
      toast.error("Failed to open folder")
    }
  }

  const refresh = () => loadAll(currentFolderId)

  const handleCreateFolder = async (payload: {
    name: string
    color: string
    isPinned?: boolean
  }) => {
    await createFolder({
      name: payload.name,
      color: payload.color,
      parentId: currentFolderId,
      isPinned: payload.isPinned,
    })
    toast.success("Folder created")
    await refresh()
  }

  const handleEditFolder = async (payload: {
    name: string
    color: string
    isPinned?: boolean
  }) => {
    if (!folderDialog.folder) return
    await updateFolder(folderDialog.folder._id, payload)
    toast.success("Folder updated")
    await refresh()
  }

  const handleDeleteFolder = async (folder: BlogFolderNode) => {
    if (!window.confirm(`Delete "${folder.name}"? Items move to the parent folder.`)) return
    await deleteFolder(folder._id)
    toast.success("Folder deleted")
    if (currentFolderId === folder._id) await navigateToFolder(null)
    else await refresh()
  }

  if (loading || !contents) {
    return (
      <div className="flex h-[480px] items-center justify-center rounded-xl border border-border bg-card">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-border border-t-foreground" />
      </div>
    )
  }

  const folderBlogItems =
    currentFolderId !== null
      ? contents.items.map((item: FolderItemEntry) => ({
          blog: item.blog,
          itemType: item.itemType,
        }))
      : []
  const rootUnfiledBlogs =
    currentFolderId === null
      ? contents.unfiledBlogs.filter(
          (blog) =>
            blog.status === "draft" ||
            blog.status === "personal" ||
            blog.status === "published"
        )
      : []

  const folderCount = contents.subfolders.length
  const folderBlogCount = folderBlogItems.length
  const blogCount = folderBlogCount
  const currentTotal = contents.folder?.totalItemCount
  const isEmpty =
    currentFolderId === null
      ? folderCount === 0 && rootUnfiledBlogs.length === 0
      : folderCount === 0 && folderBlogCount === 0

  const renderBlogRow = (
    blog: LibraryBlog,
    itemType: "own" | "saved" = "own"
  ) => (
    <BlogRow
      key={blog._id}
      blog={blog}
      itemType={itemType}
      onOpen={() => onReadBlog(blog._id)}
      onMove={() => setMoveDialog({ open: true, blogId: blog._id, itemType })}
      onEdit={itemType !== "saved" ? () => onEditBlog(blog) : undefined}
      onDelete={
        itemType !== "saved" && onDeleteBlog
          ? () => onDeleteBlog(blog._id)
          : undefined
      }
      onRemove={
        itemType === "saved"
          ? () =>
              removeBlogFromLibrary(blog._id).then(() => {
                toast.success("Removed")
                refresh()
              })
          : undefined
      }
    />
  )

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex min-h-[480px] flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="border-b border-border bg-muted/30 p-3 lg:w-52 lg:shrink-0 lg:border-b-0 lg:border-r xl:w-56">
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-xs font-medium text-muted-foreground">Folders</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setFolderDialog({ open: true, mode: "create" })}
            >
              <FolderPlus className="h-4 w-4" />
            </Button>
          </div>
          <FolderTreeSidebar
            tree={tree}
            currentFolderId={currentFolderId}
            expandedIds={expandedIds}
            unfiledCount={unfiledCount}
            onToggleExpand={(id) =>
              setExpandedIds((prev) => {
                const next = new Set(prev)
                if (next.has(id)) next.delete(id)
                else next.add(id)
                return next
              })
            }
            onSelectFolder={navigateToFolder}
          />
        </aside>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
            <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
              {contents.breadcrumbs.map((crumb, index) => (
                <div key={crumb._id ?? "root"} className="flex items-center gap-1">
                  {index > 0 && (
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  <button
                    type="button"
                    onClick={() => navigateToFolder(crumb._id)}
                    className={cn(
                      "rounded px-1.5 py-0.5 hover:bg-muted",
                      index === contents.breadcrumbs.length - 1
                        ? "text-base font-semibold text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {crumb.name}
                  </button>
                </div>
              ))}
              {(folderCount > 0 || blogCount > 0) && (
                <span className="text-xs text-muted-foreground">
                  {folderCount > 0 && `${folderCount} folder${folderCount === 1 ? "" : "s"}`}
                  {currentFolderId !== null && folderBlogCount > 0 && (
                    <>
                      {folderCount > 0 && " · "}
                      {folderBlogCount} blog{folderBlogCount === 1 ? "" : "s"}
                    </>
                  )}
                </span>
              )}
              {currentTotal != null && currentTotal > 0 && folderCount === 0 && blogCount === 0 && (
                <span className="text-xs text-muted-foreground">
                  ({formatFolderCount(currentTotal)} total)
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {onNewBlog && (
                <Button size="sm" onClick={onNewBlog}>
                  <PenLine className="h-3.5 w-3.5" />
                  New blog
                </Button>
              )}
              {contents.folder && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setFolderDialog({
                      open: true,
                      mode: "edit",
                      folder: contents.folder,
                    })
                  }
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit folder
                </Button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {isEmpty ? (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <FolderOpen className="mb-3 h-10 w-10 text-muted-foreground/50" />
                <p className="font-medium text-foreground">
                  {currentFolderId === null ? "No folders yet" : "Nothing here yet"}
                </p>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                  {currentFolderId === null
                    ? "Create your first folder to start organizing blogs and saved posts."
                    : "This folder is empty. Move a blog here or save posts from the feed."}
                </p>
                {onNewBlog && (
                  <Button className="mt-5 rounded-full" onClick={onNewBlog}>
                    <PenLine className="h-4 w-4" />
                    Start writing
                  </Button>
                )}
              </div>
            ) : (
              <div className="p-4">
                {currentFolderId === null && rootUnfiledBlogs.length > 0 && (
                  <div className="mb-6">
                    <div className="mb-3 flex items-baseline gap-2">
                      <h3 className="text-sm font-semibold text-foreground">Unfiled</h3>
                      <span className="text-xs text-muted-foreground">
                        {rootUnfiledBlogs.length} blog
                        {rootUnfiledBlogs.length === 1 ? "" : "s"} at root
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                      {rootUnfiledBlogs.map((blog) => renderBlogRow(blog, "own"))}
                    </div>
                  </div>
                )}

                {folderCount > 0 && (
                  <div className={rootUnfiledBlogs.length > 0 ? "border-t border-border/60 pt-6" : ""}>
                    <div className="mb-3 flex items-baseline gap-2">
                      <h3 className="text-sm font-semibold text-foreground">Folders</h3>
                      <span className="text-xs text-muted-foreground">
                        {folderCount} folder{folderCount === 1 ? "" : "s"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
                      {contents.subfolders.map((folder) => (
                        <FolderCard
                          key={folder._id}
                          folder={folder}
                          onOpen={() => navigateToFolder(folder._id)}
                          onEdit={() =>
                            setFolderDialog({ open: true, mode: "edit", folder })
                          }
                          onDelete={() => handleDeleteFolder(folder)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {currentFolderId !== null && folderBlogCount > 0 && (
                  <div className={folderCount > 0 ? "mt-6 border-t border-border/60 pt-6" : ""}>
                    <div className="mb-3 flex items-baseline gap-2">
                      <h3 className="text-sm font-semibold text-foreground">Blogs</h3>
                      <span className="text-xs text-muted-foreground">
                        {folderBlogCount} in this folder
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                      {folderBlogItems.map(({ blog, itemType }) =>
                        renderBlogRow(blog, itemType)
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <FolderFormDialog
        open={folderDialog.open}
        onOpenChange={(open) => setFolderDialog((prev) => ({ ...prev, open }))}
        mode={folderDialog.mode}
        folder={folderDialog.folder}
        onSubmit={
          folderDialog.mode === "create" ? handleCreateFolder : handleEditFolder
        }
      />

      <MoveToFolderDialog
        open={moveDialog.open}
        onOpenChange={(open) => setMoveDialog((prev) => ({ ...prev, open }))}
        tree={tree}
        allowUnfiled={moveDialog.itemType !== "saved"}
        onSelect={async (targetFolderId) => {
          if (!moveDialog.blogId) return
          await moveBlogToFolder(moveDialog.blogId, targetFolderId)
          toast.success("Moved")
          await refresh()
        }}
      />
    </div>
  )
}
