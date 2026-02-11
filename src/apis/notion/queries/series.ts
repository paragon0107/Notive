import type { Series } from "@/libs/types/blog";
import { getPostsDatabaseId } from "@/apis/notion/queries/databases";
import { fetchDatabase } from "@/apis/notion/queries/schema";
import { mapSeriesPage } from "@/apis/notion/queries/shared/mappers";
import { queryAllDatabasePages } from "@/apis/notion/queries/shared/query";
import { getNumberProperty, getTitleProperty } from "@/libs/notion/properties";

const sortByOrder = <T extends { order?: number }>(items: T[]) =>
  [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

const getSeriesDatabaseId = async () => {
  const postsDatabaseId = await getPostsDatabaseId();
  const postsDatabase = await fetchDatabase(postsDatabaseId);
  const seriesProperty = postsDatabase.properties.Series;

  if (seriesProperty?.type !== "relation") return undefined;

  return seriesProperty.relation.database_id;
};

let seriesByPageIdPromise: Promise<Map<string, Series>> | null = null;

const getSeriesByPageId = async () => {
  if (!seriesByPageIdPromise) {
    seriesByPageIdPromise = (async () => {
      const seriesDatabaseId = await getSeriesDatabaseId();
      if (!seriesDatabaseId) return new Map<string, Series>();

      const pages = await queryAllDatabasePages(seriesDatabaseId, {
        page_size: 100,
      });

      const seriesItems = sortByOrder(
        pages.map((page, index) =>
          mapSeriesPage(page.id, getTitleProperty(page), index, getNumberProperty(page, "Order"))
        )
      );

      return new Map(seriesItems.map((series) => [series.id, series]));
    })();
  }

  return seriesByPageIdPromise;
};

export const findSeriesByRelationIds = async (relationIds: string[]) => {
  if (relationIds.length === 0) return [] as Series[];

  const byPageId = await getSeriesByPageId();

  return relationIds
    .map((id) => byPageId.get(id))
    .filter((series): series is Series => Boolean(series));
};
