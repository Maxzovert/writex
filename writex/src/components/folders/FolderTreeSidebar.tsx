import type { ReactNode } from "react"
import { ChevronDown, ChevronRight, Folder, Library, Pin } from "lucide-react"
import { FolderCountBadge } from "@/components/folders/FolderCountBadge"
import { getFolderColor } from "@/lib/folder-colors"
import type { BlogFolderNode } from "@/lib/folders-api"
import { cn } from "@/lib/utils"

interface FolderTreeSidebarProps {
  tree: BlogFolderNode[]
  currentFolderId: string | null
  expandedIds: Set<string>
  unfiledCount?: number
  onToggleExpand: (id: string) => void
  onSelectFolder: (id: string | null) => void
}

function getPinnedFolders(nodes: BlogFolderNode[]): BlogFolderNode[] {
  return nodes.flatMap((node) => [
    ...(node.isPinned ? [node] : []),
    ...getPinnedFolders(node.children ?? []),
  ])
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="px-2.5 pb-1.5 pt-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/80">
      {children}
    </p>
  )
}

function TreeNode({
  node,
  depth,
  currentFolderId,
  expandedIds,
  onToggleExpand,
  onSelectFolder,
}: {
  node: BlogFolderNode
  depth: number
} & Omit<FolderTreeSidebarProps, "tree" | "unfiledCount">) {
  const hasChildren = (node.children?.length ?? 0) > 0
  const isExpanded = expandedIds.has(node._id)
  const isActive = currentFolderId === node._id
  const total = node.totalItemCount ?? 0
  const color = getFolderColor(node.color)
  const indent = 8 + depth * 14

  return (
    <div className="relative">
      {depth > 0 && (
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-0 top-0 w-px bg-border/60"
          style={{ left: `${indent - 6}px` }}
        />
      )}

      <div
        className={cn(
          "group relative flex min-h-10 items-center gap-0.5 rounded-lg text-sm transition-colors",
          isActive
            ? "bg-muted/80 text-foreground"
            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        )}
        style={{ marginLeft: `${indent}px` }}
      >
        {isActive && (
          <span
            aria-hidden
            className="absolute inset-y-1.5 left-0 w-0.5 rounded-full"
            style={{ backgroundColor: color }}
          />
        )}

        <button
          type="button"
          className="flex h-8 w-7 shrink-0 items-center justify-center rounded-md hover:bg-background/80"
          onClick={() => hasChildren && onToggleExpand(node._id)}
          aria-label={
            hasChildren
              ? `${isExpanded ? "Collapse" : "Expand"} ${node.name}`
              : undefined
          }
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-4 w-4 opacity-70" />
            ) : (
              <ChevronRight className="h-4 w-4 opacity-70" />
            )
          ) : (
            <span className="h-4 w-4" />
          )}
        </button>

        <button
          type="button"
          onClick={() => onSelectFolder(node._id)}
          className="flex min-w-0 flex-1 items-center gap-2.5 py-2 pr-2.5 text-left"
        >
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-700"
            style={{ backgroundColor: color }}
          >
            <Folder className="h-4 w-4" fill="currentColor" fillOpacity={0.2} />
          </span>
          <span className={cn("min-w-0 flex-1 truncate", isActive && "font-medium")}>
            {node.name}
          </span>
          {node.isPinned && (
            <Pin className="h-3.5 w-3.5 shrink-0 text-amber-500" fill="currentColor" />
          )}
          <FolderCountBadge count={total} muted={!isActive} />
        </button>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <TreeNode
              key={child._id}
              node={child}
              depth={depth + 1}
              currentFolderId={currentFolderId}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              onSelectFolder={onSelectFolder}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function FolderTreeSidebar({
  tree,
  currentFolderId,
  expandedIds,
  unfiledCount = 0,
  onToggleExpand,
  onSelectFolder,
}: FolderTreeSidebarProps) {
  const libraryTotal =
    unfiledCount + tree.reduce((sum, node) => sum + (node.totalItemCount ?? 0), 0)
  const pinnedFolders = getPinnedFolders(tree)
  const isLibraryActive = currentFolderId === null

  return (
    <nav className="space-y-0.5">
      {pinnedFolders.length > 0 && (
        <div className="mb-1">
          <SectionLabel>Pinned</SectionLabel>
          <div className="space-y-0.5">
            {pinnedFolders.map((folder) => {
              const isActive = currentFolderId === folder._id
              const color = getFolderColor(folder.color)

              return (
                <button
                  key={folder._id}
                  type="button"
                  onClick={() => onSelectFolder(folder._id)}
                  className={cn(
                    "relative flex min-h-10 w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-muted/80 text-foreground"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <span
                      aria-hidden
                      className="absolute inset-y-1.5 left-0 w-0.5 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  )}
                  <span
                    className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-700"
                    style={{ backgroundColor: color }}
                  >
                    <Folder
                      className="h-4 w-4"
                      fill="currentColor"
                      fillOpacity={0.2}
                    />
                    <Pin
                      className="absolute -right-1 -top-1 h-3 w-3 text-amber-500"
                      fill="currentColor"
                    />
                  </span>
                  <span
                    className={cn(
                      "min-w-0 flex-1 truncate text-left",
                      isActive && "font-medium"
                    )}
                  >
                    {folder.name}
                  </span>
                  <FolderCountBadge
                    count={folder.totalItemCount ?? 0}
                    muted={!isActive}
                  />
                </button>
              )
            })}
          </div>
        </div>
      )}

      <SectionLabel>Library</SectionLabel>
      <button
        type="button"
        onClick={() => onSelectFolder(null)}
        className={cn(
          "relative flex min-h-10 w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
          isLibraryActive
            ? "bg-muted/80 text-foreground"
            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        )}
      >
        {isLibraryActive && (
          <span
            aria-hidden
            className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-foreground/70"
          />
        )}
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-foreground/5 text-foreground/80">
          <Library className="h-4 w-4" />
        </span>
        <span
          className={cn(
            "min-w-0 flex-1 truncate text-left",
            isLibraryActive ? "font-medium" : "font-normal"
          )}
        >
          All items
        </span>
        <FolderCountBadge count={libraryTotal} muted={!isLibraryActive} />
      </button>

      <SectionLabel>Folders</SectionLabel>
      {tree.length === 0 ? (
        <div className="mx-1 rounded-md border border-dashed border-border/80 px-3 py-4 text-center">
          <Folder className="mx-auto mb-1.5 h-4 w-4 text-muted-foreground/50" />
          <p className="text-[11px] text-muted-foreground">No folders yet</p>
        </div>
      ) : (
        <div className="space-y-0.5">
          {tree.map((node) => (
            <TreeNode
              key={node._id}
              node={node}
              depth={0}
              currentFolderId={currentFolderId}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              onSelectFolder={onSelectFolder}
            />
          ))}
        </div>
      )}
    </nav>
  )
}
