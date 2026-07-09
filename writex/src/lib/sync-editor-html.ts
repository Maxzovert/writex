import type { Editor } from "@tiptap/react";
import { sanitizeHtmlForEditor } from "./sanitize-html-for-editor";

export type HtmlEditorResult =
  | { ok: true }
  | { ok: false; reason: "empty" | "invalid" | "failed" };

export const applyHtmlToEditor = (
  editor: Editor | null,
  html: string,
  { emitUpdate = false }: { emitUpdate?: boolean } = {}
): HtmlEditorResult => {
  if (!editor || !editor.isEditable) {
    return { ok: false, reason: "failed" };
  }

  const sanitized = sanitizeHtmlForEditor(html);
  if (!sanitized) {
    editor.commands.clearContent();
    return { ok: true };
  }

  try {
    const applied = editor.chain().focus().setContent(sanitized, emitUpdate).run();
    if (!applied) {
      return { ok: false, reason: "failed" };
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: "invalid" };
  }
};

export const getHtmlFromEditor = (editor: Editor | null): string => {
  if (!editor) return "";
  try {
    return editor.getHTML();
  } catch {
    return "";
  }
};
