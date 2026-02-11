import type { Metadata } from "next";
import { buildMetadata } from "@/libs/seo";
import { CategoryDetailPageRoute } from "@/routes/category/CategoryDetailPageRoute";

type Props = {
  params: { slug: string };
};

export const generateMetadata = ({ params }: Props): Metadata => {
  return buildMetadata({
    title: `Category: ${params.slug}`,
    path: `/category/${params.slug}`,
  });
};

export default function CategoryDetailPage({ params }: Props) {
  return <CategoryDetailPageRoute slug={params.slug} />;
}
