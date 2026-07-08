import { useState } from "react"
import { Folder } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FolderCountBadge } from "@/components/folders/FolderCountBadge"
import { getFolderColor } from "@/lib/folder-colors"
import { flattenFolderTree, type BlogFolderNode } from "@/lib/folders-api"
import { cn } from "@/lib/utils"

interface MoveToFolderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tree: BlogFolderNode[]
  currentFolderId?: string | null
  allowUnfiled?: boolean
  title?: string
  onSelect: (folderId: string | null) => Promise<void>
}

export function MoveToFolderDialog({
  open,
  onOpenChange,
  tree,
  currentFolderId,
  allowUnfiled = true,
  title = "Move to folder",
  onSelect,
}: MoveToFolderDialogProps) {
  const flat = flattenFolderTree(tree)
  const [moving, setMoving] = useState(false)

  const handleSelect = async (folderId: string | null) => {
    setMoving(true)
    try {
      await onSelect(folderId)
      onOpenChange(false)
    } finally {
      setMoving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="max-h-72 space-y-1 overflow-y-auto pr-1">
          {allowUnfiled && (
            <button
              type="button"
              disabled={moving}
              onClick={() => handleSelect(null)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted",
                currentFolderId === null && "bg-muted"
              )}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                <Folder className="h-4 w-4" />
              </span>
              <span className="font-medium">Unfiled (Library root)</span>
            </button>
          )}

          {flat.map((folder) => (
            <button
              key={folder._id}
              type="button"
              disabled={moving}
              onClick={() => handleSelect(folder._id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted",
                currentFolderId === folder._id && "bg-muted"
              )}
              style={{ paddingLeft: `${folder.depth * 16 + 12}px` }}
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-black/5"
                style={{ backgroundColor: getFolderColor(folder.color) }}
              >
                <Folder className="h-4 w-4 text-foreground/70" />
              </span>
              <span className="min-w-0 flex-1 truncate font-medium">{folder.name}</span>
              <FolderCountBadge
                count={folder.totalItemCount ?? 0}
                muted
              />
            </button>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}