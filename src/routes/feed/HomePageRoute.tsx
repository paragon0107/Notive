"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { MainLayout } from "@/layouts/MainLayout";
import { FeedContainer } from "@/routes/feed/FeedContainer";
import { useBlogStore } from "@/libs/state/blog-store";
import { buildPostSummaries } from "@/libs/post-summary";
import { PageLoader } from "@/components/ui/page-loader";

export const HomePageRoute = () => {
  const searchParams = useSearchParams();
  const home = useBlogStore((state) => state.home);
  const posts = useBlogStore((state) => state.posts);
  const isBootstrapLoading = useBlogStore((state) => state.isBootstrapLoading);
  const errorMessage = useBlogStore((state) => state.errorMessage);
  const ensureBootstrap = useBlogStore((state) => state.ensureBootstrap);

  useEffect(() => {
    void ensureBootstrap();
  }, [ensureBootstrap]);

  const summaries = useMemo(() => buildPostSummaries(posts), [posts]);

  const requestedCategorySlug = searchParams.get("category")?.trim();
  const hasCategoryFilter = Boolean(
    requestedCategorySlug &&
      home?.categories.some((category) => category.slug === requestedCategorySlug)
  );
  const activeCategorySlug = hasCategoryFilter ? requestedCategorySlug : undefined;
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
