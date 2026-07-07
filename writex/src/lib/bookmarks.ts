export type BookmarkColor = "red" | "green" | "yellow" | "blue"

export interface BookmarkAnchor {
  blockIndex: number
  startOffset: number
  endOffset: number
}

export interface Bookmark {
  id: string
  color: BookmarkColor
  label: string
  anchor: BookmarkAnchor
  createdAt: number
}

export const BOOKMARK_COLORS: BookmarkColor[] = ["red", "green", "yellow", "blue"]

export const BOOKMARK_COLOR_STYLES: Record<
  BookmarkColor,
  { bg: string; border: string; dot: string }
> = {
  red: {
    bg: "rgba(254, 202, 202, 0.65)",
    border: "#ef4444",
    dot: "#ef4444",
  },
  green: {
    bg: "rgba(187, 247, 208, 0.65)",
    border: "#22c55e",
    dot: "#22c55e",
  },
  yellow: {
    bg: "rgba(254, 240, 138, 0.75)",
    border: "#eab308",
    dot: "#eab308",
  },
  blue: {
    bg: "rgba(191, 219, 254, 0.65)",
    border: "#3b82f6",
    dot: "#3b82f6",
  },
}

const STORAGE_PREFIX = "writex_bookmarks"

function storageKey(userId: string, documentId: string): string {
  return `${STORAGE_PREFIX}_${userId}_${documentId}`
}

export function loadBookmarks(
  userId: string,
  documentId: string
): Bookmark[] {
  try {
    const raw = localStorage.getItem(storageKey(userId, documentId))
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveBookmarks(
  userId: string,
  documentId: string,
  bookmarks: Bookmark[]
): void {
  localStorage.setItem(
    storageKey(userId, documentId),
    JSON.stringify(bookmarks)
  )
}

export function migrateBookmarks(
  userId: string,
  fromDocumentId: string,
  toDocumentId: string
): void {
  if (fromDocumentId === toDocumentId) return
  const existing = loadBookmarks(userId, toDocumentId)
  if (existing.length > 0) return
  const source = loadBookmarks(userId, fromDocumentId)
  if (source.length === 0) return
  saveBookmarks(userId, toDocumentId, source)
  localStorage.removeItem(storageKey(userId, fromDocumentId))
}

export function createBookmarkId(): string {
  return `bm_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export function truncateLabel(text: string, max = 120): string {
  const trimmed = text.replace(/\s+/g, " ").trim()
  if (!trimmed) return "Bookmark"
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max - 1)}…`
}

/** Clean list markers / numbering from stored selection text for sidebar display. */
export function displayBookmarkLabel(label: string): string {
  return label
    .replace(/^[\d]+[.)]\s*/, "")
    .replace(/^[\u2022\u2023\u25E6\u2043\u2219◆●○▪▸►\-–—]\s*/, "")
    .trim()
}

export function flattenTextNodes(
  nodes: Array<{ type?: string; text?: string; content?: unknown[] }> | null | undefined
): string {
  if (!nodes || !Array.isArray(nodes)) return ""
  return nodes
    .map((node) => {
      if (node.type === "text" && node.text) return node.text
      if (node.content) return flattenTextNodes(node.content as typeof nodes)
      return ""
    })
    .join("")
}

export function scrollToBookmark(bookmarkId: string): void {
  const el = document.getElementById(`writex-bookmark-${bookmarkId}`)
  el?.scrollIntoView({ behavior: "smooth", block: "center" })
}

function getTextOffsetInRoot(
  root: HTMLElement,
  targetNode: Node,
  targetOffset: number
): number {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let count = 0
  while (walker.nextNode()) {
    const textNode = walker.currentNode
    if (textNode === targetNode) return count + targetOffset
    count += textNode.textContent?.length ?? 0
  }
  return count
}

export function getAnchorFromDomSelection(
  container: HTMLElement
): { anchor: BookmarkAnchor; label: string } | null {
  const selection = window.getSelection()
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
    return null
  }

  const range = selection.getRangeAt(0)
  if (!container.contains(range.commonAncestorContainer)) return null

  const blockEl = (
    range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
      ? (range.commonAncestorContainer as Element)
      : range.commonAncestorContainer.parentElement
  )?.closest("[data-block-index]") as HTMLElement | null

  if (!blockEl) return null

  const blockIndex = Number(blockEl.dataset.blockIndex)
  if (Number.isNaN(blockIndex)) return null

  const startOffset = getTextOffsetInRoot(
    blockEl,
    range.startContainer,
    range.startOffset
  )
  const endOffset = getTextOffsetInRoot(
    blockEl,
    range.endContainer,
    range.endOffset
  )

  if (endOffset <= startOffset) return null

  const label = truncateLabel(range.toString())
  return {
    anchor: { blockIndex, startOffset, endOffset },
    label,
  }
}

export function findPosFromBlockOffset(
  doc: {
    content: {
      child: (index: number) => { nodeSize: number; descendants: (f: (node: { isText?: boolean; text?: string | null }, pos: number) => boolean | void) => void }
      forEach: (f: (node: unknown, offset: number, index: number) => void) => void
    }
    textBetween: (from: number, to: number, blockSeparator?: string) => string
  },
  blockIndex: number,
  charOffset: number
): number | null {
  let blockOffset = 0
  let blockNode: { nodeSize: number; descendants: (f: (node: { isText?: boolean; text?: string | null }, pos: number) => boolean | void) => void } | null = null

  doc.content.forEach((_node, offset, index) => {
    if (index === blockIndex) {
      blockOffset = offset
      blockNode = _node as typeof blockNode
    }
  })

  if (!blockNode) return null

  let targetPos: number | null = null
  let walked = 0
  const start = blockOffset + 1
  const end = blockOffset + blockNode.nodeSize - 1

  blockNode.descendants((node, pos) => {
    if (targetPos !== null) return false
    if (node.isText && node.text) {
      if (walked + node.text.length >= charOffset) {
        targetPos = start + pos + (charOffset - walked)
        return false
      }
      walked += node.text.length
    }
  })

  return targetPos ?? start
}

export function getAnchorFromEditor(editor: {
  state: {
    selection: { from: number; to: number; empty: boolean }
    doc: Parameters<typeof findPosFromBlockOffset>[0] & {
      forEach: (f: (node: unknown, offset: number, index: number) => void) => void
      textBetween: (from: number, to: number, blockSeparator?: string) => string
    }
  }
}): { anchor: BookmarkAnchor; label: string } | null {
  const { from, to, empty } = editor.state.selection
  if (empty || from === to) return null

  const doc = editor.state.doc
  let blockIndex = -1
  let blockOffset = 0

  doc.forEach((_node, offset, index) => {
    const node = _node as { nodeSize: number }
    if (from >= offset && from < offset + node.nodeSize) {
      blockIndex = index
      blockOffset = offset
    }
  })

  if (blockIndex < 0) return null

  const startOffset = doc.textBetween(blockOffset + 1, from).length
  const endOffset = doc.textBetween(blockOffset + 1, to).length
  const label = truncateLabel(doc.textBetween(from, to, " "))

  return {
    anchor: { blockIndex, startOffset, endOffset },
    label,
  }
}

export function resolveAnchorToRange(
  doc: Parameters<typeof findPosFromBlockOffset>[0],
  anchor: BookmarkAnchor
): { from: number; to: number } | null {
  const from = findPosFromBlockOffset(doc, anchor.blockIndex, anchor.startOffset)
  const to = findPosFromBlockOffset(doc, anchor.blockIndex, anchor.endOffset)
  if (from === null || to === null || to <= from) return null
  return { from, to }
}
