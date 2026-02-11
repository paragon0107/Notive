import type { ReactNode } from "react";
import type { BlockNode } from "@/libs/notion/blocks";
import { getHeadingId } from "@/libs/notion/blocks";

const text = (richText: { plain_text: string }[]) =>
  richText.map((item) => item.plain_text).join("");

type ListKind = "bulleted_list_item" | "numbered_list_item";

type ListBuffer = { kind: ListKind; items: ReactNode[] } | null;

const getImageUrl = (block: BlockNode) => {
  if (block.type !== "image") return undefined;
  const file = block.image;
  if (file.type === "external") return file.external.url;
  return file.file.url;
};

const renderTable = (block: BlockNode) => {
  if (block.type !== "table") return null;
  const rows = block.children ?? [];

  return (
    <table key={block.id}>
      <tbody>
        {rows.map((row) => {
          if (row.type !== "table_row") return null;
          return (
            <tr key={row.id}>
              {row.table_row.cells.map((cell, index) => (
                <td key={`${row.id}-${index}`}>{text(cell)}</td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export const renderBlocks = (blocks: BlockNode[]) => {
  const elements: ReactNode[] = [];
  let listBuffer: ListBuffer = null;

  const flushList = () => {
    if (!listBuffer) return;
    const Tag = listBuffer.kind === "bulleted_list_item" ? "ul" : "ol";
    elements.push(
      <Tag key={`list-${elements.length}`}>{listBuffer.items}</Tag>
    );
    listBuffer = null;
  };

  blocks.forEach((block) => {
    switch (block.type) {
      case "paragraph":
        flushList();
        elements.push(<p key={block.id}>{text(block.paragraph.rich_text)}</p>);
        break;
      case "heading_1":
        flushList();
        elements.push(
          <h2 key={block.id} id={getHeadingId(block.heading_1.rich_text)}>
            {text(block.heading_1.rich_text)}
          </h2>
        );
        break;
      case "heading_2":
        flushList();
        elements.push(
          <h3 key={block.id} id={getHeadingId(block.heading_2.rich_text)}>
            {text(block.heading_2.rich_text)}
          </h3>
        );
        break;
      case "heading_3":
        flushList();
        elements.push(
          <h4 key={block.id} id={getHeadingId(block.heading_3.rich_text)}>
            {text(block.heading_3.rich_text)}
          </h4>
        );
        break;
      case "bulleted_list_item":
      case "numbered_list_item": {
        const kind = block.type;
        if (!listBuffer || listBuffer.kind !== kind) {
          flushList();
          listBuffer = { kind, items: [] };
        }
        const richText =
          kind === "bulleted_list_item"
            ? block.bulleted_list_item.rich_text
            : block.numbered_list_item.rich_text;
        listBuffer.items.push(<li key={block.id}>{text(richText)}</li>);
        break;
      }
      case "quote":
        flushList();
        elements.push(
          <blockquote key={block.id}>{text(block.quote.rich_text)}</blockquote>
        );
        break;
      case "callout":
        flushList();
        elements.push(
          <aside key={block.id} className="callout">
            {block.callout.icon?.type === "emoji" ? (
              <span className="callout-icon">{block.callout.icon.emoji}</span>
            ) : null}
            <p>{text(block.callout.rich_text)}</p>
          </aside>
        );
        break;
      case "code":
        flushList();
        elements.push(
          <pre key={block.id} className="code-block">
            <div className="code-block__bar">
              <span />
              <span />
              <span />
            </div>
            <code>{text(block.code.rich_text)}</code>
          </pre>
        );
        break;
      case "image": {
        flushList();
        const url = getImageUrl(block);
        if (!url) break;
        elements.push(
          <figure key={block.id}>
            <img src={url} alt="" loading="lazy" />
          </figure>
        );
        break;
      }
      case "embed":
        flushList();
        elements.push(
          <div key={block.id} className="embed">
            <iframe
              src={block.embed.url}
              loading="lazy"
              title="Embedded content"
              allowFullScreen
            />
          </div>
        );
        break;
      case "equation":
        flushList();
        elements.push(
          <div key={block.id} className="equation">
            {block.equation.expression}
          </div>
        );
        break;
      case "table":
        flushList();
        elements.push(renderTable(block));
        break;
      default:
        flushList();
        break;
    }
  });

  flushList();

  return elements.filter(Boolean);
};
