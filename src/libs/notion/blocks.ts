import type {
  BlockObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";
import type { TocItem } from "@/libs/types/blog";
import { slugify } from "@/libs/notion/slugify";

export type BlockNode = BlockObjectResponse & {
  children?: BlockNode[];
};

const richTextToPlain = (richText: RichTextItemResponse[]) =>
  richText.map((item) => item.plain_text).join("");

const normalizeBlockId = (blockId: string) => blockId.replace(/-/g, "");

export const extractPlainText = (blocks: BlockNode[]) => {
  const texts: string[] = [];

  const visit = (block: BlockNode) => {
    switch (block.type) {
      case "paragraph":
        texts.push(richTextToPlain(block.paragraph.rich_text));
        break;
      case "heading_1":
        texts.push(richTextToPlain(block.heading_1.rich_text));
        break;
      case "heading_2":
        texts.push(richTextToPlain(block.heading_2.rich_text));
        break;
      case "heading_3":
        texts.push(richTextToPlain(block.heading_3.rich_text));
        break;
      case "bulleted_list_item":
        texts.push(richTextToPlain(block.bulleted_list_item.rich_text));
        break;
      case "numbered_list_item":
        texts.push(richTextToPlain(block.numbered_list_item.rich_text));
        break;
      case "quote":
        texts.push(richTextToPlain(block.quote.rich_text));
        break;
      case "callout":
        texts.push(richTextToPlain(block.callout.rich_text));
        break;
      case "code":
        texts.push(richTextToPlain(block.code.rich_text));
        break;
      case "table_row":
        texts.push(
          block.table_row.cells.map((cell) => richTextToPlain(cell)).join(" ")
        );
        break;
      default:
        break;
    }

    block.children?.forEach(visit);
  };

  blocks.forEach(visit);

  return texts.join(" ").trim();
};

export const getHeadingId = (
  richText: RichTextItemResponse[],
  blockId?: string
) => {
  const baseSlug = slugify(richTextToPlain(richText));
  if (!blockId) return baseSlug;

  const suffix = normalizeBlockId(blockId).slice(-8);
  return baseSlug ? `${baseSlug}-${suffix}` : `heading-${suffix}`;
};

export const extractTocFromBlocks = (blocks: BlockNode[]): TocItem[] => {
  const tocItems: TocItem[] = [];

  const walk = (items: BlockNode[]) => {
    items.forEach((block) => {
      if (block.type === "heading_1") {
        tocItems.push({
          id: getHeadingId(block.heading_1.rich_text, block.id),
          text: richTextToPlain(block.heading_1.rich_text),
          level: 2,
        });
      }

      if (block.type === "heading_2") {
        tocItems.push({
          id: getHeadingId(block.heading_2.rich_text, block.id),
          text: richTextToPlain(block.heading_2.rich_text),
          level: 3,
        });
      }

      if (block.type === "heading_3") {
        tocItems.push({
          id: getHeadingId(block.heading_3.rich_text, block.id),
          text: richTextToPlain(block.heading_3.rich_text),
          level: 4,
        });
      }

      if (block.children && block.children.length > 0) {
        walk(block.children);
      }
    });
  };

  walk(blocks);
  return tocItems;
};
