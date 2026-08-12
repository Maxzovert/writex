import { cn } from "@/lib/utils"

export function formatFolderCount(count: number): string {
  if (count === 0) return "0"
  if (count === 1) return "1 blog"
  return `${count} blogs`
}

export function FolderCountBadge({
  count,
  muted = false,
  className = "",
}: {
  count: number
  muted?: boolean
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-md px-1.5 text-[11px] font-medium tabular-nums",
        muted
          ? "bg-transparent text-muted-foreground/70"
          : "bg-muted/80 text-muted-foreground",
        className
      )}
    >
      {count}
    </span>
  )
}
