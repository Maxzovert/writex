import { useCallback, useEffect, useMemo, useState } from "react"
import {
  type Bookmark,
  type BookmarkColor,
  BOOKMARKS_UPDATED_EVENT,
  createBookmarkId,
  loadBookmarks,
  mergeBookmarkLists,
  migrateBookmarks,
  migrateBookmarksAcrossUsers,
  saveBookmarks,
  scrollToBookmark,
} from "@/lib/bookmarks"

const EMPTY_BOOKMARKS: Bookmark[] = []

export function useBookmarks(
  userId: string | undefined,
  documentId: string,
  initialBookmarks: Bookmark[] = EMPTY_BOOKMARKS
) {
  const ownerId = userId || "anonymous"
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() =>
    loadBookmarks(ownerId, documentId)
  )

  useEffect(() => {
    const syncBookmarks = () => {
      let next = loadBookmarks(ownerId, documentId)

      if (ownerId !== "anonymous") {
        next = migrateBookmarksAcrossUsers("anonymous", ownerId, documentId)
      }

      if (next.length === 0 && initialBookmarks.length > 0) {
        const seeded = mergeBookmarkLists(initialBookmarks, next)
        saveBookmarks(ownerId, documentId, seeded)
        setBookmarks(seeded)
        return
      }

      setBookmarks(next)
    }

    const handleBookmarksUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ userId: string; documentId: string }>).detail
      if (detail?.userId === ownerId && detail?.documentId === documentId) {
        setBookmarks(loadBookmarks(ownerId, documentId))
      }
    }

    syncBookmarks()
    window.addEventListener(BOOKMARKS_UPDATED_EVENT, handleBookmarksUpdated)
    return () => window.removeEventListener(BOOKMARKS_UPDATED_EVENT, handleBookmarksUpdated)
  }, [ownerId, documentId, initialBookmarks])

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

  const migrateToDocument = useCallback(
    (nextDocumentId: string): Bookmark[] => {
      const merged = migrateBookmarks(ownerId, documentId, nextDocumentId)
      setBookmarks(merged)
      return merged
    },
    [ownerId, documentId]
  )

  const replaceBookmarks = useCallback(
    (next: Bookmark[]) => {
      persist(next)
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
    migrateToDocument,
    replaceBookmarks,
  }
}
