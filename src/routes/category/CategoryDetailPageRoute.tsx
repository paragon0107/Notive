"use client";

import { useMemo } from "react";
import { MainLayout } from "@/layouts/MainLayout";
import { FeedContainer } from "@/routes/feed/FeedContainer";
import { useBlogStore } from "@/libs/state/blog-store";
import { useBootstrapState } from "@/libs/state/use-bootstrap-state";
import { filterPostsByCategorySlug } from "@/libs/posts";
import { buildPostSummaries } from "@/libs/post-summary";
import { PageLoader } from "@/components/ui/page-loader";

type Props = {
  slug: string;
};

export const CategoryDetailPageRoute = ({ slug }: Props) => {
  const { home, isBootstrapLoading, errorMessage } = useBootstrapState();
  const posts = useBlogStore((state) => state.posts);

  const category = useMemo(
    () => home?.categories.find((item) => item.slug === slug),
    [home, slug]
  );

  const summaries = useMemo(() => {
    const filtered = filterPostsByCategorySlug(posts, slug);
    return buildPostSummaries(filtered);
  }, [posts, slug]);

  if (!home && isBootstrapLoading) {
    return <PageLoader />;
  }

  if (!home) {
    return <div className="feed__empty">{errorMessage || "데이터를 불러오지 못했습니다."}</div>;
  }

  if (!category) {
    return (
      <MainLayout home={home}>
        <section className="category-detail">
          <h1>Category not found</h1>
        </section>
      </MainLayout>
    );
  }

  return (
    <MainLayout home={home} leftCategories={home.categories}>
      <section className="category-detail">
        <div className="category-detail__header">
          <h1>{category.name}</h1>
          {category.description ? <p className="meta">{category.description}</p> : null}
        </div>
        <FeedContainer posts={summaries} home={home} />
      </section>
    </MainLayout>
  );
};
