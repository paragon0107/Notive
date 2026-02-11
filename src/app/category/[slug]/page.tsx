import type { Metadata } from "next";
import { fetchCategories } from "@/apis/notion/queries";
import { buildMetadata } from "@/libs/seo";
import { CategoryDetailPageRoute } from "@/routes/category/CategoryDetailPageRoute";

type Props = {
  params: { slug: string };
};

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  try {
    const categories = await fetchCategories();
    const category = categories.find((item) => item.slug === params.slug);

    if (!category) {
      return buildMetadata({
        title: "Category not found",
        description: "요청한 카테고리를 찾을 수 없습니다.",
        path: `/category/${params.slug}`,
        noIndex: true,
      });
    }

    const description = category.description ?? `${category.name} 카테고리 글`;

    return buildMetadata({
      title: category.name,
      description,
      path: `/category/${category.slug}`,
      keywords: [category.name, "Category"],
    });
  } catch {
    return buildMetadata({
      title: `Category: ${params.slug}`,
      path: `/category/${params.slug}`,
    });
  }
};

export default function CategoryDetailPage({ params }: Props) {
  return <CategoryDetailPageRoute slug={params.slug} />;
}
