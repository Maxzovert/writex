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
        className="relative flex h-full min-h-[10.5rem] w-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card p-5 text-left transition-colors hover:border-border hover:bg-muted/25"
      >
        <span
          className="absolute inset-y-0 left-0 w-1.5"
          style={{ backgroundColor: color }}
        />
        <div className="flex w-full items-start justify-between gap-2 pl-1.5">
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-slate-700"
            style={{ backgroundColor: color }}
          >
            <FolderOpen className="h-5 w-5" fill="currentColor" fillOpacity={0.2} />
          </span>
          <FolderCountBadge count={total} />
        </div>
        <span className="mt-4 line-clamp-2 pl-1.5 text-base font-semibold leading-snug text-foreground">
          {folder.name}
        </span>
        <span className="mt-1.5 flex items-center gap-1.5 pl-1.5 text-xs text-muted-foreground">
          {formatFolderCount(total)}
          {folder.isPinned && (
            <Pin className="h-3.5 w-3.5 shrink-0 text-amber-500" fill="currentColor" />
          )}
        </span>
        {total !== direct && (
          <span className="mt-1 pl-1.5 text-[11px] text-muted-foreground/75">
            {direct > 0 ? `${direct} in this folder` : "Items in subfolders"}
          </span>
        )}
      </button>
      <div className="absolute right-3 top-3 flex gap-1.5 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 border border-border/60 bg-background/95 shadow-none"
          onClick={(e) => {
            e.stopPropagation()
            onEdit()
          }}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 border border-border/60 bg-background/95 text-destructive shadow-none"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
        >
          <Trash2 className="h-3.5 w-3.5" />
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
    <div className="group overflow-hidden rounded-2xl border border-border/60 bg-card transition-colors hover:border-border hover:bg-muted/15">
      <button
        type="button"
        onClick={onOpen}
        className="flex min-w-0 w-full flex-col text-left"
      >
        <div className="relative overflow-hidden bg-muted/50">
          {blog.mainImage ? (
            <img
              src={blog.mainImage}
              alt={blog.title || "Blog cover"}
              loading="lazy"
              decoding="async"
              className="h-44 w-full object-cover sm:h-48"
            />
          ) : (
            <div className="flex h-44 w-full items-center justify-center sm:h-48">
              <FileText className="h-9 w-9 text-muted-foreground/45" />
            </div>
          )}
          {isSaved ? (
            <span className="absolute right-3 top-3 rounded-md bg-sky-600/90 px-2.5 py-1 text-[11px] font-medium text-white">
              Saved
            </span>
          ) : (
            <span
              className={cn(
                "absolute right-3 top-3 rounded-md px-2.5 py-1 text-[11px] font-medium capitalize text-white",
                blog.status === "published"
                  ? "bg-emerald-600/90"
                  : blog.status === "personal"
                    ? "bg-violet-600/90"
                    : "bg-amber-600/90"
              )}
            >
              {blog.status}
            </span>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col px-4 py-4">
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-base font-semibold text-foreground">
              {blog.title || "Untitled"}
            </h3>
            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {blog.description || "No description yet."}
            </p>
          </div>
          <p className="mt-3 truncate text-xs text-muted-foreground/80">
            {blog.author?.username || "Unknown"}
          </p>
        </div>
      </button>
      <div className="flex flex-wrap gap-2 border-t border-border/50 px-4 py-3">
        <Button variant="ghost" size="sm" className="h-9 px-3" onClick={onMove} title="Move">
          <FolderInput className="h-4 w-4" />
          Move
        </Button>
        {!isSaved && onEdit && (
          <Button variant="ghost" size="sm" className="h-9 px-3" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        )}
        {!isSaved && onDelete && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-3 text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        )}
        {isSaved && onRemove && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-3 text-destructive hover:text-destructive"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
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
      <div className="flex h-[min(720px,calc(100vh-11rem))] min-h-[560px] items-center justify-center border-y border-border/70 bg-card">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
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
    <div className="flex h-[min(820px,calc(100vh-11rem))] min-h-[640px] flex-col overflow-hidden border-y border-border/70 bg-card lg:h-[calc(100vh-11rem)]">
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="flex max-h-[40vh] flex-col border-b border-border/70 bg-muted/20 p-4 lg:max-h-none lg:w-80 lg:shrink-0 lg:border-b-0 lg:border-r xl:w-96">
          <div className="mb-3 flex items-center justify-between gap-2 px-1 pb-3">
            <div className="min-w-0">
              <p className="text-base font-semibold text-foreground">Folders</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Browse, pin, and organize your library
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-lg"
              onClick={() => setFolderDialog({ open: true, mode: "create" })}
              title="Create folder"
            >
              <FolderPlus className="h-4 w-4" />
            </Button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
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
          </div>
        </aside>

        {/* Main */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {/* Toolbar */}
          <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-border/70 px-5 py-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-sm">
              {contents.breadcrumbs.map((crumb, index) => (
                <div key={crumb._id ?? "root"} className="flex items-center gap-1">
                  {index > 0 && (
                    <ChevronRight className="h-4 w-4 text-muted-foreground/70" />
                  )}
                  <button
                    type="button"
                    onClick={() => navigateToFolder(crumb._id)}
                    className={cn(
                      "rounded-md px-2 py-1 transition-colors hover:bg-muted",
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
                <span className="ml-1 text-sm text-muted-foreground">
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
                <span className="ml-1 text-sm text-muted-foreground">
                  ({formatFolderCount(currentTotal)} total)
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {onNewBlog && (
                <Button size="sm" className="h-9" onClick={onNewBlog}>
                  <PenLine className="h-4 w-4" />
                  New blog
                </Button>
              )}
              {contents.folder && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9"
                  onClick={() =>
                    setFolderDialog({
                      open: true,
                      mode: "edit",
                      folder: contents.folder,
                    })
                  }
                >
                  <Pencil className="h-4 w-4" />
                  Edit folder
                </Button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            {isEmpty ? (
              <div className="flex h-full min-h-[360px] flex-col items-center justify-center px-6 py-24 text-center">
                <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-muted/70">
                  <FolderOpen className="h-7 w-7 text-muted-foreground/70" />
                </span>
                <p className="text-lg font-semibold text-foreground">
                  {currentFolderId === null ? "No folders yet" : "Nothing here yet"}
                </p>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  {currentFolderId === null
                    ? "Create your first folder to start organizing blogs and saved posts."
                    : "This folder is empty. Move a blog here or save posts from the feed."}
                </p>
                {onNewBlog && (
                  <Button className="mt-6 h-10" onClick={onNewBlog}>
                    <PenLine className="h-4 w-4" />
                    Start writing
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-10 p-5 sm:p-6 lg:p-8">
                {currentFolderId === null && rootUnfiledBlogs.length > 0 && (
                  <section>
                    <div className="mb-4 flex items-baseline gap-2">
                      <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                        Unfiled
                      </h3>
                      <span className="text-sm text-muted-foreground/80">
                        {rootUnfiledBlogs.length} blog
                        {rootUnfiledBlogs.length === 1 ? "" : "s"} at root
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                      {rootUnfiledBlogs.map((blog) => renderBlogRow(blog, "own"))}
                    </div>
                  </section>
                )}

                {folderCount > 0 && (
                  <section>
                    <div className="mb-4 flex items-baseline gap-2">
                      <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                        Folders
                      </h3>
                      <span className="text-sm text-muted-foreground/80">
                        {folderCount} folder{folderCount === 1 ? "" : "s"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
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
                  </section>
                )}

                {currentFolderId !== null && folderBlogCount > 0 && (
                  <section>
                    <div className="mb-4 flex items-baseline gap-2">
                      <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                        Blogs
                      </h3>
                      <span className="text-sm text-muted-foreground/80">
                        {folderBlogCount} in this folder
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                      {folderBlogItems.map(({ blog, itemType }) =>
                        renderBlogRow(blog, itemType)
                      )}
                    </div>
                  </section>
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
