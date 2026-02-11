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

type Props = {
  slug: string;
};

export const PostDetailPageRoute = ({ slug }: Props) => {
  const { home, isBootstrapLoading, errorMessage } = useBootstrapState();
  const posts = useBlogStore((state) => state.posts);
  const postBySlug = useBlogStore((state) => state.postBySlug);
  const postBlocksById = useBlogStore((state) => state.postBlocksById);
  const isPostLoading = useBlogStore((state) => state.isPostLoading);
  const ensurePostDetail = useBlogStore((state) => state.ensurePostDetail);

  useEffect(() => {
    void ensurePostDetail(slug);
  }, [ensurePostDetail, slug]);

  const post = postBySlug[slug];
  const blocks = post ? postBlocksById[post.id] ?? [] : [];
  const tocItems = useMemo(() => extractTocFromBlocks(blocks), [blocks]);

  const categoryRelatedPosts = useMemo(() => {
    if (!post) return [];

    return getRelatedPosts(
      posts,
      post.categories.map((category) => category.id),
      post.id
    );
  }, [post, posts]);

  const seriesPosts = useMemo(() => {
    const seriesIds = post?.series?.map((series) => series.id) ?? [];
    if (seriesIds.length === 0) return [];

    return getSeriesPosts(posts, seriesIds, post.id, 6);
  }, [post, posts]);

  const relatedPosts = useMemo(() => {
    if (seriesPosts.length > 0) return seriesPosts;
    return categoryRelatedPosts;
  }, [seriesPosts, categoryRelatedPosts]);

  const isContentLoading = Boolean(isPostLoading && blocks.length === 0);
  const resolvedHome = home ?? getFallbackHomeConfig();

  if (!post && (isBootstrapLoading || isPostLoading || !errorMessage)) {
    return <PageLoader />;
  }

  if (!post) {
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
        post={post}
        blocks={blocks}
        relatedPosts={relatedPosts}
        isContentLoading={isContentLoading}
      />
    </MainLayout>
  );
};
