import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import type { Contact, HomeConfig, Project } from "@/libs/types/blog";
import { getDatabaseMap } from "@/apis/notion/queries/database-map";
import {
  assertDatabaseSchema,
  fetchDatabase,
  CONTACTS_SCHEMA,
  HOME_SCHEMA,
  PROJECTS_SCHEMA,
} from "@/apis/notion/queries/schema";
import { getNotionClient } from "@/apis/notion/client";
import {
  getCheckboxProperty,
  getFilesProperty,
  getMultiSelectOptions,
  getNumberProperty,
  getRelationPropertyIds,
  getRichTextProperty,
  getSelectProperty,
  getTitleProperty,
} from "@/libs/notion/properties";
import { slugify } from "@/libs/notion/slugify";

const isFullPage = (page: unknown): page is PageObjectResponse =>
  Boolean(page && typeof page === "object" && "properties" in page);

const queryFirstRow = async (databaseId: string) => {
  const notion = getNotionClient();
  const response = await notion.databases.query({
    database_id: databaseId,
    page_size: 1,
  });
  const page = response.results.find(isFullPage);
  return page ?? undefined;
};

const queryAllRows = async (databaseId: string) => {
  const notion = getNotionClient();
  const results: PageObjectResponse[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.databases.query({
      database_id: databaseId,
      page_size: 100,
      start_cursor: cursor,
    });

    response.results.forEach((page) => {
      if (isFullPage(page)) results.push(page);
    });

    cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
  } while (cursor);

  return results;
};

const sortByOrder = <T extends { order?: number }>(items: T[]) =>
  [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

const mapProject = (page: PageObjectResponse): Project => ({
  id: page.id,
  name: getTitleProperty(page),
  link: page.properties.Link?.type === "url" ? page.properties.Link.url : undefined,
  iconUrl: getFilesProperty(page, "Icon"),
  order: getNumberProperty(page, "Order"),
});

const mapContact = (page: PageObjectResponse): Contact => {
  const label = getRichTextProperty(page, "Label") || getTitleProperty(page);
  const value = getRichTextProperty(page, "Value") || "";
  return {
    id: page.id,
    type: getSelectProperty(page, "Type") || "Custom",
    label,
    value,
    iconUrl: getFilesProperty(page, "Icon"),
    order: getNumberProperty(page, "Order"),
  };
};

const fetchProjects = async (projectIds: string[]) => {
  const { projectsId } = await getDatabaseMap();
  const database = await fetchDatabase(projectsId);
  assertDatabaseSchema(database, PROJECTS_SCHEMA);

  const rows = await queryAllRows(projectsId);
  const projects = sortByOrder(rows.map(mapProject));

  if (projectIds.length === 0) return projects;
  const idSet = new Set(projectIds);
  return projects.filter((project) => idSet.has(project.id));
};

const fetchContacts = async (contactIds: string[]) => {
  const { contactsId } = await getDatabaseMap();
  const database = await fetchDatabase(contactsId);
  assertDatabaseSchema(database, CONTACTS_SCHEMA);

  const rows = await queryAllRows(contactsId);
  const contacts = sortByOrder(rows.map(mapContact));

  if (contactIds.length === 0) return contacts;
  const idSet = new Set(contactIds);
  return contacts.filter((contact) => idSet.has(contact.id));
};

let homeDatabasePromise: Promise<string> | null = null;

const ensureHomeDatabase = async () => {
  if (!homeDatabasePromise) {
    homeDatabasePromise = (async () => {
      const { homeId } = await getDatabaseMap();
      const database = await fetchDatabase(homeId);
      assertDatabaseSchema(database, HOME_SCHEMA);
      return homeId;
    })();
  }

  return homeDatabasePromise;
};

export const fetchHomeConfig = async (fallback: HomeConfig): Promise<HomeConfig> => {
  const homeId = await ensureHomeDatabase();
  const page = await queryFirstRow(homeId);

  if (!page) return fallback;

  const projectIds = getRelationPropertyIds(page, "Projects");
  const contactIds = getRelationPropertyIds(page, "Contacts");

  const [projects, contacts] = await Promise.all([
    fetchProjects(projectIds),
    fetchContacts(contactIds),
  ]);

  const categories = getMultiSelectOptions(page, "CategoryList").map(
    (option, index) => ({
      id: `category-${slugify(option.name)}`,
      name: option.name,
      slug: slugify(option.name),
      description: undefined,
      order: index,
      isPinned: true,
      color: option.color,
    })
  );

  return {
    blogName: getRichTextProperty(page, "BlogName") || fallback.blogName,
    aboutMe: getRichTextProperty(page, "AboutMe") || fallback.aboutMe,
    profileName: getRichTextProperty(page, "ProfileName") || fallback.profileName,
    profileImageUrl: getFilesProperty(page, "ProfileImage"),
    categories,
    projects,
    contacts,
    useNotionProfileAsDefault: getCheckboxProperty(
      page,
      "UseNotionProfileAsDefault"
    ),
  };
};
