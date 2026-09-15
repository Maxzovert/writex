import { Folder, Library, Pin, ChevronRight, FileText } from "lucide-react";

const FOLDERS = [
  { name: "Essays", color: "#BBDEFB", count: 8, active: true, depth: 0 },
  { name: "Personal", color: "#C8E6C9", count: 3, active: false, depth: 1 },
  { name: "Ideas", color: "#FFECB3", count: 12, active: false, depth: 0 },
  { name: "Saved reads", color: "#E1BEE7", count: 5, active: false, depth: 0 },
];

const ITEMS = [
  { title: "Why midnight drafts hit different", status: "Published" },
  { title: "Notes on writing without an audience", status: "Draft" },
  { title: "A short piece saved from Alex", status: "Saved" },
];

export function FolderDemo() {
  return (
    <div className="wx-glass overflow-hidden rounded-[1.75rem]">
      <div className="flex items-center justify-between border-b border-[var(--wx-line)] px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--wx-text)]">
          <Library className="h-4 w-4 text-[var(--wx-accent)]" />
          My Library
        </div>
        <span className="rounded-full bg-[var(--wx-soft)] px-2.5 py-1 text-[11px] text-[var(--wx-mute)]">
          Folders · own & saved
        </span>
      </div>

      <div className="grid min-h-[300px] md:grid-cols-[200px_1fr]">
        <aside className="border-b border-[var(--wx-line)] bg-[var(--wx-soft)] p-3 md:border-b-0 md:border-r md:border-[var(--wx-line)]">
          <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--wx-mute)]">
            Pinned
          </p>
          <div className="mb-3 flex items-center gap-2 rounded-lg bg-[var(--wx-panel)] px-2.5 py-2 text-sm text-[var(--wx-text)]">
            <Pin className="h-3.5 w-3.5 text-[var(--wx-accent)]" />
            Essays
          </div>
          <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--wx-mute)]">
            Folders
          </p>
          <div className="space-y-1">
            {FOLDERS.map((f) => (
              <div
                key={f.name}
                className={`flex items-center gap-2 rounded-lg px-2 py-2 text-sm ${
                  f.active
                    ? "bg-[var(--wx-panel)] text-[var(--wx-text)]"
                    : "text-[var(--wx-mute)]"
                }`}
                style={{ marginLeft: f.depth * 12 }}
              >
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-md"
                  style={{ backgroundColor: f.color }}
                >
                  <Folder className="h-3.5 w-3.5 text-zinc-800/70" />
                </span>
                <span className="flex-1 truncate">{f.name}</span>
                <span className="text-[10px] text-[var(--wx-mute)]">{f.count}</span>
              </div>
            ))}
          </div>
        </aside>

        <div className="p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-1.5 text-xs text-[var(--wx-mute)]">
            <span>Library</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[var(--wx-text)]">Essays</span>
          </div>
          <div className="space-y-2">
            {ITEMS.map((item) => (
              <div
                key={item.title}
                className="flex items-center gap-3 rounded-xl border border-[var(--wx-line)] bg-[var(--wx-soft)] px-3 py-2.5"
              >
                <FileText className="h-4 w-4 shrink-0 text-[var(--wx-accent)]" />
                <p className="min-w-0 flex-1 truncate text-sm text-[var(--wx-text)]">
                  {item.title}
                </p>
                <span className="rounded-full bg-[var(--wx-panel)] px-2 py-0.5 text-[10px] font-semibold text-[var(--wx-mute)]">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
