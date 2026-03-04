"use client";

import Link from "next/link";
import { MainLayout } from "@/layouts/MainLayout";
import { useBootstrapState } from "@/libs/state/use-bootstrap-state";
import { PageLoader } from "@/components/ui/page-loader";
import type { BlogBootstrapPayload } from "@/libs/types/blog-store";

type Props = {
  initialBootstrap?: BlogBootstrapPayload;
};

export const CategoryListPageRoute = ({ initialBootstrap }: Props) => {
  const { home, isBootstrapLoading, errorMessage } = useBootstrapState(initialBootstrap);
  const resolvedHome = home ?? initialBootstrap?.home;

  if (!resolvedHome && isBootstrapLoading) {
    return <PageLoader />;
  }

  if (!resolvedHome) {
    return <div className="feed__empty">{errorMessage || "카테고리를 불러오지 못했습니다."}</div>;
  }

  const categories = resolvedHome.categories;

  return (
    <MainLayout home={resolvedHome}>
      <section className="category-list">
        <h1>Categories</h1>
        {categories.length === 0 ? (
          <p className="meta">카테고리가 없습니다.</p>
        ) : (
          <ul>
            {categories.map((category) => (
              <li key={category.id}>
                <Link href={`/category/${category.slug}`}>
                  <span>{category.name}</span>
                  {category.description ? (
                    <span className="meta">{category.description}</span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </MainLayout>
  );
};
