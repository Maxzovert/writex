import type { Editor } from "@tiptap/react";
import { sanitizeHtmlForEditor } from "./sanitize-html-for-editor";

export type InsertHtmlResult =
  | { ok: true }
  | { ok: false; reason: "empty" | "invalid" | "failed" };

export const insertHtmlIntoEditor = (
  editor: Editor | null,
  html: string
): InsertHtmlResult => {
  if (!editor || !editor.isEditable) {
    return { ok: false, reason: "failed" };
  }

  const sanitized = sanitizeHtmlForEditor(html);
  if (!sanitized) {
    return { ok: false, reason: "empty" };
  }

  try {
    const inserted = editor.chain().focus().insertContent(sanitized).run();
    if (!inserted) {
      return { ok: false, reason: "failed" };
    }

    return { ok: true };
  } catch {
    return { ok: false, reason: "invalid" };
  }
};
