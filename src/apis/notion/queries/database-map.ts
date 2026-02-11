import type { BlockObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { getNotionClient, getNotionPageId } from "@/apis/notion/client";

type DatabaseMap = {
  postsId: string;
  projectsId: string;
  contactsId: string;
  homeId: string;
};

const REQUIRED_TITLES = ["Posts", "Projects", "Contacts", "Home"] as const;

type RequiredTitle = (typeof REQUIRED_TITLES)[number];

const normalizeTitle = (value: string) => value.trim().toLowerCase();

const isChildDatabase = (
  block: BlockObjectResponse
): block is BlockObjectResponse & { type: "child_database" } =>
  block.type === "child_database";

const listChildDatabases = async () => {
  const notion = getNotionClient();
  const pageId = getNotionPageId();
  const results: BlockObjectResponse[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.blocks.children.list({
      block_id: pageId,
      page_size: 100,
      start_cursor: cursor,
    });

    response.results.forEach((block) => {
      if ("type" in block) {
        results.push(block as BlockObjectResponse);
      }
    });

    cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
  } while (cursor);

  return results.filter(isChildDatabase);
};

let databaseMapPromise: Promise<DatabaseMap> | null = null;

export const getDatabaseMap = async (): Promise<DatabaseMap> => {
  if (!databaseMapPromise) {
    databaseMapPromise = (async () => {
      const blocks = await listChildDatabases();
      const byTitle = new Map<string, string>();

      blocks.forEach((block) => {
        const title = block.child_database.title ?? "";
        byTitle.set(normalizeTitle(title), block.id);
      });

      const missing: RequiredTitle[] = [];
      const resolved: Record<RequiredTitle, string | undefined> = {
        Posts: byTitle.get(normalizeTitle("Posts")),
        Projects: byTitle.get(normalizeTitle("Projects")),
        Contacts: byTitle.get(normalizeTitle("Contacts")),
        Home: byTitle.get(normalizeTitle("Home")),
      };

      REQUIRED_TITLES.forEach((title) => {
        if (!resolved[title]) missing.push(title);
      });

      if (missing.length > 0) {
        const available = Array.from(byTitle.keys())
          .map((key) => `"${key}"`)
          .join(", ");
        throw new Error(
          `Missing Notion databases: ${missing.join(", ")}. ` +
            `Available child databases: ${available || "none"}.`
        );
      }

      return {
        postsId: resolved.Posts ?? "",
        projectsId: resolved.Projects ?? "",
        contactsId: resolved.Contacts ?? "",
        homeId: resolved.Home ?? "",
      };
    })();
  }

  return databaseMapPromise;
};
