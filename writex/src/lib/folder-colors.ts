export const FOLDER_PASTEL_COLORS = [
  { id: "rose", value: "#FFD6E0", label: "Rose" },
  { id: "butter", value: "#FFECB3", label: "Butter" },
  { id: "mint", value: "#C8E6C9", label: "Mint" },
  { id: "sky", value: "#BBDEFB", label: "Sky" },
  { id: "lavender", value: "#E1BEE7", label: "Lavender" },
  { id: "peach", value: "#FFE0B2", label: "Peach" },
  { id: "aqua", value: "#B2DFDB", label: "Aqua" },
  { id: "blush", value: "#F8BBD0", label: "Blush" },
  { id: "lilac", value: "#D1C4E9", label: "Lilac" },
  { id: "mist", value: "#CFD8DC", label: "Mist" },
] as const

export const DEFAULT_FOLDER_COLOR = FOLDER_PASTEL_COLORS[3].value

export function getFolderColor(value?: string): string {
  if (!value) return DEFAULT_FOLDER_COLOR
  return FOLDER_PASTEL_COLORS.some((c) => c.value === value)
    ? value
    : DEFAULT_FOLDER_COLOR
}
