import { TableCell } from "@tiptap/extension-table-cell"
import { TableHeader } from "@tiptap/extension-table-header"

const minHeightAttr = {
  minHeight: {
    default: null as number | null,
    parseHTML: (element: HTMLElement) => {
      const raw =
        element.getAttribute("data-min-height") ||
        element.style.minHeight?.replace("px", "")
      if (raw == null || raw === "") return null
      const n = parseInt(raw, 10)
      return Number.isFinite(n) ? n : null
    },
    renderHTML: (attributes: { minHeight?: number | null }) => {
      if (attributes.minHeight == null || attributes.minHeight <= 0) return {}
      return {
        "data-min-height": String(attributes.minHeight),
        style: `min-height: ${attributes.minHeight}px`,
      }
    },
  },
}

export const WritexTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      ...minHeightAttr,
    }
  },
})

export const WritexTableHeader = TableHeader.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      ...minHeightAttr,
    }
  },
})
