import type { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { getNotionClient } from "@/apis/notion/client";

type PropertyType = DatabaseObjectResponse["properties"][string]["type"];

export type PropertySchema = Record<
  string,
  PropertyType | Array<PropertyType>
>;

const databaseCache = new Map<string, Promise<DatabaseObjectResponse>>();

export const fetchDatabase = async (databaseId: string) => {
  const cached = databaseCache.get(databaseId);
  if (cached) return cached;

  const notion = getNotionClient();
  const promise = notion.databases.retrieve({
    database_id: databaseId,
  }) as Promise<DatabaseObjectResponse>;

  databaseCache.set(databaseId, promise);
  return promise;
};

export const assertDatabaseSchema = (
  database: DatabaseObjectResponse,
  schema: PropertySchema
) => {
  const missing: string[] = [];
  const mismatched: string[] = [];

  Object.entries(schema).forEach(([propertyName, expectedType]) => {
    const property = database.properties[propertyName];
    if (!property) {
      missing.push(propertyName);
      return;
    }

    const allowedTypes = Array.isArray(expectedType)
      ? expectedType
      : [expectedType];

    if (!allowedTypes.includes(property.type)) {
      mismatched.push(
        `${propertyName} (expected ${allowedTypes.join(
          " or "
        )}, got ${property.type})`
      );
    }
  });

  if (missing.length > 0 || mismatched.length > 0) {
    const segments = [] as string[];
    if (missing.length > 0) {
      segments.push(`missing: ${missing.join(", ")}`);
    }
    if (mismatched.length > 0) {
      segments.push(`type mismatch: ${mismatched.join(", ")}`);
    }

    throw new Error(
      `Notion database schema mismatch for "${database.title
        .map((part) => part.plain_text)
        .join("")}": ${segments.join("; ")}.`
    );
  }
};

export const POSTS_SCHEMA: PropertySchema = {
  Title: "title",
  Slug: "rich_text",
  Published: "checkbox",
  Date: "date",
  Summary: "rich_text",
  Thumbnail: "files",
  Category: "multi_select",
  Series: "relation",
  Author: "people",
};

export const PROJECTS_SCHEMA: PropertySchema = {
  Name: "title",
  Icon: "files",
  Link: "url",
  Order: "number",
};

export const CONTACTS_SCHEMA: PropertySchema = {
  Name: "title",
  Type: "select",
  Label: "rich_text",
  Value: "rich_text",
  Icon: "files",
  Order: "number",
};

export const HOME_SCHEMA: PropertySchema = {
  Name: "title",
  BlogName: "rich_text",
  AboutMe: "rich_text",
  ProfileName: "rich_text",
  ProfileImage: "files",
  CategoryList: "multi_select",
  Projects: "relation",
  Contacts: "relation",
  UseNotionProfileAsDefault: "checkbox",
};
