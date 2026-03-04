import type { Metadata } from "next";
import { getBlogBootstrapPayload } from "@/apis/blog/server/bootstrap";
import type { BlogBootstrapPayload } from "@/libs/types/blog-store";
import { buildMetadata } from "@/libs/seo";
import { CategoryListPageRoute } from "@/routes/category/CategoryListPageRoute";

export const metadata: Metadata = buildMetadata({
  title: "Categories",
  description: "카테고리 목록",
  path: "/category",
});

export default async function CategoryPage() {
  let initialBootstrap: BlogBootstrapPayload | undefined;

  try {
    initialBootstrap = await getBlogBootstrapPayload();
  } catch {
    initialBootstrap = undefined;
  }

  return <CategoryListPageRoute initialBootstrap={initialBootstrap} />;
}
