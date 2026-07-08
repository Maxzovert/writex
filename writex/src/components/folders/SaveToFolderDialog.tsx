import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { Folder, FolderPlus } from "lucide-react"
import { FolderFormDialog } from "@/components/folders/FolderFormDialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  addBlogToFolder,
  createFolder,
  fetchFolderTree,
  flattenFolderTree,
  type BlogFolderNode,
} from "@/lib/folders-api"
import { FolderCountBadge } from "@/components/folders/FolderCountBadge"
import { getFolderColor } from "@/lib/folder-colors"
import { cn } from "@/lib/utils"

interface SaveToFolderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  blogId: string
  blogTitle?: string
}

export function SaveToFolderDialog({
  open,
  onOpenChange,
  blogId,
  blogTitle,
}: SaveToFolderDialogProps) {
  const [tree, setTree] = useState<BlogFolderNode[]>([])
  const [createOpen, setCreateOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const loadTree = async () => {
    const data = await fetchFolderTree()
    setTree(data.tree)
  }

  useEffect(() => {
    if (open) loadTree().catch(() => toast.error("Could not load folders"))
  }, [open])

  const flat = flattenFolderTree(tree)

  const handleSelect = async (folderId: string) => {
    setSaving(true)
    try {
      await addBlogToFolder(folderId, blogId, "saved")
      toast.success("Saved to folder")
      onOpenChange(false)
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to save"
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const handleCreateFolder = async (payload: {
    name: string
    color: string
    isPinned?: boolean
  }) => {
    const folder = await createFolder(payload)
    await addBlogToFolder(folder._id, blogId, "saved")
    toast.success(`Saved to "${folder.name}"`)
    setCreateOpen(false)
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {blogTitle ? `Save "${blogTitle}"` : "Save to folder"}
            </DialogTitle>
          </DialogHeader>

          {flat.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                Create a folder first, then save this blog into it.
              </p>
              <Button
                className="mt-4 rounded-full"
                onClick={() => setCreateOpen(true)}
              >
                <FolderPlus className="h-4 w-4" />
                New folder
              </Button>
            </div>
          ) : (
            <div className="max-h-72 space-y-1 overflow-y-auto pr-1">
              {flat.map((folder) => (
                <button
                  key={folder._id}
                  type="button"
                  disabled={saving}
                  onClick={() => handleSelect(folder._id)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted"
                  style={{ paddingLeft: `${folder.depth * 16 + 12}px` }}
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-black/5"
                    style={{ backgroundColor: getFolderColor(folder.color) }}
                  >
                    <Folder className="h-4 w-4 text-foreground/70" />
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium">{folder.name}</span>
                  <FolderCountBadge count={folder.totalItemCount ?? 0} muted />
                </button>
              ))}
            </div>
          )}

          <DialogFooter className="gap-2 sm:justify-between">
            {flat.length > 0 && (
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => setCreateOpen(true)}
              >
                <FolderPlus className="h-4 w-4" />
                New folder
              </Button>
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <FolderFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
        onSubmit={handleCreateFolder}
      />
    </>
  )
}

export function SaveToFolderButton({
  blogId,
  blogTitle,
  className = "",
}: {
  blogId: string
  blogTitle?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className={cn("rounded-full", className)}
        onClick={() => setOpen(true)}
      >
        <FolderPlus className="h-4 w-4" />
        Save to folder
      </Button>
      <SaveToFolderDialog
        open={open}
        onOpenChange={setOpen}
        blogId={blogId}
        blogTitle={blogTitle}
      />
    </>
  )
}
