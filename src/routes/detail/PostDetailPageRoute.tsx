"use client";

import { useEffect, useMemo } from "react";
import { MainLayout } from "@/layouts/MainLayout";
import { PostDetailView } from "@/routes/detail/PostDetailView";
import { useBlogStore } from "@/libs/state/blog-store";
import { useBootstrapState } from "@/libs/state/use-bootstrap-state";
import { getRelatedPosts, getSeriesPosts } from "@/libs/posts";
import { getFallbackHomeConfig } from "@/libs/home-config";
import { PageLoader } from "@/components/ui/page-loader";
import { extractTocFromBlocks } from "@/libs/notion/blocks";
import type { BlogBootstrapPayload, BlogPostDetailPayload } from "@/libs/types/blog-store";

type Props = {
  slug: string;
  initialBootstrap?: BlogBootstrapPayload;
  initialPostDetail?: BlogPostDetailPayload;
};

export const PostDetailPageRoute = ({ slug, initialBootstrap, initialPostDetail }: Props) => {
  const { home, isBootstrapLoading, errorMessage } = useBootstrapState(initialBootstrap);
  const posts = useBlogStore((state) => state.posts);
  const postBySlug = useBlogStore((state) => state.postBySlug);
  const postBlocksById = useBlogStore((state) => state.postBlocksById);
  const isPostLoading = useBlogStore((state) => state.isPostLoading);
  const ensurePostDetail = useBlogStore((state) => state.ensurePostDetail);
  const hydratePostDetail = useBlogStore((state) => state.hydratePostDetail);

  useEffect(() => {
    if (initialPostDetail) {
      hydratePostDetail(initialPostDetail, slug);
    }
  }, [hydratePostDetail, initialPostDetail, slug]);

  useEffect(() => {
    void ensurePostDetail(slug);
  }, [ensurePostDetail, slug]);

  const resolvedPost = postBySlug[slug] ?? initialPostDetail?.post;
  const fallbackBlocks =
    resolvedPost && initialPostDetail?.post.id === resolvedPost.id
      ? initialPostDetail.blocks
      : [];
  const blocks = resolvedPost ? postBlocksById[resolvedPost.id] ?? fallbackBlocks : [];
  const resolvedPosts =
    posts.length > 0
      ? posts
      : (initialBootstrap?.posts ?? initialPostDetail?.posts ?? posts);
  const tocItems = useMemo(() => extractTocFromBlocks(blocks), [blocks]);

  const categoryRelatedPosts = useMemo(() => {
    if (!resolvedPost) return [];

    return getRelatedPosts(
      resolvedPosts,
      resolvedPost.categories.map((category) => category.id),
      resolvedPost.id
    );
  }, [resolvedPost, resolvedPosts]);

  const seriesPosts = useMemo(() => {
    const seriesIds = resolvedPost?.series?.map((series) => series.id) ?? [];
    if (seriesIds.length === 0) return [];

    return getSeriesPosts(resolvedPosts, seriesIds, resolvedPost.id, 6);
  }, [resolvedPost, resolvedPosts]);

  const relatedPosts = useMemo(() => {
    if (seriesPosts.length > 0) return seriesPosts;
    return categoryRelatedPosts;
  }, [seriesPosts, categoryRelatedPosts]);

  const isContentLoading = Boolean(isPostLoading && blocks.length === 0);
  const resolvedHome = home ?? initialBootstrap?.home ?? getFallbackHomeConfig();

  if (!resolvedPost && (isBootstrapLoading || isPostLoading || !errorMessage)) {
    return <PageLoader />;
  }

  if (!resolvedPost) {
    return (
      <MainLayout home={resolvedHome}>
        <section className="post-detail">
          <h1>Post not found</h1>
          <p className="meta">{errorMessage || "요청한 글을 찾을 수 없습니다."}</p>
        </section>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      home={resolvedHome}
      tocItems={tocItems}
      leftCategories={resolvedHome.categories}
      categoryFilterPath="/"
      rightPanelMode="toc"
    >
      <PostDetailView
        post={resolvedPost}
        blocks={blocks}
        relatedPosts={relatedPosts}
        isContentLoading={isContentLoading}
      />
    </MainLayout>
  );
};
