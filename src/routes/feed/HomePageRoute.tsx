"use client";

import { useMemo } from "react";
import { MainLayout } from "@/layouts/MainLayout";
import { FeedContainer } from "@/routes/feed/FeedContainer";
import { useBlogStore } from "@/libs/state/blog-store";
import { useBootstrapState } from "@/libs/state/use-bootstrap-state";
import { buildPostSummaries } from "@/libs/post-summary";
import { PageLoader } from "@/components/ui/page-loader";
import type { BlogBootstrapPayload } from "@/libs/types/blog-store";

type Props = {
  requestedCategorySlug?: string;
  initialBootstrap?: BlogBootstrapPayload;
};

export const HomePageRoute = ({ requestedCategorySlug, initialBootstrap }: Props) => {
  const { home, isBootstrapLoading, errorMessage } = useBootstrapState(initialBootstrap);
  const posts = useBlogStore((state) => state.posts);
  const resolvedHome = home ?? initialBootstrap?.home;
  const resolvedPosts = posts.length > 0 ? posts : (initialBootstrap?.posts ?? posts);

  const summaries = useMemo(() => buildPostSummaries(resolvedPosts), [resolvedPosts]);

  const normalizedRequestedCategorySlug = requestedCategorySlug?.trim();
  const hasCategoryFilter = Boolean(
    normalizedRequestedCategorySlug &&
      resolvedHome?.categories.some((category) => category.slug === normalizedRequestedCategorySlug)
  );
  const activeCategorySlug = hasCategoryFilter ? normalizedRequestedCategorySlug : undefined;
  const filteredPosts = activeCategorySlug
    ? summaries.filter((post) =>
        post.categories.some((category) => category.slug === activeCategorySlug)
      )
    : summaries;

  if (!resolvedHome && isBootstrapLoading) {
    return <PageLoader />;
  }

  if (!resolvedHome) {
    return <div className="feed__empty">{errorMessage || ""}</div>;
  }

  return (
    <MainLayout
      home={resolvedHome}
      leftCategories={resolvedHome.categories}
      categoryFilterPath="/"
      activeCategorySlug={activeCategorySlug}
    >
      <FeedContainer posts={filteredPosts} home={resolvedHome} />
    </MainLayout>
  );
};
