import React from "react";
import { cn } from "@/lib/utils";

interface HtmlCanvasEditorProps {
  value: string;
  onChange: (value: string) => void;
  wide?: boolean;
  className?: string;
}

export function HtmlCanvasEditor({
  value,
  onChange,
  wide = false,
  className,
}: HtmlCanvasEditorProps) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-hidden bg-background",
        className
      )}
    >
      <div className="shrink-0 border-b border-border bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
        HTML mode — edit the full document source. Switch to Normal to use the visual editor and bookmarks.
      </div>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        spellCheck={false}
        aria-label="HTML source editor"
        className={cn(
          "min-h-0 flex-1 w-full resize-none border-0 bg-background p-4 font-mono text-sm leading-relaxed text-foreground outline-none focus:ring-0",
          "overflow-y-auto",
          wide ? "max-w-[72rem] mx-auto" : "max-w-3xl mx-auto"
        )}
        placeholder="<h1>Your blog HTML</h1>&#10;<p>Write or paste full HTML here...</p>"
      />
    </div>
  );
}
