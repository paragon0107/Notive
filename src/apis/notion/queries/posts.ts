import type {
  BlockObjectResponse,
  PageObjectResponse,
  QueryDatabaseParameters,
} from "@notionhq/client/build/src/api-endpoints";
import type { BlockNode } from "@/libs/notion/blocks";
import type { Post } from "@/libs/types/blog";
import { getPostsDatabaseId } from "@/apis/notion/queries/databases";
import { listBlockChildren, queryAllDatabasePages } from "@/apis/notion/queries/shared/query";
import { mapCategoryOption } from "@/apis/notion/queries/shared/mappers";
import { findSeriesByRelationIds } from "@/apis/notion/queries/series";
import {
  getDateProperty,
  getFilesProperty,
  getMultiSelectOptions,
  getPeoplePropertyNames,
  getRelationPropertyIds,
  getRichTextProperty,
  getTitleProperty,
} from "@/libs/notion/properties";
import { slugify } from "@/libs/notion/slugify";

const normalizeSlugValue = (value: string) => slugify(value.trim());

const buildPostSlugKey = (pageId: string) =>
  pageId.replace(/-/g, "").toLowerCase().slice(-6);

const tryExtractSlugKey = (slug: string) => {
  const normalizedSlug = normalizeSlugValue(slug);
  const segments = normalizedSlug.split("-").filter(Boolean);
  if (segments.length === 0) return undefined;

  const suffix = segments[segments.length - 1];
  return /^[a-z0-9]{6}$/.test(suffix) ? suffix : undefined;
};

const buildPostSlug = (title: string, pageId: string) => {
  const titleSlug = normalizeSlugValue(title);
  const slugKey = buildPostSlugKey(pageId);

  if (!titleSlug) return `post-${slugKey}`;
  return `${titleSlug}-${slugKey}`;
};

export const findPostBySlugFromList = (posts: Post[], slug: string): Post | undefined => {
  const normalizedSlug = normalizeSlugValue(slug);
  if (!normalizedSlug) return undefined;

  const slugKey = tryExtractSlugKey(normalizedSlug);
  if (slugKey) {
    const postBySlugKey = posts.find((post) => buildPostSlugKey(post.id) === slugKey);
    if (postBySlugKey) return postBySlugKey;
  }

  return posts.find((post) => post.slug === normalizedSlug);
};

const mapPost = async (page: PageObjectResponse): Promise<Post> => {
  const title = getTitleProperty(page);
  const series = await findSeriesByRelationIds(getRelationPropertyIds(page, "Series"));
  const rawSlug = getRichTextProperty(page, "Slug");
  const slug = rawSlug ? normalizeSlugValue(rawSlug) : buildPostSlug(title, page.id);

  return {
    id: page.id,
    title,
    slug,
    date: getDateProperty(page, "Date"),
    summary: getRichTextProperty(page, "Summary"),
    thumbnailUrl: getFilesProperty(page, "Thumbnail"),
    categories: getMultiSelectOptions(page, "Category").map((option, index) =>
      mapCategoryOption(
        {
          id: option.id,
          name: option.name,
          color: option.color,
        },
        index,
        false
      )
    ),
    series: series.length > 0 ? series : undefined,
    authorNames: getPeoplePropertyNames(page, "Author"),
  };
};

const queryPosts = async (filter?: QueryDatabaseParameters["filter"]) => {
  const postsDatabaseId = await getPostsDatabaseId();
  return queryAllDatabasePages(postsDatabaseId, {
    filter,
    page_size: 100,
    sorts: [{ property: "Date", direction: "descending" }],
  });
};

export const fetchPosts = async (): Promise<Post[]> => {
  const pages = await queryPosts({
    property: "Published",
    checkbox: { equals: true },
  });

  return Promise.all(pages.map(mapPost));
};

export const fetchPostBySlug = async (slug: string): Promise<Post | undefined> => {
  const normalizedSlug = normalizeSlugValue(slug);
  if (!normalizedSlug) return undefined;

  const postsDatabaseId = await getPostsDatabaseId();
  const pages = await queryAllDatabasePages(postsDatabaseId, {
    page_size: 1,
    filter: {
      and: [
        {
          property: "Published",
          checkbox: { equals: true },
        },
        {
          property: "Slug",
          rich_text: { equals: normalizedSlug },
        },
      ],
    },
  });

  const page = pages[0];
  if (!page) return undefined;

  return mapPost(page);
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
