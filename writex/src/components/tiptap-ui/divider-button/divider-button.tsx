import * as React from "react"
import { Minus } from "lucide-react"
import type { Editor } from "@tiptap/react"
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Button } from "@/components/tiptap-ui-primitive/button"

export interface DividerButtonProps extends Omit<ButtonProps, "type"> {
  editor?: Editor | null
  text?: string
}

export function insertDivider(editor: Editor | null): boolean {
  if (!editor) return false
  return editor.chain().focus().setHorizontalRule().run()
}

export function canInsertDivider(editor: Editor | null): boolean {
  if (!editor) return false
  try {
    return editor.can().setHorizontalRule()
  } catch {
    return false
  }
}

export const DividerButton = React.forwardRef<HTMLButtonElement, DividerButtonProps>(
  (
    {
      editor: providedEditor,
      text,
      className = "",
      disabled,
      onClick,
      children,
      ...buttonProps
    },
    ref
  ) => {
    const editor = useTiptapEditor(providedEditor)
    const canInsert = canInsertDivider(editor)
    const isDisabled = !editor || !editor.isEditable || disabled || !canInsert

    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event)
        if (!event.defaultPrevented && !isDisabled) {
          insertDivider(editor)
        }
      },
      [onClick, isDisabled, editor]
    )

    if (!editor || !editor.isEditable) return null

    return (
      <Button
        type="button"
        className={className.trim()}
        disabled={isDisabled}
        data-style="ghost"
        data-disabled={isDisabled}
        role="button"
        tabIndex={-1}
        aria-label="Insert divider"
        tooltip="Divider"
        onClick={handleClick}
        {...buttonProps}
        ref={ref}
      >
        {children || (
          <>
            <Minus className="tiptap-button-icon" />
            {text && <span className="tiptap-button-text">{text}</span>}
          </>
        )}
      </Button>
    )
  }
)

DividerButton.displayName = "DividerButton"

export default DividerButton
