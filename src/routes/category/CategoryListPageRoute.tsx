"use client";

import Link from "next/link";
import { MainLayout } from "@/layouts/MainLayout";
import { useBootstrapState } from "@/libs/state/use-bootstrap-state";
import { PageLoader } from "@/components/ui/page-loader";

export const CategoryListPageRoute = () => {
  const { home, isBootstrapLoading, errorMessage } = useBootstrapState();

  if (!home && isBootstrapLoading) {
    return <PageLoader />;
  }

  if (!home) {
    return <div className="feed__empty">{errorMessage || "카테고리를 불러오지 못했습니다."}</div>;
  }

  const categories = home.categories;

  return (
    <MainLayout home={home}>
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
