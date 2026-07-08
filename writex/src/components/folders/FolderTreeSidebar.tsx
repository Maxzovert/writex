import { ChevronDown, ChevronRight, Home, Pin } from "lucide-react"
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

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-0.5 rounded-md text-sm",
          isActive ? "bg-accent text-accent-foreground" : "hover:bg-muted/60"
        )}
        style={{ paddingLeft: `${depth * 12 + 4}px` }}
      >
        <button
          type="button"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded"
          onClick={() => hasChildren && onToggleExpand(node._id)}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            )
          ) : (
            <span className="h-3.5 w-3.5" />
          )}
        </button>

        <button
          type="button"
          onClick={() => onSelectFolder(node._id)}
          className="flex min-w-0 flex-1 items-center gap-2 py-1.5 pr-2 text-left"
        >
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: getFolderColor(node.color) }}
          />
          <span className="min-w-0 flex-1 truncate">{node.name}</span>
          {node.isPinned && <Pin className="h-3 w-3 shrink-0 text-muted-foreground" />}
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

  return (
    <nav className="space-y-0.5">
      <button
        type="button"
        onClick={() => onSelectFolder(null)}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm",
          currentFolderId === null
            ? "bg-accent text-accent-foreground"
            : "hover:bg-muted/60"
        )}
      >
        <Home className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="flex-1 truncate text-left font-medium">Library</span>
        <FolderCountBadge count={libraryTotal} muted={currentFolderId !== null} />
      </button>

      {tree.length === 0 ? (
        <p className="px-2 py-3 text-xs text-muted-foreground">No folders yet</p>
      ) : (
        tree.map((node) => (
          <TreeNode
            key={node._id}
            node={node}
            depth={0}
            currentFolderId={currentFolderId}
            expandedIds={expandedIds}
            onToggleExpand={onToggleExpand}
            onSelectFolder={onSelectFolder}
          />
        ))
      )}
    </nav>
  )
}
