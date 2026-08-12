import React from 'react';
import { HighlightedCodeBlock } from '@/components/HighlightedCodeBlock';
import { renderBookmarkedText } from '@/components/bookmarks/render-bookmarked-text';
import { getSafeImageUrl } from '@/lib/image-url';
import { getChildTextOffsetBase, getTableCellTextOffsetBase } from '@/lib/bookmarks';

const EMPTY_BOOKMARKS = [];

/** Renders TipTap `text` nodes (with marks) for paragraphs, table cells, etc. */
export function renderTextRuns(nodes, keyPrefix = 't', { forceLight = false } = {}) {
  if (!nodes || !Array.isArray(nodes)) return null;
  return nodes.map((textNode, textIndex) => {
    if (textNode.type !== 'text') return null;

    let text = textNode.text;
    let className = '';
    let customHighlightColor = null;
    let linkHref = null;
    let linkTarget = null;
    const textStyle = {};

    if (textNode.marks) {
      textNode.marks.forEach((mark) => {
        switch (mark.type) {
          case 'bold':
            className += ' font-bold';
            break;
          case 'italic':
            className += ' italic';
            break;
          case 'underline':
            className += ' underline';
            break;
          case 'strike':
            className += ' line-through';
            break;
          case 'highlight':
            if (mark.attrs && mark.attrs.color) {
              const color = mark.attrs.color;
              if (color.startsWith('var(--') || color.startsWith('#')) {
                className += forceLight
                  ? ' px-1 rounded text-gray-900 ring-1 ring-black/10'
                  : ' px-1 rounded text-gray-900 dark:text-gray-100 ring-1 ring-black/10 dark:ring-white/20';
                customHighlightColor = color;
              } else {
                switch (color) {
                  case 'yellow':
                    className += forceLight
                      ? ' bg-yellow-200 text-gray-900 px-1 rounded'
                      : ' bg-yellow-200 dark:bg-yellow-950/80 text-gray-900 dark:text-yellow-50 px-1 rounded';
                    break;
                  case 'green':
                    className += forceLight
                      ? ' bg-green-200 text-gray-900 px-1 rounded'
                      : ' bg-green-200 dark:bg-green-950/80 text-gray-900 dark:text-green-50 px-1 rounded';
                    break;
                  case 'blue':
                    className += forceLight
                      ? ' bg-blue-200 text-gray-900 px-1 rounded'
                      : ' bg-blue-200 dark:bg-blue-950/80 text-gray-900 dark:text-blue-50 px-1 rounded';
                    break;
                  case 'red':
                    className += forceLight
                      ? ' bg-red-200 text-gray-900 px-1 rounded'
                      : ' bg-red-200 dark:bg-red-950/80 text-gray-900 dark:text-red-50 px-1 rounded';
                    break;
                  case 'purple':
                    className += forceLight
                      ? ' bg-purple-200 text-gray-900 px-1 rounded'
                      : ' bg-purple-200 dark:bg-purple-950/80 text-gray-900 dark:text-purple-50 px-1 rounded';
                    break;
                  case 'pink':
                    className += forceLight
                      ? ' bg-pink-200 text-gray-900 px-1 rounded'
                      : ' bg-pink-200 dark:bg-pink-950/80 text-gray-900 dark:text-pink-50 px-1 rounded';
                    break;
                  case 'orange':
                    className += forceLight
                      ? ' bg-orange-200 text-gray-900 px-1 rounded'
                      : ' bg-orange-200 dark:bg-orange-950/80 text-gray-900 dark:text-orange-50 px-1 rounded';
                    break;
                  case 'teal':
                    className += forceLight
                      ? ' bg-teal-200 text-gray-900 px-1 rounded'
                      : ' bg-teal-200 dark:bg-teal-950/80 text-gray-900 dark:text-teal-50 px-1 rounded';
                    break;
                  case 'indigo':
                    className += forceLight
                      ? ' bg-indigo-200 text-gray-900 px-1 rounded'
                      : ' bg-indigo-200 dark:bg-indigo-950/80 text-gray-900 dark:text-indigo-50 px-1 rounded';
                    break;
                  case 'gray':
                    className += forceLight
                      ? ' bg-gray-200 text-gray-900 px-1 rounded'
                      : ' bg-gray-200 dark:bg-zinc-700 text-gray-900 dark:text-zinc-100 px-1 rounded';
                    break;
                  default:
                    className += forceLight
                      ? ' bg-yellow-200 text-gray-900 px-1 rounded'
                      : ' bg-yellow-200 dark:bg-yellow-950/80 text-gray-900 dark:text-yellow-50 px-1 rounded';
                    break;
                }
              }
            } else {
              className += forceLight
                ? ' bg-yellow-200 text-gray-900 px-1 rounded'
                : ' bg-yellow-200 dark:bg-yellow-950/80 text-gray-900 dark:text-yellow-50 px-1 rounded';
            }
            break;
          case 'code':
            className += forceLight
              ? ' bg-zinc-100 text-zinc-900 px-2 py-1 rounded font-mono text-sm border border-zinc-200'
              : ' bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-2 py-1 rounded font-mono text-sm border border-zinc-200 dark:border-zinc-600';
            break;
          case 'link':
            linkHref = mark.attrs?.href;
            linkTarget = mark.attrs?.target;
            className += forceLight
              ? ' text-blue-600 underline'
              : ' text-blue-600 dark:text-blue-400 underline';
            break;
          case 'textStyle': {
            const fontSize = Number(mark.attrs?.fontSize);
            if (Number.isFinite(fontSize) && fontSize >= 8 && fontSize <= 96) {
              textStyle.fontSize = `${fontSize}px`;
            }
            break;
          }
          default:
            break;
        }
      });
    }

    const key = `${keyPrefix}-${textIndex}`;

    if (linkHref) {
      return (
        <a
          key={key}
          href={linkHref}
          target={linkTarget ?? undefined}
          rel={linkTarget === '_blank' ? 'noopener noreferrer' : undefined}
          className={className}
          style={textStyle}
        >
          {text}
        </a>
      );
    }

    if (customHighlightColor) {
      return (
        <span
          key={key}
          className={className}
          style={{
            ...textStyle,
            backgroundColor: customHighlightColor,
            display: 'inline-block',
          }}
        >
          {text}
        </span>
      );
    }

    return (
      <span key={key} className={className} style={textStyle}>
        {text}
      </span>
    );
  });
}

function blockTypographyStyle(attrs) {
  return {
    textAlign: attrs?.textAlign || 'left',
    ...(Number.isFinite(Number(attrs?.lineHeight)) && Number(attrs.lineHeight) >= 1.15
      ? { lineHeight: Number(attrs.lineHeight) }
      : {}),
    ...(Number.isFinite(Number(attrs?.letterSpacing))
      ? { letterSpacing: `${Number(attrs.letterSpacing)}px` }
      : {}),
  };
}

/**
 * Shared TipTap JSON → React renderer (blog reading view).
 * @param {{ content: unknown, bookmarks?: unknown[], omitImages?: boolean, forceLight?: boolean }} props
 */
export function TipTapContent({
  content,
  bookmarks = EMPTY_BOOKMARKS,
  omitImages = false,
  forceLight = false,
}) {
  const renderRuns = (nodes, keyPrefix) =>
    renderTextRuns(nodes, keyPrefix, { forceLight });

  const renderBlockText = (nodeContent, blockIndex, keyPrefix, textOffsetBase = 0) =>
    renderBookmarkedText(nodeContent, blockIndex, bookmarks, renderRuns, textOffsetBase);

  if (content?.format === 'html' && typeof content.html === 'string') {
    return (
      <p
        className={
          forceLight
            ? 'text-gray-600 leading-relaxed text-lg'
            : 'text-gray-600 dark:text-gray-400 leading-relaxed text-lg'
        }
      >
        This post was created with a removed HTML editor and can no longer be displayed here.
      </p>
    );
  }

  if (typeof content === 'string') {
    try {
      const parsed = JSON.parse(content);
      if (parsed?.format === 'html') {
        return (
          <p
            className={
              forceLight
                ? 'text-gray-600 leading-relaxed text-lg'
                : 'text-gray-600 dark:text-gray-400 leading-relaxed text-lg'
            }
          >
            This post was created with a removed HTML editor and can no longer be displayed here.
          </p>
        );
      }
      return (
        <TipTapContent
          content={parsed}
          bookmarks={bookmarks}
          omitImages={omitImages}
          forceLight={forceLight}
        />
      );
    } catch {
      return (
        <div
          className={
            forceLight
              ? 'text-gray-700 leading-relaxed text-lg'
              : 'text-gray-700 dark:text-gray-300 leading-relaxed text-lg'
          }
        >
          {content}
        </div>
      );
    }
  }

  if (content && content.content && Array.isArray(content.content)) {
    return content.content.map((node, index) => {
      switch (node.type) {
        case 'paragraph':
          return (
            <p
              key={index}
              data-block-index={index}
              className={
                forceLight
                  ? 'mb-4 text-gray-700 leading-relaxed text-lg'
                  : 'mb-4 text-gray-700 dark:text-gray-300 leading-relaxed text-lg'
              }
              style={blockTypographyStyle(node.attrs)}
            >
              {renderBlockText(node.content, index, `p-${index}`)}
            </p>
          );

        case 'heading': {
          const HeadingTag = `h${node.attrs?.level || 1}`;
          const headingStyles = forceLight
            ? {
                1: 'text-3xl font-bold leading-snug text-gray-900 mt-6 mb-3 first:mt-0',
                2: 'text-2xl font-bold leading-snug text-gray-800 mt-5 mb-2',
                3: 'text-xl font-semibold leading-snug text-gray-800 mt-4 mb-2',
                4: 'text-lg font-semibold leading-snug text-gray-700 mt-4 mb-2',
                5: 'text-base font-semibold leading-snug text-gray-700 mt-3 mb-1',
                6: 'text-sm font-semibold leading-snug text-gray-700 mt-3 mb-1',
              }
            : {
                1: 'text-3xl font-bold leading-snug text-gray-900 dark:text-gray-50 mt-6 mb-3 first:mt-0',
                2: 'text-2xl font-bold leading-snug text-gray-800 dark:text-gray-200 mt-5 mb-2',
                3: 'text-xl font-semibold leading-snug text-gray-800 dark:text-gray-200 mt-4 mb-2',
                4: 'text-lg font-semibold leading-snug text-gray-700 dark:text-gray-300 mt-4 mb-2',
                5: 'text-base font-semibold leading-snug text-gray-700 dark:text-gray-300 mt-3 mb-1',
                6: 'text-sm font-semibold leading-snug text-gray-700 dark:text-gray-300 mt-3 mb-1',
              };

          return (
            <HeadingTag
              key={index}
              data-block-index={index}
              className={headingStyles[node.attrs?.level || 1]}
              style={blockTypographyStyle(node.attrs)}
            >
              {renderBlockText(node.content, index, `h-${index}`)}
            </HeadingTag>
          );
        }

        case 'horizontalRule':
          return (
            <hr
              key={index}
              data-block-index={index}
              className={
                forceLight
                  ? 'my-6 border-0 border-t border-gray-300'
                  : 'my-6 border-0 border-t border-gray-300 dark:border-zinc-600'
              }
            />
          );

        case 'image': {
          if (omitImages) return null;
          const safeNodeImage = getSafeImageUrl(node.attrs?.src);
          if (!safeNodeImage) return null;
          return (
            <div key={index} className="my-4 text-center">
              <img
                src={safeNodeImage}
                alt={node.attrs?.alt || 'Blog image'}
                title={node.attrs?.title}
                className="max-w-full h-auto rounded"
                style={{ maxHeight: '500px' }}
              />
              {node.attrs?.alt && (
                <p
                  className={
                    forceLight
                      ? 'text-sm text-gray-500 mt-2 italic'
                      : 'text-sm text-gray-500 dark:text-gray-400 mt-2 italic'
                  }
                >
                  {node.attrs.alt}
                </p>
              )}
            </div>
          );
        }

        case 'blockquote':
          return (
            <blockquote
              key={index}
              data-block-index={index}
              className={
                forceLight
                  ? 'border-l-4 border-gray-300 pl-4 my-4 italic text-gray-600 bg-gray-50 py-2 rounded-r'
                  : 'border-l-4 border-gray-300 dark:border-zinc-600 pl-4 my-4 italic text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-zinc-800/60 py-2 rounded-r'
              }
            >
              {node.content &&
                node.content.map((contentNode, contentIndex) => {
                  if (contentNode.type === 'text') {
                    return contentNode.text;
                  } else if (contentNode.type === 'paragraph') {
                    const textOffsetBase = getChildTextOffsetBase(node.content, contentIndex);
                    return (
                      <span key={contentIndex}>
                        {renderBlockText(
                          contentNode.content,
                          index,
                          `bq-${index}-${contentIndex}`,
                          textOffsetBase
                        )}
                      </span>
                    );
                  }
                  return null;
                })}
            </blockquote>
          );

        case 'bulletList':
          return (
            <ul
              key={index}
              data-block-index={index}
              className={
                forceLight
                  ? 'list-disc list-inside mb-4 text-gray-700 leading-relaxed'
                  : 'list-disc list-inside mb-4 text-gray-700 dark:text-gray-300 leading-relaxed'
              }
            >
              {node.content &&
                node.content.map((listItem, listIndex) => (
                  <li key={listIndex} className="mb-1">
                    {listItem.content &&
                      listItem.content.map((contentNode, contentIndex) => {
                        if (contentNode.type === 'text') {
                          return contentNode.text;
                        } else if (contentNode.type === 'paragraph') {
                          const textOffsetBase = getChildTextOffsetBase(node.content, listIndex);
                          return renderBlockText(
                            contentNode.content,
                            index,
                            `bl-${index}-${listIndex}`,
                            textOffsetBase
                          );
                        }
                        return null;
                      })}
                  </li>
                ))}
            </ul>
          );

        case 'orderedList':
          return (
            <ol
              key={index}
              data-block-index={index}
              className={
                forceLight
                  ? 'list-decimal list-inside mb-4 text-gray-700 leading-relaxed'
                  : 'list-decimal list-inside mb-4 text-gray-700 dark:text-gray-300 leading-relaxed'
              }
            >
              {node.content &&
                node.content.map((listItem, listIndex) => (
                  <li key={listIndex} className="mb-1">
                    {listItem.content &&
                      listItem.content.map((contentNode, contentIndex) => {
                        if (contentNode.type === 'text') {
                          return contentNode.text;
                        } else if (contentNode.type === 'paragraph') {
                          const textOffsetBase = getChildTextOffsetBase(node.content, listIndex);
                          return renderBlockText(
                            contentNode.content,
                            index,
                            `bl-${index}-${listIndex}`,
                            textOffsetBase
                          );
                        }
                        return null;
                      })}
                  </li>
                ))}
            </ol>
          );

        case 'taskList':
          return (
            <ul
              key={index}
              data-block-index={index}
              className={
                forceLight
                  ? 'list-none mb-4 text-gray-700 leading-relaxed space-y-2'
                  : 'list-none mb-4 text-gray-700 dark:text-gray-300 leading-relaxed space-y-2'
              }
            >
              {node.content &&
                node.content.map((taskItem, taskIndex) => (
                  <li key={taskIndex} className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={taskItem.attrs?.checked || false}
                      readOnly
                      className={
                        forceLight
                          ? 'mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500'
                          : 'mt-1 w-4 h-4 text-blue-600 dark:text-blue-400 bg-gray-100 dark:bg-zinc-800 border-gray-300 dark:border-zinc-600 rounded focus:ring-blue-500'
                      }
                    />
                    <span className="flex-1">
                      {taskItem.content &&
                        taskItem.content.map((contentNode, contentIndex) => {
                          if (contentNode.type === 'text') {
                            return contentNode.text;
                          } else if (contentNode.type === 'paragraph') {
                            const textOffsetBase = getChildTextOffsetBase(node.content, taskIndex);
                            return renderBlockText(
                              contentNode.content,
                              index,
                              `tl-${index}-${taskIndex}`,
                              textOffsetBase
                            );
                          }
                          return null;
                        })}
                    </span>
                  </li>
                ))}
            </ul>
          );

        case 'taskItem':
          return (
            <div key={index} data-block-index={index} className="flex items-start gap-3 mb-2">
              <input
                type="checkbox"
                checked={node.attrs?.checked || false}
                readOnly
                className={
                  forceLight
                    ? 'mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500'
                    : 'mt-1 w-4 h-4 text-blue-600 dark:text-blue-400 bg-gray-100 dark:bg-zinc-800 border-gray-300 dark:border-zinc-600 rounded focus:ring-blue-500'
                }
              />
              <span className="flex-1">
                {node.content &&
                  node.content.map((contentNode, contentIndex) => {
                    if (contentNode.type === 'text') {
                      return contentNode.text;
                    } else if (contentNode.type === 'paragraph') {
                      const textOffsetBase = getChildTextOffsetBase(node.content, contentIndex);
                      return renderBlockText(
                        contentNode.content,
                        index,
                        `ti-${index}-${contentIndex}`,
                        textOffsetBase
                      );
                    }
                    return null;
                  })}
              </span>
            </div>
          );

        case 'codeBlock': {
          const codeText = (node.content || [])
            .filter((textNode) => textNode.type === 'text')
            .map((textNode) => textNode.text)
            .join('');
          return (
            <div key={index} data-block-index={index}>
              <HighlightedCodeBlock code={codeText} language={node.attrs?.language} />
            </div>
          );
        }

        case 'table': {
          const rows = node.content || [];
          const firstRow = rows[0];
          const useThead =
            firstRow?.content?.length > 0 &&
            firstRow.content.every((c) => c.type === 'tableHeader');
          const bodyRows = useThead ? rows.slice(1) : rows;

          const renderRow = (row, ri, keyPrefix) => (
            <tr
              key={`${keyPrefix}-${ri}`}
              className={
                forceLight
                  ? 'border-b border-gray-200'
                  : 'border-b border-gray-200 dark:border-zinc-700'
              }
            >
              {row.content?.map((cell, ci) => {
                const CellTag = cell.type === 'tableHeader' ? 'th' : 'td';
                return (
                  <CellTag
                    key={ci}
                    colSpan={cell.attrs?.colspan ?? 1}
                    rowSpan={cell.attrs?.rowspan ?? 1}
                    className={
                      cell.type === 'tableHeader'
                        ? forceLight
                          ? 'border border-gray-300 bg-gray-100 px-3 py-2 text-left text-sm font-semibold text-gray-900'
                          : 'border border-gray-300 dark:border-zinc-600 bg-gray-100 dark:bg-zinc-700 px-3 py-2 text-left text-sm font-semibold text-gray-900 dark:text-zinc-100'
                        : forceLight
                          ? 'border border-gray-300 bg-white px-3 py-2 align-top text-sm text-gray-800'
                          : 'border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-950 px-3 py-2 align-top text-sm text-gray-800 dark:text-zinc-200'
                    }
                    style={
                      cell.attrs?.minHeight != null && cell.attrs.minHeight > 0
                        ? { minHeight: `${cell.attrs.minHeight}px` }
                        : undefined
                    }
                  >
                    {cell.content?.map((block, bi) => {
                      if (block.type === 'paragraph') {
                        const textOffsetBase = getTableCellTextOffsetBase(node, ri, ci, bi);
                        return (
                          <p
                            key={bi}
                            className="mb-1 last:mb-0 leading-relaxed text-inherit"
                          >
                            {renderBlockText(
                              block.content,
                              index,
                              `${keyPrefix}-${ri}-${ci}-${bi}`,
                              textOffsetBase
                            )}
                          </p>
                        );
                      }
                      return null;
                    })}
                  </CellTag>
                );
              })}
            </tr>
          );

          return (
            <div
              key={index}
              data-block-index={index}
              className={
                forceLight
                  ? 'my-6 w-full overflow-x-auto rounded-lg border border-gray-200 bg-white'
                  : 'my-6 w-full overflow-x-auto rounded-lg border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-950'
              }
            >
              <table className="w-full min-w-[280px] border-collapse text-left text-foreground">
                {useThead && firstRow ? (
                  <thead>{renderRow(firstRow, 0, `tbl-${index}`)}</thead>
                ) : null}
                <tbody>
                  {bodyRows.map((row, ri) =>
                    renderRow(row, useThead ? ri + 1 : ri, `tbl-${index}-b`)
                  )}
                </tbody>
              </table>
            </div>
          );
        }

        default:
          if (node.content && Array.isArray(node.content)) {
            return (
              <div
                key={index}
                data-block-index={index}
                className={
                  forceLight
                    ? 'mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded'
                    : 'mb-4 p-4 bg-yellow-50 dark:bg-yellow-950/40 border border-yellow-200 dark:border-yellow-800 rounded'
                }
              >
                <p
                  className={
                    forceLight
                      ? 'text-sm text-yellow-800 mb-2'
                      : 'text-sm text-yellow-800 dark:text-yellow-200 mb-2'
                  }
                >
                  <strong>Content Type:</strong> {node.type}
                </p>
                <div
                  className={
                    forceLight ? 'text-gray-700' : 'text-gray-700 dark:text-gray-300'
                  }
                >
                  {node.content.map((contentNode, contentIndex) => {
                    if (contentNode.type === 'text') {
                      return <span key={contentIndex}>{contentNode.text}</span>;
                    } else if (contentNode.type === 'paragraph') {
                      return (
                        <p key={contentIndex} className="mb-2">
                          {contentNode.content &&
                            contentNode.content.map((textNode, textIndex) => {
                              if (textNode.type === 'text') {
                                return textNode.text;
                              }
                              return null;
                            })}
                        </p>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            );
          }

          return null;
      }
    });
  }

  return (
    <div
      className={
        forceLight
          ? 'text-gray-700 leading-relaxed text-lg'
          : 'text-gray-700 dark:text-gray-300 leading-relaxed text-lg'
      }
    >
      <pre
        className={
          forceLight
            ? 'whitespace-pre-wrap bg-gray-100 p-4 rounded border border-gray-200'
            : 'whitespace-pre-wrap bg-gray-100 dark:bg-zinc-800 p-4 rounded border border-border'
        }
      >
        {JSON.stringify(content, null, 2)}
      </pre>
    </div>
  );
}
