import type { Metadata } from "next";
import { getBlogBootstrapPayload } from "@/apis/blog/server/bootstrap";
import type { BlogBootstrapPayload } from "@/libs/types/blog-store";
import { buildMetadata } from "@/libs/seo";
import { CategoryDetailPageRoute } from "@/routes/category/CategoryDetailPageRoute";

type Props = {
  params: Promise<{ slug: string }>;
};

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const { slug } = await params;

  try {
    const bootstrap = await getBlogBootstrapPayload();
    const category = bootstrap.home.categories.find((item) => item.slug === slug);

    if (!category) {
      return buildMetadata({
        title: "Category not found",
        description: "요청한 카테고리를 찾을 수 없습니다.",
        path: `/category/${slug}`,
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
      title: `Category: ${slug}`,
      path: `/category/${slug}`,
    });
  }
};

export default async function CategoryDetailPage({ params }: Props) {
  const { slug } = await params;
  let initialBootstrap: BlogBootstrapPayload | undefined;

  try {
    initialBootstrap = await getBlogBootstrapPayload();
  } catch {
    initialBootstrap = undefined;
  }

  return <CategoryDetailPageRoute slug={slug} initialBootstrap={initialBootstrap} />;
}
