import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { FileText, FolderOpen, Plus, Sparkles } from "lucide-react"
import { MyBlogsList } from "@/components/blogs/MyBlogsList"
import { BlogLibraryExplorer } from "@/components/folders/BlogLibraryExplorer"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { fetchFolderTree, moveBlogToFolder } from "@/lib/folders-api"
import axiosInstance from "../../lib/axiosConfig"
import { cn } from "@/lib/utils"

const MyBlog = () => {
  const navigate = useNavigate()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteTargetId, setDeleteTargetId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const hasFetched = useRef(false)
  const [explorerKey, setExplorerKey] = useState(0)
  const [activeView, setActiveView] = useState("allBlogs")
  const [activeStatusFilter, setActiveStatusFilter] = useState("all")
  const [folderTree, setFolderTree] = useState([])

  const fetchBlogs = async () => {
    try {
      setLoading(true)
      const res = await axiosInstance.get("/blog/myblogs/", {
        params: { page: 1, limit: 100 },
      })
      setData(res.data.blogs)
    } catch {
      toast.error("Failed to fetch blogs")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true
    fetchBlogs()
    fetchFolderTree()
      .then((res) => setFolderTree(res.tree))
      .catch(() => toast.error("Failed to load folders"))
  }, [])

  const refreshAll = () => {
    fetchBlogs()
    fetchFolderTree()
      .then((res) => setFolderTree(res.tree))
      .catch(() => toast.error("Failed to load folders"))
    setExplorerKey((k) => k + 1)
  }

  const handleDeleteBlog = async () => {
    if (!deleteTargetId) return
    setDeleting(true)
    try {
      await axiosInstance.delete(`/blog/deleteblog/${deleteTargetId}`)
      toast.success("Blog deleted")
      setDeleteTargetId(null)
      refreshAll()
    } catch {
      toast.error("Failed to delete blog")
    } finally {
      setDeleting(false)
    }
  }

  const filteredBlogs = useMemo(() => {
    if (activeStatusFilter === "all") return data
    return data.filter((blog) => blog.status === activeStatusFilter)
  }, [activeStatusFilter, data])

  const handleMoveBlog = async (blogId, folderId) => {
    try {
      await moveBlogToFolder(blogId, folderId)
      toast.success(folderId ? "Moved to folder" : "Moved to unfiled")
      refreshAll()
    } catch {
      toast.error("Failed to move blog")
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <section className="border-b border-border/70 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-card/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  Your library
                </div>
                <h1 className="wx-serif text-4xl tracking-tight text-foreground sm:text-5xl">
                  My Blogs
                </h1>
                <p className="mt-2 max-w-xl text-muted-foreground">
                  Drafts, published work, and folders — one calm shelf for every
                  page.
                </p>
              </div>
              <Button
                size="lg"
                className="self-start rounded-full px-6"
                onClick={() => navigate("/write")}
              >
                <Plus className="h-4 w-4" />
                New blog
              </Button>
            </div>

            <div
              role="tablist"
              aria-label="Library view"
              className="mt-8 inline-flex w-full max-w-lg gap-1 rounded-2xl bg-muted p-1.5"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeView === "allBlogs"}
                onClick={() => setActiveView("allBlogs")}
                className={cn(
                  "inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl px-5 text-base font-medium transition",
                  activeView === "allBlogs"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-background/70 hover:text-foreground"
                )}
              >
                <FileText className="h-4 w-4" />
                All Blogs
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeView === "folders"}
                onClick={() => setActiveView("folders")}
                className={cn(
                  "inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl px-5 text-base font-medium transition",
                  activeView === "folders"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-background/70 hover:text-foreground"
                )}
              >
                <FolderOpen className="h-4 w-4" />
                Folders
              </button>
            </div>
          </div>
        </section>

        <section
          className={
            activeView === "folders"
              ? "w-full px-0 pb-0 pt-5"
              : "w-full px-4 py-8 sm:px-6 lg:px-8"
          }
        >
          {loading ? (
            <div className="mx-auto flex min-h-[420px] max-w-6xl items-center justify-center rounded-3xl border border-border bg-card/50">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
            </div>
          ) : activeView === "allBlogs" ? (
            <div className="mx-auto max-w-6xl">
              <MyBlogsList
                allBlogs={data}
                blogs={filteredBlogs}
                folderTree={folderTree}
                activeFilter={activeStatusFilter}
                onFilterChange={setActiveStatusFilter}
                onEditBlog={(blog) =>
                  navigate("/write", { state: { editBlog: blog } })
                }
                onReadBlog={(blogId) => navigate(`/blog/${blogId}`)}
                onDeleteBlog={setDeleteTargetId}
                onNewBlog={() => navigate("/write")}
                onMoveBlog={handleMoveBlog}
              />
            </div>
          ) : (
            <BlogLibraryExplorer
              key={explorerKey}
              onEditBlog={(blog) =>
                navigate("/write", { state: { editBlog: blog } })
              }
              onReadBlog={(blogId) => navigate(`/blog/${blogId}`)}
              onDeleteBlog={setDeleteTargetId}
              onNewBlog={() => navigate("/write")}
            />
          )}
        </section>
      </main>

      <Dialog
        open={Boolean(deleteTargetId)}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this blog?</DialogTitle>
            <DialogDescription>
              This permanently removes the post. It cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTargetId(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteBlog}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default MyBlog
