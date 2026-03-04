import type { Metadata } from "next";
import { getBlogBootstrapPayload } from "@/apis/blog/server/bootstrap";
import {
  getBlogPostDetailPayload,
  PostNotFoundError,
} from "@/apis/blog/server/post-detail";
import type {
  BlogBootstrapPayload,
  BlogPostDetailPayload,
} from "@/libs/types/blog-store";
import { buildMetadata } from "@/libs/seo";
import { PostDetailPageRoute } from "@/routes/detail/PostDetailPageRoute";

type Props = {
  params: Promise<{ slug: string }>;
};

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const { slug } = await params;

  try {
    const payload = await getBlogPostDetailPayload(slug);
    const post = payload.post;

    return buildMetadata({
      title: post.title,
      description: post.summary ?? `${post.title} 글`,
      path: `/post/${post.slug}`,
      image: post.thumbnailUrl,
      type: "article",
      keywords: post.categories.map((category) => category.name),
    });
  } catch (error) {
    if (error instanceof PostNotFoundError) {
      return buildMetadata({
        title: "Post not found",
        description: "요청한 글을 찾을 수 없습니다.",
        path: `/post/${slug}`,
        type: "article",
        noIndex: true,
      });
    }

    return buildMetadata({
      title: `Post: ${slug}`,
      path: `/post/${slug}`,
      type: "article",
    });
  }
};

export default async function PostDetailPage({ params }: Props) {
  const { slug } = await params;

  const [initialBootstrap, initialPostDetail] = await Promise.all([
    getBlogBootstrapPayload().catch(() => undefined as BlogBootstrapPayload | undefined),
    getBlogPostDetailPayload(slug).catch(() => undefined as BlogPostDetailPayload | undefined),
  ]);

  return (
    <PostDetailPageRoute
      slug={slug}
      initialBootstrap={initialBootstrap}
      initialPostDetail={initialPostDetail}
    />
  );
}
