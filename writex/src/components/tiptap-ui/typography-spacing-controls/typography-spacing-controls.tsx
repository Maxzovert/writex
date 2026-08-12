import * as React from "react"
import { createPortal } from "react-dom"
import { ALargeSmall, AlignVerticalSpaceAround, BetweenHorizontalStart } from "lucide-react"
import { useCurrentEditor } from "@tiptap/react"
import { Button } from "@/components/tiptap-ui-primitive/button"

const LINE_HEIGHT_MIN = 1.15
const LINE_HEIGHT_MAX = 3
const LINE_HEIGHT_STEP = 0.1
const DEFAULT_LINE_HEIGHT = 1.4

const LETTER_SPACING_MIN = -2
const LETTER_SPACING_MAX = 20
const LETTER_SPACING_STEP = 0.5
const DEFAULT_LETTER_SPACING = 0

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

const roundToStep = (value: number, step: number) => {
  const precision = String(step).includes(".")
    ? String(step).split(".")[1].length
    : 0
  const rounded = Math.round(value / step) * step
  return Number(rounded.toFixed(precision))
}

function SpacingRow({
  label,
  value,
  displayValue,
  min,
  max,
  step,
  unit = "",
  onChange,
  icon,
}: {
  label: string
  value: number
  displayValue: string
  min: number
  max: number
  step: number
  unit?: string
  onChange: (value: number) => void
  icon: React.ReactNode
}) {
  const [draft, setDraft] = React.useState(displayValue)

  React.useEffect(() => {
    setDraft(displayValue)
  }, [displayValue])

  const commit = (raw: string) => {
    const next = Number(raw)
    if (!Number.isFinite(next)) {
      setDraft(displayValue)
      return
    }
    onChange(clamp(roundToStep(next, step), min, max))
  }

  return (
    <div className="flex items-center gap-2.5" aria-label={label} title={label}>
      <span className="flex w-5 shrink-0 items-center justify-center text-muted-foreground">
        {icon}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-1.5 w-32 cursor-pointer appearance-none rounded-full bg-muted accent-foreground [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-foreground"
        aria-label={`${label} slider`}
      />
      <input
        type="text"
        inputMode="decimal"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => commit(draft)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault()
            commit(draft)
          }
        }}
        className="h-7 w-11 shrink-0 rounded border border-border bg-background text-center text-xs tabular-nums text-foreground outline-none"
        aria-label={label}
      />
      <span className="w-5 shrink-0 text-[10px] text-muted-foreground">
        {unit || ""}
      </span>
    </div>
  )
}

export function TypographySpacingControls() {
  const { editor } = useCurrentEditor()
  const [open, setOpen] = React.useState(false)
  const [lineHeight, setLineHeight] = React.useState(DEFAULT_LINE_HEIGHT)
  const [letterSpacing, setLetterSpacing] = React.useState(DEFAULT_LETTER_SPACING)
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
      left: Math.max(8, Math.min(rect.left, window.innerWidth - 280)),
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
      const attrs = editor.isActive("heading")
        ? editor.getAttributes("heading")
        : editor.getAttributes("paragraph")

      const nextLineHeight = Number(attrs.lineHeight)
      const nextLetterSpacing = Number(attrs.letterSpacing)

      setLineHeight(
        Number.isFinite(nextLineHeight) && nextLineHeight > 0
          ? nextLineHeight
          : DEFAULT_LINE_HEIGHT
      )
      setLetterSpacing(
        Number.isFinite(nextLetterSpacing) ? nextLetterSpacing : DEFAULT_LETTER_SPACING
      )
    }

    syncFromSelection()
    editor.on("selectionUpdate", syncFromSelection)
    editor.on("transaction", syncFromSelection)

    return () => {
      editor.off("selectionUpdate", syncFromSelection)
      editor.off("transaction", syncFromSelection)
    }
  }, [editor])

  if (!editor || !editor.isEditable) return null

  const applyLineHeight = (value: number) => {
    const next = clamp(roundToStep(value, LINE_HEIGHT_STEP), LINE_HEIGHT_MIN, LINE_HEIGHT_MAX)
    setLineHeight(next)
    editor.chain().focus().setLineHeight(next).run()
  }

  const applyLetterSpacing = (value: number) => {
    const next = clamp(
      roundToStep(value, LETTER_SPACING_STEP),
      LETTER_SPACING_MIN,
      LETTER_SPACING_MAX
    )
    setLetterSpacing(next)
    editor.chain().focus().setLetterSpacing(next).run()
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
        aria-label="Spacing"
        tooltip="Spacing"
        showTooltip={!open}
        aria-expanded={open}
        onClick={() => {
          if (open) setOpen(false)
          else openPanel()
        }}
      >
        <AlignVerticalSpaceAround className="tiptap-button-icon" />
      </Button>

      {open &&
        createPortal(
          <div
            ref={panelRef}
            className="z-[200] min-w-[16.5rem] rounded-lg border border-border bg-popover p-3 shadow-lg"
            style={{
              position: "fixed",
              top: panelPos.top,
              left: panelPos.left,
            }}
            role="dialog"
            aria-label="Line and letter spacing"
            onMouseEnter={openPanel}
            onMouseLeave={scheduleClose}
          >
            <div className="flex flex-col gap-3">
              <SpacingRow
                label="Line spacing"
                icon={<BetweenHorizontalStart className="h-3.5 w-3.5" />}
                value={lineHeight}
                displayValue={String(lineHeight)}
                min={LINE_HEIGHT_MIN}
                max={LINE_HEIGHT_MAX}
                step={LINE_HEIGHT_STEP}
                onChange={applyLineHeight}
              />
              <SpacingRow
                label="Letter spacing"
                icon={<ALargeSmall className="h-3.5 w-3.5" />}
                value={letterSpacing}
                displayValue={String(letterSpacing)}
                min={LETTER_SPACING_MIN}
                max={LETTER_SPACING_MAX}
                step={LETTER_SPACING_STEP}
                unit="px"
                onChange={applyLetterSpacing}
              />
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}
