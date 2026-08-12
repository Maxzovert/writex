import { jsPDF } from 'jspdf';

const MIN_PDF_BYTES = 400;
const MARGIN_MM = 16;
const PAGE_WIDTH_MM = 210;
const PAGE_HEIGHT_MM = 297;
const CONTENT_WIDTH_MM = PAGE_WIDTH_MM - MARGIN_MM * 2;

const HEADING_SIZES = {
  1: 22,
  2: 18,
  3: 15,
  4: 13,
  5: 12,
  6: 11,
};

function sanitizeFilename(title) {
  const base = stripEmojis(String(title || 'note'))
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 80);
  return `${base || 'note'}.pdf`;
}

/** Remove emoji / pictographs. Do not replace them with symbols. */
function stripEmojis(text) {
  return String(text ?? '')
    .replace(/\p{Extended_Pictographic}/gu, '')
    .replace(/\p{Emoji_Presentation}/gu, '')
    .replace(/\p{Emoji_Modifier}/gu, '')
    .replace(/\uFE0F/g, '')
    .replace(/\u200D/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]{2,}/g, ' ');
}

function report(onProgress, stage, percent, message) {
  if (typeof onProgress === 'function') {
    onProgress({ stage, percent: Math.max(0, Math.min(100, Math.round(percent))), message });
  }
}

function normalizeContent(content) {
  if (content == null) return null;
  if (typeof content === 'string') {
    try {
      const parsed = JSON.parse(content);
      return normalizeContent(parsed);
    } catch {
      return { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: content }] }] };
    }
  }
  if (content?.format === 'html') return null;
  if (content?.type === 'doc' && Array.isArray(content.content)) return content;
  if (Array.isArray(content?.content)) return { type: 'doc', content: content.content };
  return null;
}

function nodePlainText(nodes) {
  if (!nodes || !Array.isArray(nodes)) return '';
  return stripEmojis(
    nodes
      .map((n) => {
        if (!n) return '';
        if (n.type === 'text') return n.text || '';
        if (n.type === 'hardBreak') return '\n';
        if (Array.isArray(n.content)) return nodePlainText(n.content);
        return '';
      })
      .join('')
  );
}

function markFontStyle(marks) {
  let bold = false;
  let italic = false;
  if (!marks) return 'normal';
  for (const mark of marks) {
    if (mark.type === 'bold') bold = true;
    if (mark.type === 'italic') italic = true;
  }
  if (bold && italic) return 'bolditalic';
  if (bold) return 'bold';
  if (italic) return 'italic';
  return 'normal';
}

/** Flatten TipTap table rows into drawable cells (honors colspan). */
function extractTableRows(tableNode) {
  const rows = tableNode?.content || [];
  let maxCols = 0;

  const parsed = rows.map((row) => {
    const cells = [];
    let colCursor = 0;
    for (const cell of row.content || []) {
      const colspan = Math.max(1, Math.min(12, Number(cell.attrs?.colspan) || 1));
      cells.push({
        text: nodePlainText(cell.content).trim(),
        colspan,
        isHeader: cell.type === 'tableHeader',
        colStart: colCursor,
      });
      colCursor += colspan;
    }
    maxCols = Math.max(maxCols, colCursor);
    return cells;
  });

  return { rows: parsed, colCount: Math.max(1, maxCols) };
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
}

/**
 * Build a text PDF from TipTap JSON (no DOM screenshot — avoids blank captures).
 *
 * @param {{
 *   title: string,
 *   content: unknown,
 *   authorName?: string,
 *   dateLabel?: string,
 *   onProgress?: (info: { stage: string, percent: number, message: string }) => void,
 * }} options
 */
export async function exportBlogPdf({
  title,
  content,
  authorName,
  dateLabel,
  onProgress,
} = {}) {
  report(onProgress, 'preparing', 5, 'Preparing export…');

  const doc = normalizeContent(content);
  const filename = sanitizeFilename(title);
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

  let y = MARGIN_MM;
  let pageCount = 1;
  let wroteBody = false;

  const ensureSpace = (neededMm) => {
    if (y + neededMm <= PAGE_HEIGHT_MM - MARGIN_MM) return;
    pdf.addPage();
    pageCount += 1;
    y = MARGIN_MM;
  };

  const writeWrapped = (text, { size = 11, style = 'normal', color = [17, 24, 39], gapAfter = 3, font = 'helvetica' } = {}) => {
    const value = stripEmojis(text).trimEnd();
    if (!value.trim()) {
      y += gapAfter;
      return;
    }

    pdf.setFont(font, style);
    pdf.setFontSize(size);
    pdf.setTextColor(...color);

    const lines = pdf.splitTextToSize(value, CONTENT_WIDTH_MM);
    const lineHeight = size * 0.4;

    for (const line of lines) {
      ensureSpace(lineHeight + 1);
      pdf.text(line, MARGIN_MM, y + lineHeight * 0.75);
      y += lineHeight;
      wroteBody = true;
    }
    y += gapAfter;
  };

  const writeRuns = (nodes, { size = 11, gapAfter = 4 } = {}) => {
    if (!nodes?.length) {
      y += gapAfter;
      return;
    }

    // jsPDF can't easily mix styles on one wrapped line; write mark-aware chunks line-by-line.
    const chunks = [];
    for (const node of nodes) {
      if (!node) continue;
      if (node.type === 'hardBreak') {
        chunks.push({ text: '\n', style: 'normal' });
        continue;
      }
      if (node.type === 'text') {
        chunks.push({
          text: node.text || '',
          style: markFontStyle(node.marks),
          code: node.marks?.some((m) => m.type === 'code'),
        });
      } else if (Array.isArray(node.content)) {
        chunks.push({ text: nodePlainText(node.content), style: 'normal' });
      }
    }

    const full = chunks.map((c) => c.text).join('');
    if (!full.trim()) {
      y += gapAfter;
      return;
    }

    // Prefer readable export: one style per paragraph based on dominant marks
    const hasBold = chunks.some((c) => c.style.includes('bold'));
    const hasItalic = chunks.some((c) => c.style.includes('italic'));
    const style =
      hasBold && hasItalic ? 'bolditalic' : hasBold ? 'bold' : hasItalic ? 'italic' : 'normal';
    const hasCode = chunks.some((c) => c.code);

    writeWrapped(full, {
      size,
      style,
      font: hasCode ? 'courier' : 'helvetica',
      color: hasCode ? [24, 24, 27] : [55, 65, 81],
      gapAfter,
    });
  };

  const writeTable = (tableNode) => {
    const { rows, colCount } = extractTableRows(tableNode);
    if (!rows.length) return;

    const fontSize = 9;
    const lineHeight = fontSize * 0.38;
    const padX = 2;
    const padY = 2.2;
    const colWidth = CONTENT_WIDTH_MM / colCount;
    const hasHeaderRow =
      rows[0]?.length > 0 && rows[0].every((cell) => cell.isHeader);

    const measureRow = (cells) => {
      let maxLines = 1;
      const prepared = cells.map((cell) => {
        const width = Math.max(8, cell.colspan * colWidth - padX * 2);
        pdf.setFont('helvetica', cell.isHeader ? 'bold' : 'normal');
        pdf.setFontSize(fontSize);
        const lines = pdf.splitTextToSize(cell.text || ' ', width);
        maxLines = Math.max(maxLines, lines.length);
        return { ...cell, lines, width };
      });
      const height = Math.max(8, maxLines * lineHeight + padY * 2);
      return { prepared, height };
    };

    const drawRow = (cells, rowHeight, isHeader) => {
      ensureSpace(rowHeight + 1);
      const rowTop = y;

      // Background for header
      if (isHeader) {
        pdf.setFillColor(243, 244, 246);
        pdf.rect(MARGIN_MM, rowTop, CONTENT_WIDTH_MM, rowHeight, 'F');
      }

      // Outer + cell borders
      pdf.setDrawColor(209, 213, 219);
      pdf.setLineWidth(0.25);
      pdf.rect(MARGIN_MM, rowTop, CONTENT_WIDTH_MM, rowHeight, 'S');

      let x = MARGIN_MM;
      cells.forEach((cell, idx) => {
        const cellW = cell.colspan * colWidth;
        if (idx > 0) {
          pdf.line(x, rowTop, x, rowTop + rowHeight);
        }

        pdf.setFont('helvetica', cell.isHeader ? 'bold' : 'normal');
        pdf.setFontSize(fontSize);
        pdf.setTextColor(cell.isHeader ? 17 : 55, cell.isHeader ? 24 : 65, cell.isHeader ? 39 : 81);

        let textY = rowTop + padY + lineHeight * 0.75;
        for (const line of cell.lines) {
          pdf.text(line, x + padX, textY, {
            maxWidth: cell.width,
          });
          textY += lineHeight;
        }

        x += cellW;
      });

      y = rowTop + rowHeight;
      wroteBody = true;
    };

    // Prefer starting table on a fresh enough area
    ensureSpace(12);
    rows.forEach((cells, rowIndex) => {
      const isHeader = hasHeaderRow && rowIndex === 0;
      const { prepared, height } = measureRow(cells);

      // If row won't fit, new page; repeat header when present
      if (y + height > PAGE_HEIGHT_MM - MARGIN_MM) {
        pdf.addPage();
        pageCount += 1;
        y = MARGIN_MM;
        if (hasHeaderRow && rowIndex > 0) {
          const header = measureRow(rows[0]);
          drawRow(header.prepared, header.height, true);
        }
      }

      drawRow(prepared, height, isHeader);
    });

    y += 5;
  };

  report(onProgress, 'rendering', 15, 'Writing note content…');

  writeWrapped(title || 'Untitled', {
    size: 22,
    style: 'bold',
    color: [17, 24, 39],
    gapAfter: 3,
  });

  const metaParts = [authorName, dateLabel].map((part) => stripEmojis(part).trim()).filter(Boolean);
  if (metaParts.length) {
    writeWrapped(metaParts.join(' - '), {
      size: 10,
      style: 'normal',
      color: [107, 114, 128],
      gapAfter: 8,
    });
  }

  const blocks = doc?.content || [];
  if (!doc) {
    writeWrapped('This note has no exportable text content.', {
      size: 11,
      color: [107, 114, 128],
      gapAfter: 4,
    });
  }

  const total = Math.max(blocks.length, 1);
  blocks.forEach((node, index) => {
    const percent = 15 + Math.round(((index + 1) / total) * 70);
    report(onProgress, 'building', percent, `Writing block ${index + 1} of ${total}…`);

    switch (node.type) {
      case 'paragraph':
        writeRuns(node.content, { size: 11, gapAfter: 4 });
        break;

      case 'heading': {
        const level = Math.min(6, Math.max(1, Number(node.attrs?.level) || 1));
        writeWrapped(nodePlainText(node.content), {
          size: HEADING_SIZES[level],
          style: 'bold',
          color: [17, 24, 39],
          gapAfter: 5,
        });
        break;
      }

      case 'blockquote': {
        const quote = nodePlainText(node.content);
        writeWrapped(quote, {
          size: 11,
          style: 'italic',
          color: [75, 85, 99],
          gapAfter: 5,
        });
        break;
      }

      case 'bulletList':
      case 'orderedList': {
        const items = node.content || [];
        items.forEach((item, i) => {
          const prefix = node.type === 'orderedList' ? `${i + 1}. ` : '- ';
          writeWrapped(`${prefix}${nodePlainText(item.content)}`, {
            size: 11,
            color: [55, 65, 81],
            gapAfter: 2,
          });
        });
        y += 2;
        break;
      }

      case 'taskList': {
        const items = node.content || [];
        items.forEach((item) => {
          const mark = item.attrs?.checked ? '[x] ' : '[ ] ';
          writeWrapped(`${mark}${nodePlainText(item.content)}`, {
            size: 11,
            color: [55, 65, 81],
            gapAfter: 2,
          });
        });
        y += 2;
        break;
      }

      case 'codeBlock': {
        const code = nodePlainText(node.content);
        writeWrapped(code, {
          size: 9,
          font: 'courier',
          style: 'normal',
          color: [24, 24, 27],
          gapAfter: 5,
        });
        break;
      }

      case 'horizontalRule':
        ensureSpace(6);
        pdf.setDrawColor(209, 213, 219);
        pdf.setLineWidth(0.3);
        pdf.line(MARGIN_MM, y + 2, PAGE_WIDTH_MM - MARGIN_MM, y + 2);
        y += 8;
        wroteBody = true;
        break;

      case 'table':
        writeTable(node);
        break;

      case 'image':
        // Intentionally omitted from PDF export
        break;

      default: {
        const fallback = nodePlainText(node.content);
        if (fallback.trim()) {
          writeWrapped(fallback, { size: 11, color: [55, 65, 81], gapAfter: 4 });
        }
        break;
      }
    }
  });

  if (!wroteBody) {
    writeWrapped('No text content to export.', {
      size: 11,
      color: [107, 114, 128],
      gapAfter: 4,
    });
  }

  report(onProgress, 'packaging', 92, 'Packaging PDF file…');
  const blob = pdf.output('blob');
  if (!(blob instanceof Blob) || blob.size < MIN_PDF_BYTES) {
    throw new Error('Generated PDF was empty — download aborted');
  }

  report(onProgress, 'downloading', 98, 'Starting download…');
  triggerDownload(blob, filename);

  report(onProgress, 'done', 100, 'PDF ready');
  return { filename, byteSize: blob.size, pageCount };
}
