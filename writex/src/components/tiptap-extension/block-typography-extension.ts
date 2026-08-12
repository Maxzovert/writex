import { Extension } from "@tiptap/core"

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    blockTypography: {
      setLineHeight: (lineHeight: number | null) => ReturnType
      setLetterSpacing: (letterSpacing: number | null) => ReturnType
    }
  }
}

const isTypographyBlock = (typeName: string) =>
  typeName === "paragraph" || typeName === "heading"

/** Keep line-height readable so lines never paint on top of each other. */
const sanitizeLineHeight = (value: number | null) => {
  if (value === null || value === undefined) return null
  if (!Number.isFinite(value)) return null
  return Math.min(3, Math.max(1.15, value))
}

const sanitizeLetterSpacing = (value: number | null) => {
  if (value === null || value === undefined) return null
  if (!Number.isFinite(value)) return null
  return Math.min(20, Math.max(-2, value))
}

export const BlockTypography = Extension.create({
  name: "blockTypography",

  addGlobalAttributes() {
    return [
      {
        types: ["paragraph", "heading"],
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: (element) => {
              const raw = element.style.lineHeight
              if (!raw || raw === "normal") return null
              const value = Number.parseFloat(raw)
              return sanitizeLineHeight(Number.isFinite(value) ? value : null)
            },
            renderHTML: (attributes) => {
              const lineHeight = sanitizeLineHeight(attributes.lineHeight)
              if (lineHeight === null) return {}
              return { style: `line-height: ${lineHeight}` }
            },
          },
          letterSpacing: {
            default: null,
            parseHTML: (element) => {
              const value = Number.parseFloat(element.style.letterSpacing)
              return sanitizeLetterSpacing(
                Number.isFinite(value) ? value : null
              )
            },
            renderHTML: (attributes) => {
              const letterSpacing = sanitizeLetterSpacing(
                attributes.letterSpacing
              )
              if (letterSpacing === null) return {}
              return { style: `letter-spacing: ${letterSpacing}px` }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setLineHeight:
        (lineHeight) =>
        ({ commands, state }) => {
          const typeName = state.selection.$from.parent.type.name
          if (!isTypographyBlock(typeName)) return false
          return commands.updateAttributes(typeName, {
            lineHeight: sanitizeLineHeight(lineHeight),
          })
        },
      setLetterSpacing:
        (letterSpacing) =>
        ({ commands, state }) => {
          const typeName = state.selection.$from.parent.type.name
          if (!isTypographyBlock(typeName)) return false
          return commands.updateAttributes(typeName, {
            letterSpacing: sanitizeLetterSpacing(letterSpacing),
          })
        },
    }
  },
})
