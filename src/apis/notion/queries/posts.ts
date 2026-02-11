import type {
  BlockObjectResponse,
  PageObjectResponse,
  QueryDatabaseParameters,
} from "@notionhq/client/build/src/api-endpoints";
import type { BlockNode } from "@/libs/notion/blocks";
import type { Post } from "@/libs/types/blog";
import { getNotionClient } from "@/apis/notion/client";
import { getDatabaseMap } from "@/apis/notion/queries/database-map";
import {
  assertDatabaseSchema,
  fetchDatabase,
  POSTS_SCHEMA,
} from "@/apis/notion/queries/schema";
import {
  getDateProperty,
  getFilesProperty,
  getMultiSelectOptions,
  getPeoplePropertyNames,
  getRichTextProperty,
  getSelectOption,
  getSlugProperty,
  getTitleProperty,
} from "@/libs/notion/properties";
import { slugify } from "@/libs/notion/slugify";

const isFullPage = (page: unknown): page is PageObjectResponse =>
  Boolean(page && typeof page === "object" && "properties" in page);

const mapCategories = (page: PageObjectResponse) =>
  getMultiSelectOptions(page, "Category").map((option) => ({
    id: `category-${slugify(option.name)}`,
    name: option.name,
    slug: slugify(option.name),
    description: undefined,
    order: undefined,
    isPinned: false,
    color: option.color,
  }));

const mapSeries = (page: PageObjectResponse) => {
  const option = getSelectOption(page, "Series");
  if (!option) return undefined;
  return {
    id: `series-${slugify(option.name)}`,
    name: option.name,
    slug: slugify(option.name),
    description: undefined,
    order: undefined,
    postIds: [],
  };
};

const mapPost = (page: PageObjectResponse): Post => {
  const title = getTitleProperty(page);
  const slug = getSlugProperty(page) ?? slugify(title);

  return {
    id: page.id,
    title,
    slug,
    date: getDateProperty(page, "Date"),
    summary: getRichTextProperty(page, "Summary"),
    thumbnailUrl: getFilesProperty(page, "Thumbnail"),
    categories: mapCategories(page),
    series: mapSeries(page),
    authorNames: getPeoplePropertyNames(page, "Author"),
  };
};

const queryAllPages = async (
  databaseId: string,
  filter?: QueryDatabaseParameters["filter"]
) => {
  const notion = getNotionClient();
  const results: PageObjectResponse[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter,
      page_size: 100,
      start_cursor: cursor,
      sorts: [{ property: "Date", direction: "descending" }],
    });

    response.results.forEach((page) => {
      if (isFullPage(page)) results.push(page);
    });

    cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
  } while (cursor);

  return results;
};

let postsDatabasePromise: Promise<string> | null = null;

const ensurePostsDatabase = async () => {
  if (!postsDatabasePromise) {
    postsDatabasePromise = (async () => {
      const { postsId } = await getDatabaseMap();
      const database = await fetchDatabase(postsId);
      assertDatabaseSchema(database, POSTS_SCHEMA);
      return postsId;
    })();
  }

  return postsDatabasePromise;
};

export const fetchPosts = async (): Promise<Post[]> => {
  const postsId = await ensurePostsDatabase();
  const pages = await queryAllPages(postsId, {
    property: "Published",
    checkbox: { equals: true },
  });

  return pages.map(mapPost);
};

export const fetchPostBySlug = async (slug: string): Promise<Post | undefined> => {
  const postsId = await ensurePostsDatabase();
  const notion = getNotionClient();
  const response = await notion.databases.query({
    database_id: postsId,
    filter: {
      property: "Slug",
      rich_text: { equals: slug },
    },
    page_size: 1,
  });

  const page = response.results.find(isFullPage);
  return page ? mapPost(page) : undefined;
};

const listBlockChildren = async (blockId: string) => {
  const notion = getNotionClient();
  const blocks: BlockObjectResponse[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.blocks.children.list({
      block_id: blockId,
      page_size: 100,
      start_cursor: cursor,
    });

    response.results.forEach((block) => {
      if ("type" in block) blocks.push(block as BlockObjectResponse);
    });

    cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
  } while (cursor);

  return blocks;
};

const hydrateChildren = async (block: BlockObjectResponse): Promise<BlockNode> => {
  if (!block.has_children) return block;

  const children = await listBlockChildren(block.id);
  const nodes = await Promise.all(children.map(hydrateChildren));

  return { ...block, children: nodes };
};

export const fetchPostBlocks = async (postId: string): Promise<BlockNode[]> => {
  const blocks = await listBlockChildren(postId);
  return Promise.all(blocks.map(hydrateChildren));
};
