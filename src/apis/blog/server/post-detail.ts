import { unstable_cache } from "next/cache";
import {
  fetchPostBlocks,
  fetchPostBySlug,
  fetchPosts,
  findPostBySlugFromList,
} from "@/apis/notion/queries/posts";
import { getDatabaseMap } from "@/apis/notion/queries/database-map";
import { slugify } from "@/libs/notion/slugify";
import type { BlogPostDetailPayload } from "@/libs/types/blog-store";

export const POST_DETAIL_REVALIDATE_SECONDS = 300;

export class PostNotFoundError extends Error {
  constructor() {
    super("Post not found.");
  }
}

const hasSlugKey = (slug: string) => /-[a-z0-9]{6}$/.test(slug);

const resolvePostBySlug = async (slug: string) => {
  const postBySlug = await fetchPostBySlug(slug);
  if (postBySlug) return postBySlug;
  if (!hasSlugKey(slug)) return undefined;

  const posts = await fetchPosts();
  return findPostBySlugFromList(posts, slug);
};

const loadPostDetailPayload = async (slug: string): Promise<BlogPostDetailPayload> => {
  const normalizedSlug = slugify(slug.trim());
  if (!normalizedSlug) throw new PostNotFoundError();

  const [databaseMap, post] = await Promise.all([
    getDatabaseMap(),
    resolvePostBySlug(normalizedSlug),
  ]);

  if (!post) throw new PostNotFoundError();

  const blocks = await fetchPostBlocks(post.id);

  return {
    databaseMap,
    posts: [post],
    post,
    blocks,
  };
};

const getCachedPostDetailPayload = unstable_cache(
  loadPostDetailPayload,
  ["blog:post-detail:v2"],
  {
    revalidate: POST_DETAIL_REVALIDATE_SECONDS,
    tags: ["blog-post-detail"],
  }
);

export const getBlogPostDetailPayload = async (slug: string): Promise<BlogPostDetailPayload> => {
  const normalizedSlug = slugify(slug.trim());
  if (!normalizedSlug) throw new PostNotFoundError();
  return getCachedPostDetailPayload(normalizedSlug);
};
