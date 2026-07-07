import { highlightCodeToHtml } from "@/lib/lowlight"
import "@/components/tiptap-node/code-block-node/code-highlight.scss"

export function HighlightedCodeBlock({ code, language }) {
  const lang = language || "plaintext"
  const html = highlightCodeToHtml(code, lang)

  return (
    <div className="not-prose my-4 writex-code-block">
      <pre className="bg-gray-100 dark:bg-zinc-900 p-4 rounded overflow-x-auto border border-zinc-200 dark:border-zinc-700">
        <code
          className={`hljs language-${lang} text-sm font-mono block whitespace-pre`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </pre>
    </div>
  )
}
