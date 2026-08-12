import * as React from "react"
import { createPortal } from "react-dom"
import { CaseSensitive } from "lucide-react"
import { useCurrentEditor } from "@tiptap/react"
import { Button } from "@/components/tiptap-ui-primitive/button"

const MIN_FONT_SIZE = 8
const MAX_FONT_SIZE = 96
const DEFAULT_FONT_SIZE = 16

const clampFontSize = (value: number) =>
  Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, Math.round(value)))

export function FontSizeControl() {
  const { editor } = useCurrentEditor()
  const [open, setOpen] = React.useState(false)
  const [fontSize, setFontSize] = React.useState(DEFAULT_FONT_SIZE)
  const [draft, setDraft] = React.useState(String(DEFAULT_FONT_SIZE))
  const [panelPos, setPanelPos] = React.useState({ top: 0, left: 0 })
  const closeTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const rootRef = React.useRef<HTMLDivElement>(null)
  const panelRef = React.useRef<HTMLDivElement>(null)

  const clearCloseTimer = React.useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }, [])

  const updatePosition = React.useCallback(() => {
    const root = rootRef.current
    if (!root) return
    const rect = root.getBoundingClientRect()
    setPanelPos({
      top: rect.bottom + 6,
      left: Math.max(8, Math.min(rect.left, window.innerWidth - 220)),
    })
  }, [])

  const openPanel = React.useCallback(() => {
    clearCloseTimer()
    updatePosition()
    setOpen(true)
  }, [clearCloseTimer, updatePosition])

  const scheduleClose = React.useCallback(() => {
    clearCloseTimer()
    closeTimerRef.current = setTimeout(() => setOpen(false), 180)
  }, [clearCloseTimer])

  React.useEffect(() => () => clearCloseTimer(), [clearCloseTimer])

  React.useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) {
        return
      }
      setOpen(false)
    }
    const onReposition = () => updatePosition()
    document.addEventListener("mousedown", onPointerDown)
    window.addEventListener("resize", onReposition)
    window.addEventListener("scroll", onReposition, true)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      window.removeEventListener("resize", onReposition)
      window.removeEventListener("scroll", onReposition, true)
    }
  }, [open, updatePosition])

  React.useEffect(() => {
    if (!editor) return

    const syncFromSelection = () => {
      const selectedSize = Number(editor.getAttributes("textStyle").fontSize)
      const next = Number.isFinite(selectedSize) && selectedSize > 0
        ? selectedSize
        : DEFAULT_FONT_SIZE
      setFontSize(next)
      setDraft(String(next))
    }

    syncFromSelection()
    editor.on("selectionUpdate", syncFromSelection)
    editor.on("transaction", syncFromSelection)

    return () => {
      editor.off("selectionUpdate", syncFromSelection)
      editor.off("transaction", syncFromSelection)
    }
  }, [editor])

  const applySize = React.useCallback(
    (nextValue: number) => {
      if (!editor) return
      const nextSize = clampFontSize(nextValue)
      setFontSize(nextSize)
      setDraft(String(nextSize))
      editor.chain().focus().setFontSize(nextSize).run()
    },
    [editor]
  )

  if (!editor || !editor.isEditable) return null

  const commitDraft = () => {
    const value = Number(draft)
    if (!Number.isFinite(value)) {
      setDraft(String(fontSize))
      return
    }
    applySize(value)
  }

  return (
    <div
      ref={rootRef}
      className="relative inline-flex"
      onMouseEnter={openPanel}
      onMouseLeave={scheduleClose}
    >
      <Button
        type="button"
        data-style="ghost"
        data-active-state={open ? "on" : "off"}
        aria-label="Font size"
        tooltip="Font size"
        showTooltip={!open}
        aria-expanded={open}
        onClick={() => {
          if (open) setOpen(false)
          else openPanel()
        }}
      >
        <CaseSensitive className="tiptap-button-icon" />
      </Button>

      {open &&
        createPortal(
          <div
            ref={panelRef}
            className="z-[200] flex items-center gap-2 rounded-lg border border-border bg-popover px-3 py-2.5 shadow-lg"
            style={{
              position: "fixed",
              top: panelPos.top,
              left: panelPos.left,
            }}
            role="dialog"
            aria-label="Font size"
            onMouseEnter={openPanel}
            onMouseLeave={scheduleClose}
          >
            <span className="text-xs text-muted-foreground">Size</span>
            <input
              type="range"
              min={MIN_FONT_SIZE}
              max={MAX_FONT_SIZE}
              step={1}
              value={fontSize}
              onChange={(event) => applySize(Number(event.target.value))}
              className="h-1.5 w-28 cursor-pointer appearance-none rounded-full bg-muted accent-foreground [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-foreground"
              aria-label="Font size slider"
            />
            <input
              type="text"
              inputMode="numeric"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onBlur={commitDraft}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault()
                  commitDraft()
                }
              }}
              className="h-7 w-11 rounded border border-border bg-background text-center text-xs tabular-nums outline-none"
              aria-label="Font size in pixels"
            />
            <span className="text-[10px] text-muted-foreground">px</span>
          </div>,
          document.body
        )}
    </div>
  )
}
