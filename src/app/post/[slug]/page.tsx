import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MainLayout } from "@/layouts/MainLayout";
import { PostDetailView } from "@/routes/detail/PostDetailView";
import {
  fetchHomeConfig,
  fetchPostBlocks,
  fetchPostBySlug,
  fetchPosts,
} from "@/apis/notion/queries";
import { extractToc } from "@/libs/notion/blocks";
import { getFallbackHomeConfig, normalizeHomeConfig } from "@/libs/home-config";
import { getPostNavigation, getRelatedPosts } from "@/libs/posts";
import { buildMetadata } from "@/libs/seo";
export const revalidate = 3600;

type Props = {
  params: { slug: string };
};

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const post = await fetchPostBySlug(params.slug);
  if (!post) {
    return buildMetadata({ title: "Post", path: `/post/${params.slug}` });
  }
  return buildMetadata({
    title: post.title,
    description: post.summary,
    path: `/post/${post.slug}`,
    image: post.thumbnailUrl,
    type: "article",
  });
};

export const generateStaticParams = async () => {
  const posts = await fetchPosts();
  return posts.map((post) => ({ slug: post.slug }));
};

export default async function PostDetailPage({ params }: Props) {
  const post = await fetchPostBySlug(params.slug);
  if (!post) notFound();

  const [blocks, posts, home] = await Promise.all([
    fetchPostBlocks(post.id),
    fetchPosts(),
    fetchHomeConfig(getFallbackHomeConfig()),
  ]);

  const tocItems = extractToc(blocks);
  const { previous, next } = getPostNavigation(posts, post.id);
  const relatedPosts = getRelatedPosts(
    posts,
    post.categories.map((category) => category.id),
    post.id
  );
  const normalizedHome = normalizeHomeConfig(home);

  return (
    <MainLayout home={normalizedHome} tocItems={tocItems} relatedPosts={relatedPosts}>
      <PostDetailView
        post={post}
        blocks={blocks}
        previous={previous}
        next={next}
        relatedPosts={relatedPosts}
      />
    </MainLayout>
  );
}
