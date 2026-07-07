import { useCallback, useEffect, useMemo, useState } from "react"
import {
  type Bookmark,
  type BookmarkColor,
  createBookmarkId,
  loadBookmarks,
  saveBookmarks,
  scrollToBookmark,
} from "@/lib/bookmarks"

export function useBookmarks(userId: string | undefined, documentId: string) {
  const ownerId = userId || "anonymous"
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() =>
    loadBookmarks(ownerId, documentId)
  )

  useEffect(() => {
    setBookmarks(loadBookmarks(ownerId, documentId))
  }, [ownerId, documentId])

  const persist = useCallback(
    (next: Bookmark[] | ((previous: Bookmark[]) => Bookmark[])) => {
      setBookmarks((previous) => {
        const updated =
          typeof next === "function"
            ? (next as (value: Bookmark[]) => Bookmark[])(previous)
            : next
        saveBookmarks(ownerId, documentId, updated)
        return updated
      })
    },
    [ownerId, documentId]
  )

  const addBookmark = useCallback(
    (
      anchor: Bookmark["anchor"],
      color: BookmarkColor,
      label: string
    ): Bookmark => {
      const bookmark: Bookmark = {
        id: createBookmarkId(),
        color,
        label,
        anchor,
        createdAt: Date.now(),
      }
      persist((previous) => [...previous, bookmark])
      return bookmark
    },
    [persist]
  )

  const removeBookmark = useCallback(
    (id: string) => {
      persist((previous) => previous.filter((bookmark) => bookmark.id !== id))
    },
    [persist]
  )

  const goToBookmark = useCallback((id: string) => {
    scrollToBookmark(id)
  }, [])

  const sortedBookmarks = useMemo(
    () =>
      [...bookmarks].sort((a, b) => {
        if (a.anchor.blockIndex !== b.anchor.blockIndex) {
          return a.anchor.blockIndex - b.anchor.blockIndex
        }
        return a.anchor.startOffset - b.anchor.startOffset
      }),
    [bookmarks]
  )

  return {
    bookmarks: sortedBookmarks,
    addBookmark,
    removeBookmark,
    goToBookmark,
  }
}
