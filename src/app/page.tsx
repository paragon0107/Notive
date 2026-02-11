import type { Metadata } from "next";
import { buildMetadata } from "@/libs/seo";
import { HomePageRoute } from "@/routes/feed/HomePageRoute";

export const metadata: Metadata = buildMetadata({
  title: "Home",
  description: "Notion 기반 블로그 홈",
  path: "/",
});

export default function HomePage() {
  return <HomePageRoute />;
}
