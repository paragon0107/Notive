import type { Category, Series } from "@/libs/types/blog";
import { slugify } from "@/libs/notion/slugify";

type CategoryInput = {
  id?: string;
  name: string;
  color?: string;
};

const normalizeCategoryName = (value: string, index: number) =>
  value.trim() || `Untitled Category ${index + 1}`;

const buildCategorySlug = (name: string, fallbackKey: string) =>
  slugify(name) || `category-${fallbackKey.toLowerCase()}`;

const buildCategoryFallbackKey = (index: number, rawId?: string) => {
  const sanitizedId = rawId?.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  return sanitizedId || `${index + 1}`;
};

export const mapCategoryOption = (
  input: CategoryInput,
  index: number,
  isPinned: boolean,
  order?: number
): Category => {
  const name = normalizeCategoryName(input.name, index);
  const fallbackKey = buildCategoryFallbackKey(index, input.id);
  const slug = buildCategorySlug(name, fallbackKey);

  return {
    id: `category-${slug}`,
    name,
    slug,
    description: undefined,
    order,
    isPinned,
    color: input.color,
  };
};

export const mapSeriesPage = (
  id: string,
  name: string,
  index: number,
  order?: number
): Series => {
  const normalizedName = name.trim() || `Untitled Series ${index + 1}`;
  const slug = slugify(normalizedName) || `series-${index + 1}`;

  return {
    id,
    name: normalizedName,
    slug,
    description: undefined,
    order,
    postIds: [],
  };
};
