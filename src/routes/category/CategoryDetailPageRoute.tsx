"use client";

import { useMemo } from "react";
import { MainLayout } from "@/layouts/MainLayout";
import { FeedContainer } from "@/routes/feed/FeedContainer";
import { useBlogStore } from "@/libs/state/blog-store";
import { useBootstrapState } from "@/libs/state/use-bootstrap-state";
import { filterPostsByCategorySlug } from "@/libs/posts";
import { buildPostSummaries } from "@/libs/post-summary";
import { PageLoader } from "@/components/ui/page-loader";
import type { BlogBootstrapPayload } from "@/libs/types/blog-store";

type Props = {
  slug: string;
  initialBootstrap?: BlogBootstrapPayload;
};

export const CategoryDetailPageRoute = ({ slug, initialBootstrap }: Props) => {
  const { home, isBootstrapLoading, errorMessage } = useBootstrapState(initialBootstrap);
  const posts = useBlogStore((state) => state.posts);
  const resolvedHome = home ?? initialBootstrap?.home;
  const resolvedPosts = posts.length > 0 ? posts : (initialBootstrap?.posts ?? posts);

  const category = useMemo(
    () => resolvedHome?.categories.find((item) => item.slug === slug),
    [resolvedHome, slug]
  );

  const summaries = useMemo(() => {
    const filtered = filterPostsByCategorySlug(resolvedPosts, slug);
    return buildPostSummaries(filtered);
  }, [resolvedPosts, slug]);

  if (!resolvedHome && isBootstrapLoading) {
    return <PageLoader />;
  }

  if (!resolvedHome) {
    return <div className="feed__empty">{errorMessage || "데이터를 불러오지 못했습니다."}</div>;
  }

  if (!category) {
    return (
      <MainLayout home={resolvedHome}>
        <section className="category-detail">
          <h1>Category not found</h1>
        </section>
      </MainLayout>
    );
  }

  return (
    <MainLayout home={resolvedHome} leftCategories={resolvedHome.categories}>
      <section className="category-detail">
        <div className="category-detail__header">
          <h1>{category.name}</h1>
          {category.description ? <p className="meta">{category.description}</p> : null}
        </div>
        <FeedContainer posts={summaries} home={resolvedHome} />
      </section>
    </MainLayout>
  );
};
