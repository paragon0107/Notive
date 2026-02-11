"use client";

import { useEffect } from "react";
import Link from "next/link";
import { MainLayout } from "@/layouts/MainLayout";
import { useBlogStore } from "@/libs/state/blog-store";
import { PageLoader } from "@/components/ui/page-loader";

export const CategoryListPageRoute = () => {
  const home = useBlogStore((state) => state.home);
  const isBootstrapLoading = useBlogStore((state) => state.isBootstrapLoading);
  const errorMessage = useBlogStore((state) => state.errorMessage);
  const ensureBootstrap = useBlogStore((state) => state.ensureBootstrap);

  useEffect(() => {
    void ensureBootstrap();
  }, [ensureBootstrap]);

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
