"use client";

import { useMemo } from "react";
import { MainLayout } from "@/layouts/MainLayout";
import { FeedContainer } from "@/routes/feed/FeedContainer";
import { useBlogStore } from "@/libs/state/blog-store";
import { useBootstrapState } from "@/libs/state/use-bootstrap-state";
import { buildPostSummaries } from "@/libs/post-summary";
import { PageLoader } from "@/components/ui/page-loader";

type Props = {
  requestedCategorySlug?: string;
};

export const HomePageRoute = ({ requestedCategorySlug }: Props) => {
  const { home, isBootstrapLoading, errorMessage } = useBootstrapState();
  const posts = useBlogStore((state) => state.posts);

  const summaries = useMemo(() => buildPostSummaries(posts), [posts]);

  const normalizedRequestedCategorySlug = requestedCategorySlug?.trim();
  const hasCategoryFilter = Boolean(
    normalizedRequestedCategorySlug &&
      home?.categories.some((category) => category.slug === normalizedRequestedCategorySlug)
  );
  const activeCategorySlug = hasCategoryFilter ? normalizedRequestedCategorySlug : undefined;
  const filteredPosts = activeCategorySlug
    ? summaries.filter((post) =>
        post.categories.some((category) => category.slug === activeCategorySlug)
      )
    : summaries;

  if (!home && isBootstrapLoading) {
    return <PageLoader />;
  }

  if (!home) {
    return <div className="feed__empty">{errorMessage || ""}</div>;
  }

  return (
    <MainLayout
      home={home}
      rightCategories={home.categories}
      categoryFilterPath="/"
      activeCategorySlug={activeCategorySlug}
    >
      <FeedContainer posts={filteredPosts} home={home} />
    </MainLayout>
  );
};
