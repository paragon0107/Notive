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
  home?: HomeConfig;
  posts: Post[];
  postBySlug: Record<string, Post>;
  postBlocksById: Record<string, BlockNode[]>;
  isBootstrapLoading: boolean;
  isPostLoading: boolean;
  errorMessage?: string;
  ensureDatabaseMap: () => Promise<NotionDatabaseMap>;
  ensureBootstrap: () => Promise<void>;
  ensurePostDetail: (slug: string) => Promise<void>;
};

let bootstrapPromise: Promise<void> | null = null;
const postRequestPromises = new Map<string, Promise<void>>();

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
  posts: [],
  postBySlug: {},
  postBlocksById: {},
  isBootstrapLoading: false,
  isPostLoading: false,
  ensureDatabaseMap: async () => {
    const existing = get().databaseMap;
    if (existing) return existing;

    const databaseMap = await fetchBlogDatabaseMap();
    set({ databaseMap });
    return databaseMap;
  },
  ensureBootstrap: async () => {
    const { home, posts } = get();
    if (home && posts.length > 0) return;

    if (!bootstrapPromise) {
      bootstrapPromise = (async () => {
        set({ isBootstrapLoading: true, errorMessage: undefined });

        try {
          const payload = await fetchBlogBootstrap();
          const nextPosts = mergePosts(get().posts, payload.posts);

          set({
            databaseMap: payload.databaseMap,
            home: payload.home,
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

    const existingPost = get().postBySlug[normalizedSlug];
    if (existingPost && get().postBlocksById[existingPost.id]) {
      return;
    }

    if (postRequestPromises.has(normalizedSlug)) {
      return postRequestPromises.get(normalizedSlug);
    }

    const requestPromise = (async () => {
      set({ isPostLoading: true, errorMessage: undefined });

      try {
        if (!get().databaseMap) {
          await get().ensureDatabaseMap();
        }

        const payload = await fetchBlogPostDetail(normalizedSlug);
        const nextPosts = mergePosts(get().posts, payload.posts);
        const nextPostBySlug = buildPostBySlugMap(nextPosts);
        // Keep compatibility for non-canonical incoming slugs.
        nextPostBySlug[normalizedSlug] = payload.post;

        set({
          databaseMap: payload.databaseMap,
          posts: nextPosts,
          postBySlug: nextPostBySlug,
          postBlocksById: {
            ...get().postBlocksById,
            [payload.post.id]: payload.blocks,
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
