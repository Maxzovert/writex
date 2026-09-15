import {
  Bold,
  Italic,
  List,
  Heading2,
  Image as ImageIcon,
  Table,
  Code2,
  Highlighter,
} from "lucide-react";

const TOOLS = [Heading2, Bold, Italic, Highlighter, List, Table, Code2, ImageIcon];

export function CanvasDemo() {
  return (
    <div className="wx-glass overflow-hidden rounded-[1.75rem]">
      <div className="flex items-center justify-between border-b border-[var(--wx-line)] px-4 py-3 sm:px-5">
        <div>
          <p className="text-sm font-semibold text-[var(--wx-text)]">Writing canvas</p>
          <p className="text-[11px] text-[var(--wx-mute)]">Auto-saving · Focus mode</p>
        </div>
        <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
          Draft saved
        </span>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-[var(--wx-line)] bg-[var(--wx-soft)] px-3 py-2">
        {TOOLS.map((Icon, i) => (
          <span
            key={i}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--wx-mute)]"
          >
            <Icon className="h-4 w-4" />
          </span>
        ))}
      </div>

      <div className="space-y-4 px-5 py-6 sm:px-7 sm:py-7">
        <h3 className="wx-serif text-3xl text-[var(--wx-text)] sm:text-4xl">
          Start writing with WriteX
        </h3>
        <p className="text-[15px] leading-relaxed text-[var(--wx-mute)]">
          Headings, lists,{" "}
          <span className="rounded bg-[var(--wx-accent)]/25 px-1 text-[var(--wx-accent)]">
            highlights
          </span>
          , tables, code, and images — one calm canvas.
        </p>

        <div className="overflow-hidden rounded-xl border border-[var(--wx-line)]">
          <div className="grid grid-cols-3 bg-[var(--wx-soft)] text-xs font-semibold text-[var(--wx-text)]">
            <div className="border-b border-r border-[var(--wx-line)] px-3 py-2">Tool</div>
            <div className="border-b border-r border-[var(--wx-line)] px-3 py-2">Use</div>
            <div className="border-b border-[var(--wx-line)] px-3 py-2">Feel</div>
          </div>
          {[
            ["Tables", "Structure", "Clear"],
            ["Code", "Snippets", "Sharp"],
            ["Tasks", "Track", "Focused"],
          ].map((row, ri, arr) => (
            <div
              key={row[0]}
              className={`grid grid-cols-3 text-xs text-[var(--wx-mute)] ${
                ri < arr.length - 1 ? "border-b border-[var(--wx-line)]" : ""
              }`}
            >
              {row.map((cell, i) => (
                <div
                  key={cell}
                  className={`px-3 py-2 ${i < 2 ? "border-r border-[var(--wx-line)]" : ""}`}
                >
                  {cell}
                </div>
              ))}
            </div>
          ))}
        </div>

        <pre
          className="overflow-x-auto rounded-xl px-4 py-3 font-mono text-[12px]"
          style={{ background: "var(--wx-code-bg)", color: "var(--wx-code-fg)" }}
        >
          {`function write() {\n  return "publish when it feels true";\n}`}
        </pre>
      </div>
    </div>
  );
}
