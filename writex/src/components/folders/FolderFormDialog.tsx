import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DEFAULT_FOLDER_COLOR,
  FOLDER_PASTEL_COLORS,
  getFolderColor,
} from "@/lib/folder-colors"
import type { BlogFolderNode } from "@/lib/folders-api"
import { cn } from "@/lib/utils"

interface FolderFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  folder?: BlogFolderNode | null
  onSubmit: (payload: {
    name: string
    color: string
    isPinned?: boolean
  }) => Promise<void>
}

export function FolderFormDialog({
  open,
  onOpenChange,
  mode,
  folder,
  onSubmit,
}: FolderFormDialogProps) {
  const [name, setName] = useState("")
  const [color, setColor] = useState(DEFAULT_FOLDER_COLOR)
  const [isPinned, setIsPinned] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setName(folder?.name ?? "")
      setColor(getFolderColor(folder?.color))
      setIsPinned(folder?.isPinned ?? false)
    }
  }, [open, folder])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try {
      await onSubmit({
        name: name.trim(),
        color,
        isPinned,
      })
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "New folder" : "Edit folder"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="folder-name">Folder name</Label>
            <Input
              id="folder-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Research, Drafts, Favorites"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Folder color</Label>
            <div className="grid grid-cols-5 gap-2">
              {FOLDER_PASTEL_COLORS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  title={option.label}
                  onClick={() => setColor(option.value)}
                  className={cn(
                    "h-10 rounded-xl border-2 transition-transform hover:scale-105",
                    color === option.value
                      ? "border-foreground scale-105"
                      : "border-transparent"
                  )}
                  style={{ backgroundColor: option.value }}
                />
              ))}
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="rounded border-border"
            />
            Pin folder to top
          </label>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || saving}>
              {saving ? "Saving..." : mode === "create" ? "Create" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
