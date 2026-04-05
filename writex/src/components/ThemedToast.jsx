import React from "react"
import { ToastContainer } from "react-toastify"
import { useTheme } from "@/context/themeContext"

export function ThemedToast() {
  const { theme } = useTheme()

  return (
    <ToastContainer
      position="bottom-right"
      autoClose={2000}
      hideProgressBar
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={theme === "dark" ? "dark" : "light"}
    />
  )
}
