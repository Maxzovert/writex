import type { ReactNode } from "react"
import { BookmarkPin } from "@/components/bookmarks/BookmarkPin"
import { type Bookmark, flattenTextNodes } from "@/lib/bookmarks"

type TextNode = {
  type?: string
  text?: string
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>
  content?: TextNode[]
}

type Segment = {
  start: number
  end: number
  bookmark?: Bookmark
}

function buildSegments(
  plainText: string,
  blockIndex: number,
  bookmarks: Bookmark[]
): Segment[] {
  const blockBookmarks = bookmarks
    .filter(
      (bookmark) =>
        bookmark.anchor.blockIndex === blockIndex &&
        bookmark.anchor.endOffset > bookmark.anchor.startOffset
    )
    .sort((a, b) => a.anchor.startOffset - b.anchor.startOffset)

  if (blockBookmarks.length === 0) {
    return [{ start: 0, end: plainText.length }]
  }

  const segments: Segment[] = []
  let cursor = 0

  for (const bookmark of blockBookmarks) {
    const start = Math.max(0, Math.min(bookmark.anchor.startOffset, plainText.length))
    const end = Math.max(start, Math.min(bookmark.anchor.endOffset, plainText.length))
    if (start > cursor) segments.push({ start: cursor, end: start })
    if (end > start) segments.push({ start, end, bookmark })
    cursor = Math.max(cursor, end)
  }

  if (cursor < plainText.length) {
    segments.push({ start: cursor, end: plainText.length })
  }

  return segments.length > 0 ? segments : [{ start: 0, end: plainText.length }]
}

export function renderBookmarkedText(
  nodes: TextNode[] | null | undefined,
  blockIndex: number,
  bookmarks: Bookmark[],
  renderTextRuns: (nodes: TextNode[], keyPrefix: string) => ReactNode
): ReactNode {
  const plainText = flattenTextNodes(nodes)
  const segments = buildSegments(plainText, blockIndex, bookmarks)
  const hasBookmarks = segments.some((segment) => segment.bookmark)

  if (!hasBookmarks) {
    return renderTextRuns(nodes ?? [], `block-${blockIndex}`)
  }

  return segments.map((segment, index) => {
    const key = `seg-${blockIndex}-${index}`

    if (segment.bookmark) {
      return (
        <span
          key={key}
          id={`writex-bookmark-${segment.bookmark.id}`}
          className="writex-bookmark-anchor inline"
        >
          <BookmarkPin color={segment.bookmark.color} className="mr-1" />
          {renderStyledTextSlice(
            nodes ?? [],
            `${key}-text`,
            segment.start,
            segment.end,
            renderTextRuns
          )}
        </span>
      )
    }

    return renderStyledTextSlice(
      nodes ?? [],
      key,
      segment.start,
      segment.end,
      renderTextRuns
    )
  })
}

export function renderStyledTextSlice(
  nodes: TextNode[] | null | undefined,
  keyPrefix: string,
  sliceStart: number,
  sliceEnd: number,
  renderTextRuns: (
    nodes: TextNode[],
    keyPrefix: string
  ) => ReactNode
): ReactNode {
  if (!nodes || sliceStart >= sliceEnd) return null

  let cursor = 0
  const sliced: TextNode[] = []

  for (const node of nodes) {
    if (node.type !== "text" || !node.text) continue
    const nodeStart = cursor
    const nodeEnd = cursor + node.text.length
    cursor = nodeEnd

    if (nodeEnd <= sliceStart || nodeStart >= sliceEnd) continue

    const start = Math.max(0, sliceStart - nodeStart)
    const end = Math.min(node.text.length, sliceEnd - nodeStart)
    sliced.push({ ...node, text: node.text.slice(start, end) })
  }

  return renderTextRuns(sliced, keyPrefix)
}
