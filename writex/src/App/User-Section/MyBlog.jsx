import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import {
  BarChart3,
  Clock,
  Eye,
  FileText,
  FolderOpen,
  Plus,
  Shield,
  Sparkles,
} from "lucide-react"
import { MyBlogsList } from "@/components/blogs/MyBlogsList"
import Navbar from "../Components/Navbar"
import { SiteFooter } from "../../components/layout/SiteFooter"
import { BlogLibraryExplorer } from "@/components/folders/BlogLibraryExplorer"
import { Card, CardContent } from "@/components/ui/card"
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

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${accent}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

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
      const res = await axiosInstance.get("/blog/myblogs/")
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

  const publishedCount = data.filter((b) => b.status === "published").length
  const draftCount = data.filter((b) => b.status === "draft").length
  const personalCount = data.filter((b) => b.status === "personal").length
  const totalViews = data.reduce((t, b) => t + (b.viewCount || 0), 0)
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
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-muted/40 via-background to-background px-4 py-10 sm:px-6 lg:px-8">
          <div className="relative mx-auto max-w-7xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5" />
                  File explorer
                </div>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  My Blogs
                </h1>
                <p className="mt-2 max-w-xl text-muted-foreground">
                  Manage every post in one place, then organize selected posts in
                  folders without losing the big picture.
                </p>
              </motion.div>
              <Button
                size="lg"
                className="rounded-full px-6"
                onClick={() => navigate("/write")}
              >
                <Plus className="h-4 w-4" />
                New blog
              </Button>
            </div>

            {!loading && activeView === "allBlogs" && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
              >
                <StatCard
                  icon={FileText}
                  label="Total posts"
                  value={data.length}
                  accent="bg-foreground text-background"
                />
                <StatCard
                  icon={Eye}
                  label="Published"
                  value={publishedCount}
                  accent="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                />
                <StatCard
                  icon={Clock}
                  label="Drafts"
                  value={draftCount}
                  accent="bg-amber-500/15 text-amber-600 dark:text-amber-400"
                />
                <StatCard
                  icon={Shield}
                  label="Personal"
                  value={personalCount}
                  accent="bg-violet-500/15 text-violet-600 dark:text-violet-400"
                />
                <StatCard
                  icon={BarChart3}
                  label="Total views"
                  value={totalViews}
                  accent="bg-blue-500/15 text-blue-600 dark:text-blue-400"
                />
              </motion.div>
            )}
          </div>
        </section>

        <section className="w-full px-3 py-8 sm:px-5 lg:px-8 xl:px-10 lg:py-10">
          {loading ? (
            <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-border bg-card/50">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex justify-center">
                <div className="inline-flex rounded-full border border-border bg-card p-1 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setActiveView("allBlogs")}
                    className={`flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      activeView === "allBlogs"
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <FileText className="h-4 w-4" />
                    All Blogs
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveView("folders")}
                    className={`flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      activeView === "folders"
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <FolderOpen className="h-4 w-4" />
                    Folders
                  </button>
                </div>
              </div>

              {activeView === "allBlogs" ? (
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
            </div>
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

      <SiteFooter />
    </div>
  )
}

export default MyBlog
