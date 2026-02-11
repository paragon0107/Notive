import type { Category } from "@/libs/types/blog";
import { getPostsDatabaseId } from "@/apis/notion/queries/databases";
import { fetchDatabase } from "@/apis/notion/queries/schema";
import { mapCategoryOption } from "@/apis/notion/queries/shared/mappers";

export const fetchCategories = async (): Promise<Category[]> => {
  const postsDatabaseId = await getPostsDatabaseId();
  const database = await fetchDatabase(postsDatabaseId);

  const categoryProperty = database.properties.Category;
  if (categoryProperty?.type !== "multi_select") return [];

  return categoryProperty.multi_select.options.map((option, index) =>
    mapCategoryOption(
      {
        id: option.id,
        name: option.name ?? "",
        color: option.color,
      },
      index,
      false,
      index
    )
  );
};
