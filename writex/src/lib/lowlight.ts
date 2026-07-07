import { common, createLowlight } from "lowlight"
import { toHtml } from "hast-util-to-html"

export const lowlight = createLowlight(common)

export function highlightCodeToHtml(code: string, language?: string | null): string {
  const lang = language?.trim()

  try {
    if (!lang || lang === "plaintext" || !lowlight.registered(lang)) {
      const tree = lowlight.highlightAuto(code)
      return toHtml(tree)
    }

    const tree = lowlight.highlight(lang, code)
    return toHtml(tree)
  } catch {
    return code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
  }
}
