import * as React from "react"
import { useCurrentEditor } from "@tiptap/react"
import { cn } from "@/lib/tiptap-utils"

const LANGUAGES = [
  { value: "", label: "Auto-detect" },
  { value: "plaintext", label: "Plain text" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "cpp", label: "C++" },
  { value: "css", label: "CSS" },
  { value: "html", label: "HTML" },
  { value: "json", label: "JSON" },
  { value: "bash", label: "Bash" },
  { value: "sql", label: "SQL" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "yaml", label: "YAML" },
  { value: "markdown", label: "Markdown" },
]

export function CodeBlockLanguageSelect({ className }: { className?: string }) {
  const { editor } = useCurrentEditor()
  const [language, setLanguage] = React.useState("")

  React.useEffect(() => {
    if (!editor) return

    const syncLanguage = () => {
      if (editor.isActive("codeBlock")) {
        setLanguage(editor.getAttributes("codeBlock").language ?? "")
      }
    }

    syncLanguage()
    editor.on("selectionUpdate", syncLanguage)
    editor.on("transaction", syncLanguage)

    return () => {
      editor.off("selectionUpdate", syncLanguage)
      editor.off("transaction", syncLanguage)
    }
  }, [editor])

  if (!editor?.isActive("codeBlock")) return null

  return (
    <select
      aria-label="Code language"
      className={cn(
        "h-8 rounded-md border border-[var(--tt-gray-light-a-200)] bg-[var(--tt-bg-color)] px-2 text-xs text-[var(--tt-theme-text)] outline-none",
        "dark:border-[var(--tt-gray-dark-a-200)]",
        className
      )}
      value={language}
      onChange={(event) => {
        const nextLanguage = event.target.value
        setLanguage(nextLanguage)
        editor
          .chain()
          .focus()
          .updateAttributes("codeBlock", {
            language: nextLanguage || null,
          })
          .run()
      }}
    >
      {LANGUAGES.map((item) => (
        <option key={item.value || "auto"} value={item.value}>
          {item.label}
        </option>
      ))}
    </select>
  )
}
