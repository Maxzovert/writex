import { useEffect, useRef, type ReactNode } from "react"
import { cn } from "@/lib/utils"

const STICKY_OFFSET_PX = 32

interface BlogSidebarColumnProps {
  children: ReactNode
  className?: string
}

export function BlogSidebarColumn({
  children,
  className = "",
}: BlogSidebarColumnProps) {
  const stickyRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = stickyRef.current
    if (!el) return

    const updateStickyTop = () => {
      if (window.innerWidth < 1024) {
        el.style.top = ""
        return
      }

      const height = el.offsetHeight
      const top = Math.min(
        STICKY_OFFSET_PX,
        window.innerHeight - height - STICKY_OFFSET_PX
      )
      el.style.top = `${top}px`
    }

    updateStickyTop()

    const resizeObserver = new ResizeObserver(updateStickyTop)
    resizeObserver.observe(el)
    window.addEventListener("resize", updateStickyTop)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("resize", updateStickyTop)
    }
  }, [])

  return (
    <div
      className={cn(
        "mb-8 w-full shrink-0 lg:mb-12 lg:w-72 lg:self-stretch xl:w-80",
        className
      )}
    >
      <aside ref={stickyRef} className="w-full lg:sticky">
        {children}
      </aside>
    </div>
  )
}
