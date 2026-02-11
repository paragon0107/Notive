import type { Category, Series } from "@/libs/types/blog";
import { getDatabaseMap } from "@/apis/notion/queries/database-map";
import {
  assertDatabaseSchema,
  fetchDatabase,
  POSTS_SCHEMA,
} from "@/apis/notion/queries/schema";
import { slugify } from "@/libs/notion/slugify";

const mapCategory = (name: string, color?: string, index?: number): Category => ({
  id: `category-${slugify(name)}`,
  name,
  slug: slugify(name),
  description: undefined,
  order: index,
  isPinned: false,
  color,
});

const mapSeries = (name: string, index?: number): Series => ({
  id: `series-${slugify(name)}`,
  name,
  slug: slugify(name),
  description: undefined,
  order: index,
  postIds: [],
});

export const fetchCategories = async (): Promise<Category[]> => {
  const { postsId } = await getDatabaseMap();
  const database = await fetchDatabase(postsId);
  assertDatabaseSchema(database, POSTS_SCHEMA);

  const categoryProperty = database.properties.Category;
  if (categoryProperty?.type !== "multi_select") return [];

  return categoryProperty.multi_select.options.map((option, index) =>
    mapCategory(option.name ?? "", option.color, index)
  );
};

export const fetchSeries = async (): Promise<Series[]> => {
  const { postsId } = await getDatabaseMap();
  const database = await fetchDatabase(postsId);
  assertDatabaseSchema(database, POSTS_SCHEMA);

  const seriesProperty = database.properties.Series;
  if (seriesProperty?.type !== "select") return [];

  return seriesProperty.select.options.map((option, index) =>
    mapSeries(option.name ?? "", index)
  );
};
