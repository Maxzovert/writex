import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

const STORAGE_KEY = "writex-theme"

const ThemeContext = createContext(null)

function getStoredTheme() {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === "dark" || v === "light") return v
  } catch {
    /* ignore */
  }
  return "light"
}

function applyDomTheme(mode) {
  const root = document.documentElement
  root.classList.toggle("dark", mode === "dark")
  root.style.colorScheme = mode === "dark" ? "dark" : "light"
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => getStoredTheme())

  useEffect(() => {
    applyDomTheme(theme)
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      /* ignore */
    }
  }, [theme])

  const setTheme = useCallback((next) => {
    setThemeState(next === "dark" ? "dark" : "light")
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((t) => (t === "dark" ? "light" : "dark"))
  }, [])

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
      /** @type {'light' | 'dark'} */
      resolvedTheme: theme,
    }),
    [theme, setTheme, toggleTheme]
  )

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider")
  }
  return ctx
}
