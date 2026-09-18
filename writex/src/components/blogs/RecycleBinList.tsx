import { useCallback, useEffect, useState } from "react"
import { toast } from "react-toastify"
import {
  Loader2,
  RotateCcw,
  Trash2,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import axiosInstance from "@/lib/axiosConfig"
import { cn } from "@/lib/utils"

/**
 * @typedef {{
 *   _id: string
 *   title: string
 *   description?: string
 *   mainImage?: string
 *   status?: string
 *   deletedAt?: string
 *   daysRemaining?: number
 *   purgeAt?: string
 * }} TrashBlog
 */

export function RecycleBinList({ refreshKey = 0, onRestored }) {
  const [blogs, setBlogs] = useState(/** @type {TrashBlog[]} */ ([]))
  const [loading, setLoading] = useState(true)
  const [retentionDays, setRetentionDays] = useState(60)
  const [busyId, setBusyId] = useState(/** @type {string | null} */ (null))
  const [permanentTarget, setPermanentTarget] = useState(
    /** @type {TrashBlog | null} */ (null)
  )
  const [emptyOpen, setEmptyOpen] = useState(false)
  const [working, setWorking] = useState(false)

  const fetchTrash = useCallback(async () => {
    try {
      setLoading(true)
      const res = await axiosInstance.get("/blog/trash", {
        params: { page: 1, limit: 100 },
      })
      setBlogs(res.data.blogs || [])
      if (res.data.retentionDays) setRetentionDays(res.data.retentionDays)
    } catch {
      toast.error("Failed to load recycle bin")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTrash()
  }, [fetchTrash, refreshKey])

  const handleRestore = async (blogId) => {
    setBusyId(blogId)
    try {
      await axiosInstance.post(`/blog/trash/${blogId}/restore`)
      toast.success("Blog restored")
      setBlogs((prev) => prev.filter((b) => b._id !== blogId))
      onRestored?.()
    } catch {
      toast.error("Failed to restore blog")
    } finally {
      setBusyId(null)
    }
  }

  const handlePermanentDelete = async () => {
    if (!permanentTarget) return
    setWorking(true)
    try {
      await axiosInstance.delete(`/blog/trash/${permanentTarget._id}`)
      toast.success("Blog permanently deleted")
      setBlogs((prev) => prev.filter((b) => b._id !== permanentTarget._id))
      setPermanentTarget(null)
    } catch {
      toast.error("Failed to delete permanently")
    } finally {
      setWorking(false)
    }
  }

  const handleEmptyTrash = async () => {
    setWorking(true)
    try {
      const res = await axiosInstance.delete("/blog/trash")
      toast.success(
        res.data.deleted
          ? `Removed ${res.data.deleted} blog(s)`
          : "Recycle bin is empty"
      )
      setBlogs([])
      setEmptyOpen(false)
    } catch {
      toast.error("Failed to empty recycle bin")
    } finally {
      setWorking(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[320px] max-w-6xl items-center justify-center rounded-3xl border border-border bg-card/50">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Items stay here for{" "}
            <span className="font-medium text-foreground">{retentionDays} days</span>
            , then are deleted automatically. You can delete anytime.
          </p>
        </div>
        {blogs.length > 0 ? (
          <Button
            variant="outline"
            className="self-start border-destructive/40 text-destructive hover:bg-destructive/10"
            onClick={() => setEmptyOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            Empty bin
          </Button>
        ) : null}
      </div>

      {blogs.length === 0 ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/40 px-6 text-center">
          <Trash2 className="mb-4 h-10 w-10 text-muted-foreground/50" />
          <p className="wx-serif text-2xl text-foreground">Recycle bin is empty</p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Deleted blogs appear here for {retentionDays} days before they are
            removed for good.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {blogs.map((blog) => {
            const busy = busyId === blog._id
            const days =
              typeof blog.daysRemaining === "number" ? blog.daysRemaining : null
            return (
              <li
                key={blog._id}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 flex-1 items-start gap-4">
                  {blog.mainImage ? (
                    <img
                      src={blog.mainImage}
                      alt=""
                      className="h-16 w-16 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-muted">
                      <Trash2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="wx-serif truncate text-xl text-foreground">
                      {blog.title || "Untitled"}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Deleted{" "}
                      {blog.deletedAt
                        ? new Date(blog.deletedAt).toLocaleDateString()
                        : "—"}
                      {days !== null ? (
                        <>
                          {" · "}
                          <span
                            className={cn(
                              days <= 7
                                ? "font-medium text-destructive"
                                : "text-muted-foreground"
                            )}
                          >
                            {days === 0
                              ? "Deletes today"
                              : `${days} day${days === 1 ? "" : "s"} left`}
                          </span>
                        </>
                      ) : null}
                    </p>
                    {blog.status ? (
                      <p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                        {blog.status}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={busy || working}
                    onClick={() => handleRestore(blog._id)}
                  >
                    {busy ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RotateCcw className="h-4 w-4" />
                    )}
                    Restore
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={busy || working}
                    onClick={() => setPermanentTarget(blog)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete forever
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <Dialog
        open={Boolean(permanentTarget)}
        onOpenChange={(open) => !open && setPermanentTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete forever?</DialogTitle>
            <DialogDescription>
              “{permanentTarget?.title || "Untitled"}” will be removed
              permanently. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPermanentTarget(null)}
              disabled={working}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handlePermanentDelete}
              disabled={working}
            >
              {working ? "Deleting..." : "Delete forever"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={emptyOpen} onOpenChange={setEmptyOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="inline-flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Empty recycle bin?
            </DialogTitle>
            <DialogDescription>
              All {blogs.length} item{blogs.length === 1 ? "" : "s"} will be
              permanently deleted. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEmptyOpen(false)}
              disabled={working}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleEmptyTrash}
              disabled={working}
            >
              {working ? "Emptying..." : "Empty bin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
