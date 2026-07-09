import { Extension } from "@tiptap/core"
import { Plugin, PluginKey } from "@tiptap/pm/state"
import { Decoration, DecorationSet } from "@tiptap/pm/view"
import { createBookmarkPinElement } from "@/components/bookmarks/BookmarkPin"
import type { Bookmark } from "@/lib/bookmarks"
import { BOOKMARK_COLOR_STYLES, resolveBookmarkToRange } from "@/lib/bookmarks"

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
            if (bookmarks.length === 0) {
              return DecorationSet.empty
            }

            const decorations: Decoration[] = []

            for (const bookmark of bookmarks) {
              const range = resolveBookmarkToRange(state.doc, bookmark)
              if (!range) continue

              const colorStyle = BOOKMARK_COLOR_STYLES[bookmark.color]

              decorations.push(
                Decoration.inline(range.from, range.to, {
                  class: `writex-bookmark-highlight writex-bookmark-highlight--${bookmark.color}`,
                  style: `background-color: ${colorStyle.bg}; box-decoration-break: clone; -webkit-box-decoration-break: clone; border-bottom: 2px solid ${colorStyle.border};`,
                }),
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

            return decorations.length > 0
              ? DecorationSet.create(state.doc, decorations)
              : DecorationSet.empty
          },
        },
      }),
    ]
  },
})
