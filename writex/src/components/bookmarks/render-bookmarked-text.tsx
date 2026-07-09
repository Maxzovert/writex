import type { ReactNode } from "react"
import { BookmarkPin } from "@/components/bookmarks/BookmarkPin"
import {
  BOOKMARK_COLOR_STYLES,
  type Bookmark,
  displayBookmarkLabel,
  flattenTextNodes,
} from "@/lib/bookmarks"

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

type ResolvedBookmarkSlice = {
  bookmark: Bookmark
  start: number
  end: number
}

function resolveLocalBookmarkRange(
  plainText: string,
  bookmark: Bookmark,
  textOffsetBase: number
): ResolvedBookmarkSlice | null {
  const label = displayBookmarkLabel(bookmark.label)
  let localStart = bookmark.anchor.startOffset - textOffsetBase
  let localEnd = bookmark.anchor.endOffset - textOffsetBase

  if (localEnd <= 0 || localStart >= plainText.length) {
    if (!label || label === "Bookmark") return null
    const idx = plainText.indexOf(label)
    if (idx === -1) return null
    return {
      bookmark,
      start: idx,
      end: Math.min(plainText.length, idx + label.length),
    }
  }

  const storedSlice = plainText.slice(
    Math.max(0, localStart),
    Math.min(plainText.length, localEnd)
  )
  const normalizedStored = storedSlice.replace(/\s+/g, " ").trim()
  const normalizedLabel = label.replace(/\s+/g, " ").trim()

  if (
    normalizedLabel &&
    normalizedLabel !== "Bookmark" &&
  (normalizedStored.includes(normalizedLabel) ||
    normalizedLabel.includes(normalizedStored))
  ) {
    return {
      bookmark,
      start: Math.max(0, localStart),
      end: Math.min(plainText.length, localEnd),
    }
  }

  if (!label || label === "Bookmark") return null

  const idx = plainText.indexOf(label)
  if (idx === -1) return null

  return {
    bookmark,
    start: idx,
    end: Math.min(plainText.length, idx + label.length),
  }
}

function buildSegments(
  plainText: string,
  blockIndex: number,
  bookmarks: Bookmark[],
  textOffsetBase = 0
): Segment[] {
  const blockBookmarks = bookmarks
    .filter(
      (bookmark) =>
        bookmark.anchor.blockIndex === blockIndex &&
        bookmark.anchor.endOffset > bookmark.anchor.startOffset
    )
    .map((bookmark) => resolveLocalBookmarkRange(plainText, bookmark, textOffsetBase))
    .filter((entry): entry is ResolvedBookmarkSlice => entry !== null)
    .sort((a, b) => a.start - b.start)

  if (blockBookmarks.length === 0) {
    return [{ start: 0, end: plainText.length }]
  }

  const segments: Segment[] = []
  let cursor = 0

  for (const { bookmark, start, end } of blockBookmarks) {
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
  renderTextRuns: (nodes: TextNode[], keyPrefix: string) => ReactNode,
  textOffsetBase = 0
): ReactNode {
  const plainText = flattenTextNodes(nodes)
  const segments = buildSegments(plainText, blockIndex, bookmarks, textOffsetBase)
  const hasBookmarks = segments.some((segment) => segment.bookmark)

  if (!hasBookmarks) {
    return renderTextRuns(nodes ?? [], `block-${blockIndex}`)
  }

  return segments.map((segment, index) => {
    const key = `seg-${blockIndex}-${index}`

    if (segment.bookmark) {
      const colorStyle = BOOKMARK_COLOR_STYLES[segment.bookmark.color]
      return (
        <span
          key={key}
          id={`writex-bookmark-${segment.bookmark.id}`}
          className="writex-bookmark-anchor inline rounded-sm"
          style={{
            backgroundColor: colorStyle.bg,
            borderBottom: `2px solid ${colorStyle.border}`,
            boxDecorationBreak: "clone",
            WebkitBoxDecorationBreak: "clone",
          }}
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
