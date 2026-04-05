import * as React from "react"
import type { Editor } from "@tiptap/react"

import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
import { isNodeInSchema } from "@/lib/tiptap-utils"
import { ChevronDownIcon } from "@/components/tiptap-icons/chevron-down-icon"
import { TableIcon } from "@/components/tiptap-icons/table-icon"
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Button } from "@/components/tiptap-ui-primitive/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/tiptap-ui-primitive/dropdown-menu"

import "./table-dropdown-menu.scss"
import {
  adjustCurrentRowMinHeight,
  resetCurrentRowMinHeight,
  TABLE_ROW_HEIGHT_STEP,
} from "@/lib/tiptap-table-row-height"

export interface TableDropdownMenuProps extends Omit<ButtonProps, "type"> {
  editor?: Editor | null
  onOpenChange?: (open: boolean) => void
}

export function TableDropdownMenu({
  editor: providedEditor,
  onOpenChange,
  ...props
}: TableDropdownMenuProps) {
  const editor = useTiptapEditor(providedEditor)
  const [open, setOpen] = React.useState(false)

  const tableInSchema = isNodeInSchema("table", editor)

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      setOpen(next)
      onOpenChange?.(next)
    },
    [onOpenChange]
  )

  if (!editor || !editor.isEditable || !tableInSchema) {
    return null
  }

  const inTable = editor.isActive("table")
  const toolbarActive = inTable || open

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          data-style="ghost"
          data-active-state={toolbarActive ? "on" : "off"}
          role="button"
          tabIndex={-1}
          aria-label="Table options"
          tooltip="Table"
          {...props}
        >
          <TableIcon className="tiptap-button-icon" />
          <ChevronDownIcon className="tiptap-button-dropdown-small" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="tiptap-dropdown-menu--table"
        side="bottom"
        align="start"
      >
        <div className="tiptap-table-menu-section" aria-hidden>
          Insert table
        </div>
        <DropdownMenuGroup>
          <DropdownMenuItem
            onSelect={() =>
              editor
                .chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run()
            }
          >
            Insert 3×3 table (with header)
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() =>
              editor
                .chain()
                .focus()
                .insertTable({ rows: 2, cols: 2, withHeaderRow: false })
                .run()
            }
          >
            Insert 2×2 table
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() =>
              editor
                .chain()
                .focus()
                .insertTable({ rows: 4, cols: 4, withHeaderRow: true })
                .run()
            }
          >
            Insert 4×4 table (with header)
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator orientation="horizontal" />

        <div className="tiptap-table-menu-section" aria-hidden>
          Rows, columns, and height
        </div>
        <DropdownMenuGroup>
          <DropdownMenuItem
            disabled={!editor.can().addColumnBefore()}
            onSelect={() => editor.chain().focus().addColumnBefore().run()}
          >
            Add column left
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!editor.can().addColumnAfter()}
            onSelect={() => editor.chain().focus().addColumnAfter().run()}
          >
            Add column right
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!editor.can().addRowBefore()}
            onSelect={() => editor.chain().focus().addRowBefore().run()}
          >
            Add row above
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!editor.can().addRowAfter()}
            onSelect={() => editor.chain().focus().addRowAfter().run()}
          >
            Add row below
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!inTable}
            onSelect={() =>
              adjustCurrentRowMinHeight(editor, TABLE_ROW_HEIGHT_STEP)
            }
          >
            Taller row (+{TABLE_ROW_HEIGHT_STEP}px)
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!inTable}
            onSelect={() =>
              adjustCurrentRowMinHeight(editor, -TABLE_ROW_HEIGHT_STEP)
            }
          >
            Shorter row (−{TABLE_ROW_HEIGHT_STEP}px)
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!inTable}
            onSelect={() => resetCurrentRowMinHeight(editor)}
          >
            Reset row height
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator orientation="horizontal" />

        <div className="tiptap-table-menu-section" aria-hidden>
          Delete and options
        </div>
        <DropdownMenuGroup>
          <DropdownMenuItem
            disabled={!editor.can().deleteRow()}
            onSelect={() => editor.chain().focus().deleteRow().run()}
          >
            Delete row
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!editor.can().deleteColumn()}
            onSelect={() => editor.chain().focus().deleteColumn().run()}
          >
            Delete column
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!editor.can().toggleHeaderRow()}
            onSelect={() => editor.chain().focus().toggleHeaderRow().run()}
          >
            Toggle header row
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!editor.can().deleteTable()}
            onSelect={() => editor.chain().focus().deleteTable().run()}
          >
            Delete table
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <p className="tiptap-table-menu-hint">
          Drag the blue line on a column edge to resize column width. Use
          “Taller row” / “Shorter row” for minimum row height (saved with the
          post). Row height still grows with text inside cells.
        </p>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default TableDropdownMenu
