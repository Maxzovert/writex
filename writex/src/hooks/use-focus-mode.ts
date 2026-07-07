import { useCallback, useEffect, useState } from "react"

export function useFocusMode() {
  const [isFocusMode, setIsFocusMode] = useState(false)

  const enterFocusMode = useCallback(() => setIsFocusMode(true), [])
  const exitFocusMode = useCallback(() => setIsFocusMode(false), [])
  const toggleFocusMode = useCallback(() => setIsFocusMode((value) => !value), [])

  useEffect(() => {
    if (!isFocusMode) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsFocusMode(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isFocusMode])

  return {
    isFocusMode,
    enterFocusMode,
    exitFocusMode,
    toggleFocusMode,
    setIsFocusMode,
  }
}
