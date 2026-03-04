import type { Metadata } from "next";
import { getBlogBootstrapPayload } from "@/apis/blog/server/bootstrap";
import type { BlogBootstrapPayload } from "@/libs/types/blog-store";
import { buildMetadata } from "@/libs/seo";
import { HomePageRoute } from "@/routes/feed/HomePageRoute";

export const metadata: Metadata = buildMetadata({
  title: "Home",
  description: "Notion 기반 블로그 홈",
  path: "/",
});

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const readCategorySlug = (searchParams?: Record<string, string | string[] | undefined>) => {
  const categoryParam = searchParams?.category;
  if (typeof categoryParam === "string") return categoryParam;
  return undefined;
};

export default async function HomePage({ searchParams }: Props) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  let initialBootstrap: BlogBootstrapPayload | undefined;

  try {
    initialBootstrap = await getBlogBootstrapPayload();
  } catch {
    initialBootstrap = undefined;
  }

  return (
    <HomePageRoute
      requestedCategorySlug={readCategorySlug(resolvedSearchParams)}
      initialBootstrap={initialBootstrap}
    />
  );
}
