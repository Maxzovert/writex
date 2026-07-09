import { useEffect, useState } from "react"
import {
  BOOKMARK_COLORS,
  BOOKMARK_COLOR_STYLES,
  type BookmarkColor,
} from "@/lib/bookmarks"

interface BookmarkSelectionToolbarProps {
  containerRef: React.RefObject<HTMLElement | null>
  onAdd: (color: BookmarkColor) => void
}

export function BookmarkSelectionToolbar({
  containerRef,
  onAdd,
}: BookmarkSelectionToolbarProps) {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(
    null
  )

  useEffect(() => {
    const updatePosition = () => {
      const container = containerRef.current
      const selection = window.getSelection()

      if (!container || !selection || selection.isCollapsed) {
        setPosition(null)
        return
      }

      const range = selection.getRangeAt(0)
      if (!container.contains(range.commonAncestorContainer)) {
        setPosition(null)
        return
      }

      const rect = range.getBoundingClientRect()
      if (!rect.width && !rect.height) {
        setPosition(null)
        return
      }

      setPosition({
        top: Math.max(8, rect.top - 44),
        left: rect.left + rect.width / 2,
      })
    }

    document.addEventListener("mouseup", updatePosition)
    document.addEventListener("keyup", updatePosition)
    document.addEventListener("selectionchange", updatePosition)
    window.addEventListener("resize", updatePosition)
    window.addEventListener("scroll", updatePosition, true)

    return () => {
      document.removeEventListener("mouseup", updatePosition)
      document.removeEventListener("keyup", updatePosition)
      document.removeEventListener("selectionchange", updatePosition)
      window.removeEventListener("resize", updatePosition)
      window.removeEventListener("scroll", updatePosition, true)
    }
  }, [containerRef])

  if (!position) return null

  return (
    <div
      className="fixed z-[80] flex -translate-x-1/2 items-center gap-1.5 rounded-lg border border-border bg-background px-2 py-1.5 shadow-md"
      style={{ top: position.top, left: position.left }}
      onMouseDown={(event) => event.preventDefault()}
    >
      <span className="px-1 text-xs font-medium text-muted-foreground">
        Mark
      </span>
      <span className="h-4 w-px bg-border" aria-hidden />
      {BOOKMARK_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          aria-label={`Bookmark ${color}`}
          className="h-5 w-5 rounded-full border border-border/80 transition-opacity hover:opacity-80"
          style={{ backgroundColor: BOOKMARK_COLOR_STYLES[color].dot }}
          onClick={() => {
            onAdd(color)
            window.getSelection()?.removeAllRanges()
            setPosition(null)
          }}
        />
      ))}
    </div>
  )
}
