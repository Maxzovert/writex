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
      className={`shrink-0 tabular-nums text-xs ${
        muted ? "text-muted-foreground" : "text-foreground/70"
      } ${className}`}
    >
      {count}
    </span>
  )
}
