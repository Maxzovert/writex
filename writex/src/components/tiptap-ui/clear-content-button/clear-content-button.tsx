import * as React from "react"
import type { Editor } from "@tiptap/react"

import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
import { TrashIcon } from "@/components/tiptap-icons/trash-icon"
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Button } from "@/components/tiptap-ui-primitive/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button as UiButton } from "@/components/ui/button"

export interface ClearContentButtonProps extends ButtonProps {
  editor?: Editor | null
  /** Shown after the trash icon */
  text?: string
}

export const ClearContentButton = React.forwardRef<
  HTMLButtonElement,
  ClearContentButtonProps
>(
  (
    {
      editor: providedEditor,
      text = "Clear",
      className = "",
      disabled: userDisabled,
      onClick,
      ...buttonProps
    },
    ref
  ) => {
    const editor = useTiptapEditor(providedEditor)
    const [, bump] = React.useReducer((n: number) => n + 1, 0)
    const [confirmOpen, setConfirmOpen] = React.useState(false)

    React.useEffect(() => {
      if (!editor) return
      const onTx = () => bump()
      editor.on("transaction", onTx)
      return () => {
        editor.off("transaction", onTx)
      }
    }, [editor])

    const isEmpty = !editor || editor.isEmpty

    const handleClick = React.useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e)
        if (e.defaultPrevented || userDisabled || !editor || isEmpty) return
        setConfirmOpen(true)
      },
      [editor, isEmpty, onClick, userDisabled]
    )

    const handleConfirmClear = React.useCallback(() => {
      if (!editor || isEmpty) {
        setConfirmOpen(false)
        return
      }
      editor.chain().focus().clearContent().run()
      setConfirmOpen(false)
    }, [editor, isEmpty])

    if (!editor || !editor.isEditable) {
      return null
    }

    const isDisabled = userDisabled || isEmpty

    return (
      <>
        <Button
          ref={ref}
          type="button"
          className={className.trim()}
          disabled={isDisabled}
          data-style="ghost"
          data-disabled={isDisabled}
          role="button"
          tabIndex={-1}
          aria-label="Clear all content"
          tooltip="Clear all"
          onClick={handleClick}
          {...buttonProps}
        >
          <TrashIcon className="tiptap-button-icon" />
          {text ? <span className="tiptap-button-text">{text}</span> : null}
        </Button>

        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent className="sm:max-w-md" showCloseButton>
            <DialogHeader>
              <DialogTitle>Clear the editor?</DialogTitle>
              <DialogDescription>
                This removes everything in the writing area. You can still use
                Undo (Ctrl+Z) right after if you change your mind.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-2">
              <UiButton
                type="button"
                variant="outline"
                onClick={() => setConfirmOpen(false)}
              >
                Cancel
              </UiButton>
              <UiButton
                type="button"
                variant="destructive"
                onClick={handleConfirmClear}
              >
                Clear all
              </UiButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    )
  }
)

ClearContentButton.displayName = "ClearContentButton"

export default ClearContentButton
