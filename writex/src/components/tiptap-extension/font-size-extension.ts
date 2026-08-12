import { Extension } from "@tiptap/core"

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (fontSize: number) => ReturnType
      unsetFontSize: () => ReturnType
    }
  }
}

export const FontSize = Extension.create({
  name: "fontSize",

  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => {
              const value = Number.parseFloat(element.style.fontSize)
              return Number.isFinite(value) ? value : null
            },
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {}
              return { style: `font-size: ${attributes.fontSize}px` }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize: number) =>
        ({ commands }) =>
          commands.setMark("textStyle", { fontSize }),
      unsetFontSize:
        () =>
        ({ commands }) =>
          commands.setMark("textStyle", { fontSize: null }) &&
          commands.removeEmptyTextStyle(),
    }
  },
})
