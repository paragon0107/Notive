import type { Metadata } from "next";
import { buildMetadata } from "@/libs/seo";
import { CategoryListPageRoute } from "@/routes/category/CategoryListPageRoute";

export const metadata: Metadata = buildMetadata({
  title: "Categories",
  description: "카테고리 목록",
  path: "/category",
});

export default function CategoryPage() {
  return <CategoryListPageRoute />;
}
