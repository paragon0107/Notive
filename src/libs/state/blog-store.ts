import { create } from "zustand";
import type { BlockNode } from "@/libs/notion/blocks";
import type { HomeConfig, Post } from "@/libs/types/blog";
import type { NotionDatabaseMap } from "@/libs/types/blog-store";
import {
  fetchBlogBootstrap,
  fetchBlogDatabaseMap,
  fetchBlogPostDetail,
} from "@/apis/blog/client";

type BlogStoreState = {
  databaseMap?: NotionDatabaseMap;
  databaseMapFetchedAt: number;
  home?: HomeConfig;
  bootstrapFetchedAt: number;
  posts: Post[];
  postBySlug: Record<string, Post>;
  postBlocksById: Record<string, BlockNode[]>;
  postFetchedAtBySlug: Record<string, number>;
  isBootstrapLoading: boolean;
  isPostLoading: boolean;
  errorMessage?: string;
  ensureDatabaseMap: () => Promise<NotionDatabaseMap>;
  ensureBootstrap: () => Promise<void>;
  ensurePostDetail: (slug: string) => Promise<void>;
};

let bootstrapPromise: Promise<void> | null = null;
const postRequestPromises = new Map<string, Promise<void>>();
const CLIENT_BOOTSTRAP_CACHE_TTL_MS = 30 * 1000;
const CLIENT_POST_DETAIL_CACHE_TTL_MS = 30 * 1000;

const isWithinTtl = (fetchedAt: number | undefined, ttlMs: number) =>
  Boolean(fetchedAt && Date.now() - fetchedAt < ttlMs);

const mergePosts = (existing: Post[], incoming: Post[]): Post[] => {
  const byId = new Map(existing.map((post) => [post.id, post]));
  incoming.forEach((post) => {
    byId.set(post.id, post);
  });

  return [...byId.values()].sort((a, b) => {
    const dateA = a.date ?? "";
    const dateB = b.date ?? "";
    return dateB.localeCompare(dateA);
  });
};

const buildPostBySlugMap = (posts: Post[]) =>
  posts.reduce<Record<string, Post>>((acc, post) => {
    acc[post.slug] = post;
    return acc;
  }, {});

export const useBlogStore = create<BlogStoreState>((set, get) => ({
  databaseMapFetchedAt: 0,
  bootstrapFetchedAt: 0,
  posts: [],
  postBySlug: {},
  postBlocksById: {},
  postFetchedAtBySlug: {},
  isBootstrapLoading: false,
  isPostLoading: false,
  ensureDatabaseMap: async () => {
    const { databaseMap, databaseMapFetchedAt } = get();
    if (databaseMap && isWithinTtl(databaseMapFetchedAt, CLIENT_BOOTSTRAP_CACHE_TTL_MS)) {
      return databaseMap;
    }

    const fetchedDatabaseMap = await fetchBlogDatabaseMap();
    set({ databaseMap: fetchedDatabaseMap, databaseMapFetchedAt: Date.now() });
    return fetchedDatabaseMap;
  },
  ensureBootstrap: async () => {
    const { home, bootstrapFetchedAt } = get();
    if (home && isWithinTtl(bootstrapFetchedAt, CLIENT_BOOTSTRAP_CACHE_TTL_MS)) return;

    if (!bootstrapPromise) {
      bootstrapPromise = (async () => {
        set({ isBootstrapLoading: true, errorMessage: undefined });

        try {
          const payload = await fetchBlogBootstrap();
          const nextPosts = mergePosts(get().posts, payload.posts);
          const fetchedAt = Date.now();

          set({
            databaseMap: payload.databaseMap,
            databaseMapFetchedAt: fetchedAt,
            home: payload.home,
            bootstrapFetchedAt: fetchedAt,
            posts: nextPosts,
            postBySlug: buildPostBySlugMap(nextPosts),
            isBootstrapLoading: false,
          });
        } catch (error) {
          set({
            isBootstrapLoading: false,
            errorMessage:
              error instanceof Error ? error.message : "Failed to load bootstrap data.",
          });
          throw error;
        } finally {
          bootstrapPromise = null;
        }
      })();
    }

    return bootstrapPromise;
  },
  ensurePostDetail: async (slug: string) => {
    const normalizedSlug = slug.trim();
    if (!normalizedSlug) return;

    const {
      postBySlug,
      postBlocksById,
      postFetchedAtBySlug,
    } = get();
    const existingPost = postBySlug[normalizedSlug];
    const existingFetchedAt =
      postFetchedAtBySlug[normalizedSlug] ??
      (existingPost ? postFetchedAtBySlug[existingPost.slug] : undefined);
    if (
      existingPost &&
      postBlocksById[existingPost.id] &&
      isWithinTtl(existingFetchedAt, CLIENT_POST_DETAIL_CACHE_TTL_MS)
    ) {
      return;
    }

    if (postRequestPromises.has(normalizedSlug)) {
      return postRequestPromises.get(normalizedSlug);
    }

    const requestPromise = (async () => {
      set({ isPostLoading: true, errorMessage: undefined });

      try {
        await get().ensureDatabaseMap();

        const payload = await fetchBlogPostDetail(normalizedSlug);
        const nextPosts = mergePosts(get().posts, payload.posts);
        const nextPostBySlug = buildPostBySlugMap(nextPosts);
        const fetchedAt = Date.now();
        // Keep compatibility for non-canonical incoming slugs.
        nextPostBySlug[normalizedSlug] = payload.post;

        set({
          databaseMap: payload.databaseMap,
          databaseMapFetchedAt: fetchedAt,
          posts: nextPosts,
          postBySlug: nextPostBySlug,
          postBlocksById: {
            ...get().postBlocksById,
            [payload.post.id]: payload.blocks,
          },
          postFetchedAtBySlug: {
            ...get().postFetchedAtBySlug,
            [payload.post.slug]: fetchedAt,
            [normalizedSlug]: fetchedAt,
          },
          isPostLoading: false,
        });
      } catch (error) {
        set({
          isPostLoading: false,
          errorMessage: error instanceof Error ? error.message : "Failed to load post detail.",
        });
        throw error;
      } finally {
        postRequestPromises.delete(normalizedSlug);
      }
    })();

    postRequestPromises.set(normalizedSlug, requestPromise);
    return requestPromise;
  },
}));
