import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MainLayout } from "@/layouts/MainLayout";
import { FeedContainer } from "@/routes/feed/FeedContainer";
import {
  fetchCategories,
  fetchHomeConfig,
  fetchPostBlocks,
  fetchPosts,
} from "@/apis/notion/queries";
import { getFallbackHomeConfig, normalizeHomeConfig } from "@/libs/home-config";
import { filterPostsByCategorySlug } from "@/libs/posts";
import { buildPostSummaries } from "@/libs/post-summary";
import { buildMetadata } from "@/libs/seo";
export const revalidate = 3600;

type Props = {
  params: { slug: string };
};

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const categories = await fetchCategories();
  const category = categories.find((item) => item.slug === params.slug);
  if (!category) {
    return buildMetadata({ title: "Category", path: `/category/${params.slug}` });
  }
  return buildMetadata({
    title: category.name,
    description: category.description,
    path: `/category/${category.slug}`,
  });
};

export const generateStaticParams = async () => {
  const categories = await fetchCategories();
  return categories.map((category) => ({ slug: category.slug }));
};

export default async function CategoryDetailPage({ params }: Props) {
  const [posts, home, categories] = await Promise.all([
    fetchPosts(),
    fetchHomeConfig(getFallbackHomeConfig()),
    fetchCategories(),
  ]);

  const category = categories.find((item) => item.slug === params.slug);
  if (!category) notFound();

  const filtered = filterPostsByCategorySlug(posts, params.slug);

  const blocks = await Promise.all(
    filtered.map(async (post) => ({
      postId: post.id,
      blocks: await fetchPostBlocks(post.id),
    }))
  );
  const blocksMap = new Map(blocks.map((item) => [item.postId, item.blocks]));
  const summaries = buildPostSummaries(filtered, blocksMap);

  const normalizedHome = normalizeHomeConfig(home);

  return (
    <MainLayout home={normalizedHome}>
      <section className="category-detail">
        <div className="category-detail__header">
          <h1>{category.name}</h1>
          {category.description ? (
            <p className="meta">{category.description}</p>
          ) : null}
        </div>
        <FeedContainer posts={summaries} home={normalizedHome} />
      </section>
    </MainLayout>
  );
}
