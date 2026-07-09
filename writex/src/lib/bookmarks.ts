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

type BlockDoc = Parameters<typeof findPosFromBlockOffset>[0]

type BlockNode = {
  nodeSize: number
  descendants: (
    f: (
      node: { isText?: boolean; text?: string | null },
      pos: number
    ) => boolean | void
  ) => void
}

function getBlockNodeAtIndex(
  doc: BlockDoc,
  blockIndex: number
): { blockOffset: number; blockNode: BlockNode } | null {
  let blockOffset = 0
  let blockNode: BlockNode | null = null

  doc.content.forEach((_node, offset, index) => {
    if (index === blockIndex) {
      blockOffset = offset
      blockNode = _node as BlockNode
    }
  })

  if (!blockNode) return null
  return { blockOffset, blockNode }
}

/** Plain-text character offset inside a top-level block (no block separators). */
export function getCharOffsetAtPosInBlock(
  doc: BlockDoc,
  blockIndex: number,
  pos: number
): number | null {
  const block = getBlockNodeAtIndex(doc, blockIndex)
  if (!block) return null

  const { blockOffset, blockNode } = block
  const blockStart = blockOffset + 1
  const blockEnd = blockOffset + blockNode.nodeSize - 1

  if (pos < blockStart || pos > blockEnd) return null

  let walked = 0
  let resolved = false
  let result = 0

  blockNode.descendants((node, relativePos) => {
    if (resolved) return false
    if (!node.isText || !node.text) return

    const nodeStart = blockStart + relativePos
    const nodeEnd = nodeStart + node.text.length

    if (pos <= nodeStart) {
      result = walked
      resolved = true
      return false
    }

    if (pos < nodeEnd) {
      result = walked + (pos - nodeStart)
      resolved = true
      return false
    }

    walked += node.text.length
  })

  return resolved ? result : walked
}

/** Sum plain text length of preceding siblings inside a block (lists, blockquotes, etc.). */
export function getChildTextOffsetBase(
  children: Array<{ content?: unknown[] }> | null | undefined,
  childIndex: number
): number {
  if (!children || childIndex <= 0) return 0

  let offset = 0
  for (let i = 0; i < childIndex; i += 1) {
    offset += flattenTextNodes(children[i].content as Parameters<typeof flattenTextNodes>[0])
  }
  return offset
}

type TableLikeNode = {
  content?: Array<{
    content?: Array<{
      content?: Array<{ type?: string; content?: unknown[] }>
    }>
  }>
}

/** Character offset of a table cell paragraph within the table's flattened text. */
export function getTableCellTextOffsetBase(
  tableNode: TableLikeNode,
  rowIndex: number,
  cellIndex: number,
  blockIndexInCell = 0
): number {
  const rows = tableNode.content || []
  let offset = 0

  for (let ri = 0; ri < rows.length; ri += 1) {
    const cells = rows[ri].content || []
    for (let ci = 0; ci < cells.length; ci += 1) {
      if (ri === rowIndex && ci === cellIndex) {
        return offset + getChildTextOffsetBase(cells[ci].content, blockIndexInCell)
      }

      for (const block of cells[ci].content || []) {
        if (block.type === "paragraph") {
          offset += flattenTextNodes(block.content as Parameters<typeof flattenTextNodes>[0])
        }
      }
    }
  }

  return offset
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
  const block = getBlockNodeAtIndex(doc, blockIndex)
  if (!block) return null

  const { blockOffset, blockNode } = block

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

  doc.forEach((_node, offset, index) => {
    const node = _node as { nodeSize: number }
    if (from >= offset && from < offset + node.nodeSize) {
      blockIndex = index
    }
  })

  if (blockIndex < 0) return null

  const startOffset = getCharOffsetAtPosInBlock(doc, blockIndex, from)
  const endOffset = getCharOffsetAtPosInBlock(doc, blockIndex, to)
  if (startOffset === null || endOffset === null || endOffset <= startOffset) {
    return null
  }

  const label = truncateLabel(doc.textBetween(from, to, " "))

  return {
    anchor: { blockIndex, startOffset, endOffset },
    label,
  }
}

function getBlockPlainTextFromDoc(doc: BlockDoc, blockIndex: number): string {
  const block = getBlockNodeAtIndex(doc, blockIndex)
  if (!block) return ""

  let text = ""
  block.blockNode.descendants((node) => {
    if (node.isText && node.text) text += node.text
  })
  return text
}

function resolveAnchorByLabelInBlock(
  doc: BlockDoc,
  bookmark: Bookmark
): { from: number; to: number } | null {
  const plainText = getBlockPlainTextFromDoc(doc, bookmark.anchor.blockIndex)
  const label = displayBookmarkLabel(bookmark.label)
  if (!label || label === "Bookmark") return null

  let bestIdx = -1
  let bestDistance = Infinity
  let searchFrom = 0

  while (searchFrom < plainText.length) {
    const idx = plainText.indexOf(label, searchFrom)
    if (idx === -1) break

    const distance = Math.abs(idx - bookmark.anchor.startOffset)
    if (distance < bestDistance) {
      bestDistance = distance
      bestIdx = idx
    }
    searchFrom = idx + 1
  }

  if (bestIdx === -1) return null

  const from = findPosFromBlockOffset(doc, bookmark.anchor.blockIndex, bestIdx)
  const to = findPosFromBlockOffset(
    doc,
    bookmark.anchor.blockIndex,
    bestIdx + label.length
  )
  if (from === null || to === null || to <= from) return null
  return { from, to }
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

export function resolveBookmarkToRange(
  doc: BlockDoc,
  bookmark: Bookmark
): { from: number; to: number } | null {
  const direct = resolveAnchorToRange(doc, bookmark.anchor)
  if (direct) {
    const selected = doc.textBetween(direct.from, direct.to, " ").replace(/\s+/g, " ").trim()
    const label = displayBookmarkLabel(bookmark.label).replace(/\s+/g, " ").trim()
    if (!label || label === "Bookmark" || selected.includes(label) || label.includes(selected)) {
      return direct
    }
  }

  return resolveAnchorByLabelInBlock(doc, bookmark)
}
