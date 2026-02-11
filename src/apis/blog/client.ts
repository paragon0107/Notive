import type {
  BlogBootstrapPayload,
  BlogPostDetailPayload,
  NotionDatabaseMap,
} from "@/libs/types/blog-store";

const readJson = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => ({}))) as {
      message?: string;
    };

    throw new Error(errorPayload.message || "Request failed.");
  }

  return (await response.json()) as T;
};

export const fetchBlogBootstrap = async (): Promise<BlogBootstrapPayload> => {
  const response = await fetch("/api/blog/bootstrap", {
    method: "GET",
    cache: "no-store",
  });

  return readJson<BlogBootstrapPayload>(response);
};

export const fetchBlogDatabaseMap = async (): Promise<NotionDatabaseMap> => {
  const response = await fetch("/api/blog/database-map", {
    method: "GET",
    cache: "no-store",
  });

  const payload = await readJson<{ databaseMap: NotionDatabaseMap }>(response);
  return payload.databaseMap;
};

export const fetchBlogPostDetail = async (
  slug: string
): Promise<BlogPostDetailPayload> => {
  const response = await fetch(`/api/blog/post/${encodeURIComponent(slug)}`, {
    method: "GET",
    cache: "no-store",
  });

  return readJson<BlogPostDetailPayload>(response);
};
