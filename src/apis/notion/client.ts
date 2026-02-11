import { Client } from "@notionhq/client";

type NotionConfig = {
  token: string;
  pageId: string;
};

const resolveConfig = (): NotionConfig => {
  const token = process.env.NOTION_TOKEN;
  const pageId = process.env.NOTION_PAGE_ID;

  if (!token) {
    throw new Error("NOTION_TOKEN is required. Check .env.local.");
  }

  if (!pageId) {
    throw new Error("NOTION_PAGE_ID is required. Check .env.local.");
  }

  return { token, pageId };
};

let notionClient: Client | null = null;

export const getNotionClient = () => {
  const { token } = resolveConfig();
  if (!notionClient) {
    notionClient = new Client({ auth: token });
  }
  return notionClient;
};

export const getNotionPageId = () => resolveConfig().pageId;
