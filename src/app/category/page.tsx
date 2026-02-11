import type { Metadata } from "next";
import Link from "next/link";
import { MainLayout } from "@/layouts/MainLayout";
import { fetchCategories, fetchHomeConfig } from "@/apis/notion/queries";
import { getFallbackHomeConfig, normalizeHomeConfig } from "@/libs/home-config";
import { buildMetadata } from "@/libs/seo";
export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Categories",
  description: "카테고리 목록",
  path: "/category",
});

export default async function CategoryPage() {
  const [categories, home] = await Promise.all([
    fetchCategories(),
    fetchHomeConfig(getFallbackHomeConfig()),
  ]);
  const normalizedHome = normalizeHomeConfig(home);

  return (
    <MainLayout home={normalizedHome}>
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
}
