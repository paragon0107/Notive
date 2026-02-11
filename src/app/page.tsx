import type { Metadata } from "next";
import { MainLayout } from "@/layouts/MainLayout";
import { fetchHomePageData } from "@/apis/notion/queries";
import { buildMetadata } from "@/libs/seo";
import { FeedContainer } from "@/routes/feed/FeedContainer";
export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Home",
  description: "Notion 기반 블로그 홈",
  path: "/",
});

export default async function HomePage() {
  const { home, posts } = await fetchHomePageData();

  return (
    <MainLayout home={home} rightCategories={home.categories}>
      <FeedContainer posts={posts} home={home} />
    </MainLayout>
  );
}
