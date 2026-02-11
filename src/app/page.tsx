import type { Metadata } from "next";
import { buildMetadata } from "@/libs/seo";
import { HomePageRoute } from "@/routes/feed/HomePageRoute";

export const metadata: Metadata = buildMetadata({
  title: "Home",
  description: "Notion 기반 블로그 홈",
  path: "/",
});

type Props = {
  searchParams?: Record<string, string | string[] | undefined>;
};

const readCategorySlug = (searchParams?: Record<string, string | string[] | undefined>) => {
  const categoryParam = searchParams?.category;
  if (typeof categoryParam === "string") return categoryParam;
  return undefined;
};

export default function HomePage({ searchParams }: Props) {
  return <HomePageRoute requestedCategorySlug={readCategorySlug(searchParams)} />;
}
