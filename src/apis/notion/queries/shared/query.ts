import type {
  BlockObjectResponse,
  PageObjectResponse,
  QueryDatabaseParameters,
} from "@notionhq/client/build/src/api-endpoints";
import { getNotionClient } from "@/apis/notion/client";

const isFullPage = (value: unknown): value is PageObjectResponse =>
  Boolean(value && typeof value === "object" && "properties" in value);

export const queryAllDatabasePages = async (
  databaseId: string,
  options: Omit<QueryDatabaseParameters, "database_id" | "start_cursor"> = {}
): Promise<PageObjectResponse[]> => {
  const notion = getNotionClient();
  const pages: PageObjectResponse[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.databases.query({
      database_id: databaseId,
      ...options,
      start_cursor: cursor,
    });

    response.results.forEach((result) => {
      if (isFullPage(result)) pages.push(result);
    });

    cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
  } while (cursor);

  return pages;
};

export const queryFirstDatabasePage = async (
  databaseId: string,
  options: Omit<QueryDatabaseParameters, "database_id" | "start_cursor" | "page_size"> = {}
): Promise<PageObjectResponse | undefined> => {
  const pages = await queryAllDatabasePages(databaseId, {
    ...options,
    page_size: 1,
  });

  return pages[0];
};

export const listBlockChildren = async (
  blockId: string
): Promise<BlockObjectResponse[]> => {
  const notion = getNotionClient();
  const blocks: BlockObjectResponse[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.blocks.children.list({
      block_id: blockId,
      page_size: 100,
      start_cursor: cursor,
    });

    response.results.forEach((result) => {
      if ("type" in result) {
        blocks.push(result as BlockObjectResponse);
      }
    });

    cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
  } while (cursor);

  return blocks;
};
