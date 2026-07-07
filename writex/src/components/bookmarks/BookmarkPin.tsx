import { Bookmark } from "lucide-react"
import {
  BOOKMARK_COLOR_STYLES,
  type BookmarkColor,
} from "@/lib/bookmarks"

interface BookmarkPinProps {
  color: BookmarkColor
  className?: string
}

export function BookmarkPin({ color, className = "" }: BookmarkPinProps) {
  const pinColor = BOOKMARK_COLOR_STYLES[color].dot

  return (
    <Bookmark
      aria-hidden
      className={`writex-bookmark-pin inline h-4 w-4 shrink-0 align-middle ${className}`}
      style={{ color: pinColor, fill: pinColor }}
    />
  )
}

export function createBookmarkPinElement(
  color: BookmarkColor,
  bookmarkId: string
): HTMLSpanElement {
  const pinColor = BOOKMARK_COLOR_STYLES[color].dot
  const wrapper = document.createElement("span")
  wrapper.className = "writex-bookmark-pin-widget"
  wrapper.id = `writex-bookmark-${bookmarkId}`
  wrapper.setAttribute("data-bookmark-id", bookmarkId)
  wrapper.setAttribute("data-color", color)
  wrapper.setAttribute("contenteditable", "false")
  wrapper.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="${pinColor}" stroke="${pinColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="writex-bookmark-pin"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>`
  return wrapper
}
