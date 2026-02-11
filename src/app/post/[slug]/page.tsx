import type { Metadata } from "next";
import {
  fetchPostBySlug,
  fetchPosts,
  findPostBySlugFromList,
} from "@/apis/notion/queries/posts";
import { buildMetadata } from "@/libs/seo";
import { PostDetailPageRoute } from "@/routes/detail/PostDetailPageRoute";

type Props = {
  params: { slug: string };
};

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  try {
    const postBySlug = await fetchPostBySlug(params.slug);
    const post =
      postBySlug ?? findPostBySlugFromList(await fetchPosts(), params.slug);

    if (!post) {
      return buildMetadata({
        title: "Post not found",
        description: "요청한 글을 찾을 수 없습니다.",
        path: `/post/${params.slug}`,
        type: "article",
        noIndex: true,
      });
    }

    return buildMetadata({
      title: post.title,
      description: post.summary ?? `${post.title} 글`,
      path: `/post/${post.slug}`,
      image: post.thumbnailUrl,
      type: "article",
      keywords: post.categories.map((category) => category.name),
    });
  } catch {
    return buildMetadata({
      title: `Post: ${params.slug}`,
      path: `/post/${params.slug}`,
      type: "article",
    });
  }
};

export default function PostDetailPage({ params }: Props) {
  return <PostDetailPageRoute slug={params.slug} />;
}
