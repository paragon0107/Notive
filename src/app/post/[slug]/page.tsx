import type { Metadata } from "next";
import { buildMetadata } from "@/libs/seo";
import { PostDetailPageRoute } from "@/routes/detail/PostDetailPageRoute";

type Props = {
  params: { slug: string };
};

export const generateMetadata = ({ params }: Props): Metadata => {
  return buildMetadata({
    title: `Post: ${params.slug}`,
    path: `/post/${params.slug}`,
    type: "article",
  });
};

export default function PostDetailPage({ params }: Props) {
  return <PostDetailPageRoute slug={params.slug} />;
}
