import * as React from "react";
import type { Editor } from "@tiptap/react";
import { toast } from "react-toastify";

import { useTiptapEditor } from "@/hooks/use-tiptap-editor";
import { Code2Icon } from "@/components/tiptap-icons/code2-icon";
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button";
import { Button } from "@/components/tiptap-ui-primitive/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button as UiButton } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { insertHtmlIntoEditor } from "@/lib/insert-html-into-editor";

export interface InsertHtmlButtonProps extends ButtonProps {
  editor?: Editor | null;
  text?: string;
}

export const InsertHtmlButton = React.forwardRef<HTMLButtonElement, InsertHtmlButtonProps>(
  (
    {
      editor: providedEditor,
      text = "HTML",
      className = "",
      disabled: userDisabled,
      onClick,
      ...buttonProps
    },
    ref
  ) => {
    const editor = useTiptapEditor(providedEditor);
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [htmlInput, setHtmlInput] = React.useState("");

    const handleClick = React.useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        if (e.defaultPrevented || userDisabled || !editor) return;
        setDialogOpen(true);
      },
      [editor, onClick, userDisabled]
    );

    const handleInsert = React.useCallback(() => {
      if (!editor) return;

      const result = insertHtmlIntoEditor(editor, htmlInput);
      if (result.ok) {
        setHtmlInput("");
        setDialogOpen(false);
        toast.success("HTML inserted");
        return;
      }

      if (result.reason === "empty") {
        toast.error("Please enter some HTML to insert");
        return;
      }

      toast.error("Could not insert HTML. Check the markup and try again.");
    }, [editor, htmlInput]);

    const handleOpenChange = React.useCallback((open: boolean) => {
      setDialogOpen(open);
      if (!open) {
        setHtmlInput("");
      }
    }, []);

    if (!editor || !editor.isEditable) {
      return null;
    }

    const isDisabled = userDisabled;

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
          aria-label="Insert HTML"
          tooltip="Insert HTML"
          onClick={handleClick}
          {...buttonProps}
        >
          <Code2Icon className="tiptap-button-icon" />
          {text ? <span className="tiptap-button-text">{text}</span> : null}
        </Button>

        <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
          <DialogContent className="sm:max-w-lg" showCloseButton>
            <DialogHeader>
              <DialogTitle>Insert HTML</DialogTitle>
              <DialogDescription>
                Paste HTML to insert at your cursor. It will be converted into editor
                content so you can keep using formatting tools and bookmarks.
              </DialogDescription>
            </DialogHeader>

            <Textarea
              value={htmlInput}
              onChange={(e) => setHtmlInput(e.target.value)}
              placeholder={'<h2>Section title</h2>\n<p>Hello <strong>world</strong></p>'}
              className="min-h-[180px] font-mono text-sm"
              spellCheck={false}
            />

            <DialogFooter className="gap-2 sm:gap-2">
              <UiButton type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </UiButton>
              <UiButton type="button" onClick={handleInsert}>
                Insert at cursor
              </UiButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }
);

InsertHtmlButton.displayName = "InsertHtmlButton";

export default InsertHtmlButton;
