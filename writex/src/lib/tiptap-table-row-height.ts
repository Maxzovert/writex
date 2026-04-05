import type { Editor } from "@tiptap/react"
import {
  TableMap,
  cellAround,
  findCell,
} from "@tiptap/pm/tables"

const ROW_STEP = 28

/**
 * Shift min-height for every cell in the current row (persists in JSON / DB).
 */
export function adjustCurrentRowMinHeight(
  editor: Editor,
  delta: number
): boolean {
  return editor
    .chain()
    .focus()
    .command(({ tr, state, dispatch }) => {
      const $cell = cellAround(state.selection.$anchor)
      if (!$cell) return false

      const table = $cell.node(-1)
      if (!table || table.type.name !== "table") return false

      const tableStart = $cell.start(-1)
      const map = TableMap.get(table)
      const cellRect = findCell($cell)
      const rowRect = {
        top: cellRect.top,
        left: 0,
        bottom: cellRect.bottom,
        right: map.width,
      }

      const relativePositions = map.cellsInRect(rowRect)

      for (const relPos of relativePositions) {
        const absPos = tableStart + relPos
        const cellNode = tr.doc.nodeAt(absPos)
        if (!cellNode) continue

        const attrs = cellNode.attrs as {
          minHeight?: number | null
          colspan?: number
          rowspan?: number
          colwidth?: number[] | null
        }
        const current = attrs.minHeight ?? 0
        const next = Math.max(0, current + delta)
        const newAttrs = {
          ...attrs,
          minHeight: next > 0 ? next : null,
        }
        tr.setNodeMarkup(absPos, undefined, newAttrs)
      }

      if (dispatch) dispatch(tr)
      return true
    })
    .run()
}

export function resetCurrentRowMinHeight(editor: Editor): boolean {
  return editor
    .chain()
    .focus()
    .command(({ tr, state, dispatch }) => {
      const $cell = cellAround(state.selection.$anchor)
      if (!$cell) return false

      const table = $cell.node(-1)
      if (!table || table.type.name !== "table") return false

      const tableStart = $cell.start(-1)
      const map = TableMap.get(table)
      const cellRect = findCell($cell)
      const rowRect = {
        top: cellRect.top,
        left: 0,
        bottom: cellRect.bottom,
        right: map.width,
      }

      for (const relPos of map.cellsInRect(rowRect)) {
        const absPos = tableStart + relPos
        const cellNode = tr.doc.nodeAt(absPos)
        if (!cellNode) continue
        const attrs = cellNode.attrs as Record<string, unknown>
        tr.setNodeMarkup(absPos, undefined, {
          ...attrs,
          minHeight: null,
        })
      }

      if (dispatch) dispatch(tr)
      return true
    })
    .run()
}

export const TABLE_ROW_HEIGHT_STEP = ROW_STEP
