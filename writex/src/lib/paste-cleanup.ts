/**
 * Clean HTML pasted from Word / Docs / browsers so TipTap does not leave
 * empty underlined spans, ghost tables, or layout-breaking wrappers.
 */
export function transformPastedHtml(html: string): string {
  if (!html || typeof window === "undefined") return html

  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, "text/html")
    const body = doc.body

    // Strip Word conditional comments leftover as text
    body.querySelectorAll("*").forEach((el) => {
      // Remove zero-size / decorative Microsoft Office tags
      if (/^O:|^V:|^W:/i.test(el.tagName)) {
        el.replaceWith(...Array.from(el.childNodes))
      }
    })

    // Unwrap empty tables (Word sometimes wraps plain text in tables)
    body.querySelectorAll("table").forEach((table) => {
      const text = (table.textContent || "").replace(/\u00a0/g, " ").trim()
      const cells = table.querySelectorAll("td, th")
      const rows = table.querySelectorAll("tr")
      if (!text || cells.length === 0) {
        table.remove()
        return
      }
      // Single-cell or single-row "layout table" → unwrap to flow content
      if (cells.length === 1 || rows.length === 1) {
        const fragment = doc.createDocumentFragment()
        cells.forEach((cell) => {
          Array.from(cell.childNodes).forEach((child) => {
            fragment.appendChild(child.cloneNode(true))
          })
        })
        table.replaceWith(fragment)
      }
    })

    // Kill leftover column-resize / Word border artifacts as empty paragraphs
    // with only underline / border styling
    body.querySelectorAll("[style*='border'], [style*='text-decoration']").forEach((el) => {
      if (!(el instanceof HTMLElement)) return
      const text = (el.textContent || "").replace(/\u00a0/g, " ").trim()
      if (!text) {
        el.style.border = "none"
        el.style.borderBottom = "none"
        el.style.textDecoration = "none"
        if (!el.querySelector("img, table, br")) {
          el.remove()
        }
      }
    })

    // Remove underline / colored borders on whitespace-only nodes
    body.querySelectorAll("u, span, a").forEach((el) => {
      const text = (el.textContent || "").replace(/\u00a0/g, " ")
      if (!text.trim()) {
        if (el.tagName === "A") {
          el.remove()
        } else {
          el.replaceWith(...Array.from(el.childNodes))
        }
        return
      }

      if (el instanceof HTMLElement) {
        const decoration = el.style.textDecoration || el.style.textDecorationLine
        if (decoration.includes("underline") && !text.trim()) {
          el.style.textDecoration = "none"
        }
        // Strip pasted underline color that paints as floating blue lines
        el.style.textDecorationColor = ""
        el.style.borderBottom = ""
        el.style.borderBottomColor = ""
      }
    })

    // Drop empty paragraphs that only hold breaks / nbsp
    body.querySelectorAll("p, div, h1, h2, h3, h4, h5, h6").forEach((el) => {
      const text = (el.textContent || "").replace(/\u00a0/g, " ").trim()
      const hasMedia = el.querySelector("img, video, iframe, table, pre, code")
      if (!text && !hasMedia) {
        // Keep a single empty paragraph if it's the only content
        if (body.children.length > 1) {
          el.remove()
        }
      }
    })

    // Normalize divs to paragraphs for cleaner TipTap mapping
    body.querySelectorAll("div").forEach((div) => {
      if (div.querySelector("p, ul, ol, table, pre, blockquote, h1, h2, h3, h4")) {
        return
      }
      const p = doc.createElement("p")
      p.innerHTML = div.innerHTML
      div.replaceWith(p)
    })

    return body.innerHTML
  } catch {
    return html
  }
}

/** Normalize plain-text paste: consistent newlines, strip odd separators. */
export function transformPastedText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/\u200b/g, "")
}
