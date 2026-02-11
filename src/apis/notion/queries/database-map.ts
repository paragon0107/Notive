import type { BlockObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { getNotionPageId } from "@/apis/notion/client";
import { listBlockChildren } from "@/apis/notion/queries/shared/query";

type DatabaseMap = {
  postsId: string;
  projectsId: string;
  contactsId: string;
  homeId: string;
};

const REQUIRED_DATABASE_TITLES = ["Posts", "Projects", "Contacts", "Home"] as const;

type RequiredDatabaseTitle = (typeof REQUIRED_DATABASE_TITLES)[number];

const normalizeTitle = (value: string) => value.trim().toLowerCase();

const isChildDatabaseBlock = (
  block: BlockObjectResponse
): block is BlockObjectResponse & { type: "child_database" } =>
  block.type === "child_database";

const listChildDatabases = async () => {
  const pageId = getNotionPageId();
  const blocks = await listBlockChildren(pageId);
  return blocks.filter(isChildDatabaseBlock);
};

const buildDatabaseMap = (blocks: Array<BlockObjectResponse & { type: "child_database" }>) => {
  const databaseIdByTitle = new Map<string, string>();

  blocks.forEach((block) => {
    const title = block.child_database.title ?? "";
    databaseIdByTitle.set(normalizeTitle(title), block.id);
  });

  const resolved: Record<RequiredDatabaseTitle, string | undefined> = {
    Posts: databaseIdByTitle.get(normalizeTitle("Posts")),
    Projects: databaseIdByTitle.get(normalizeTitle("Projects")),
    Contacts: databaseIdByTitle.get(normalizeTitle("Contacts")),
    Home: databaseIdByTitle.get(normalizeTitle("Home")),
  };

  const missingTitles = REQUIRED_DATABASE_TITLES.filter((title) => !resolved[title]);

  if (missingTitles.length > 0) {
    const availableTitles = Array.from(databaseIdByTitle.keys())
      .map((title) => `"${title}"`)
      .join(", ");

    throw new Error(
      `Missing Notion databases: ${missingTitles.join(", ")}. ` +
        `Available child databases: ${availableTitles || "none"}.`
    );
  }

  return {
    postsId: resolved.Posts ?? "",
    projectsId: resolved.Projects ?? "",
    contactsId: resolved.Contacts ?? "",
    homeId: resolved.Home ?? "",
  };
};

let databaseMapPromise: Promise<DatabaseMap> | null = null;
let databaseMapExpiresAt = 0;
const DATABASE_MAP_CACHE_TTL_MS = 30 * 1000;

export const getDatabaseMap = async (): Promise<DatabaseMap> => {
  const now = Date.now();
  if (!databaseMapPromise || now >= databaseMapExpiresAt) {
    databaseMapPromise = (async () => {
      const blocks = await listChildDatabases();
      return buildDatabaseMap(blocks);
    })();
    databaseMapExpiresAt = now + DATABASE_MAP_CACHE_TTL_MS;
  }

  return databaseMapPromise;
};
