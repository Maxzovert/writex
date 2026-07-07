import { Extension } from "@tiptap/core"
import { Plugin, PluginKey } from "@tiptap/pm/state"
import { Decoration, DecorationSet } from "@tiptap/pm/view"
import { createBookmarkPinElement } from "@/components/bookmarks/BookmarkPin"
import type { Bookmark } from "@/lib/bookmarks"
import { resolveAnchorToRange } from "@/lib/bookmarks"

export interface BookmarkDecorationsOptions {
  getBookmarks: () => Bookmark[]
}

export const BookmarkDecorations = Extension.create<BookmarkDecorationsOptions>({
  name: "bookmarkDecorations",

  addOptions() {
    return {
      getBookmarks: () => [] as Bookmark[],
    }
  },

  addProseMirrorPlugins() {
    const getBookmarks = this.options.getBookmarks

    return [
      new Plugin({
        key: new PluginKey("bookmarkDecorations"),
        props: {
          decorations(state) {
            const bookmarks = getBookmarks()
            if (bookmarks.length === 0) return null

            const decorations: Decoration[] = []

            for (const bookmark of bookmarks) {
              const range = resolveAnchorToRange(state.doc, bookmark.anchor)
              if (!range) continue

              decorations.push(
                Decoration.widget(
                  range.from,
                  () => createBookmarkPinElement(bookmark.color, bookmark.id),
                  {
                    side: -1,
                    key: `bookmark-pin-${bookmark.id}`,
                  }
                )
              )
            }

            return DecorationSet.create(state.doc, decorations)
          },
        },
      }),
    ]
  },
})
