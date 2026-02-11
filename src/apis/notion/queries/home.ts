import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import type { Contact, HomeConfig, Project } from "@/libs/types/blog";
import {
  getContactsDatabaseId,
  getHomeDatabaseId,
  getProjectsDatabaseId,
} from "@/apis/notion/queries/databases";
import {
  queryAllDatabasePages,
  queryFirstDatabasePage,
} from "@/apis/notion/queries/shared/query";
import { mapCategoryOption } from "@/apis/notion/queries/shared/mappers";
import {
  getCheckboxProperty,
  getFilesProperty,
  getMultiSelectOptions,
  getNumberProperty,
  getRelationPropertyIds,
  getRichTextProperty,
  getTitleProperty,
} from "@/libs/notion/properties";

const sortByOrder = <T extends { order?: number }>(items: T[]) =>
  [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

const mapProject = (page: PageObjectResponse): Project => ({
  id: page.id,
  name: getTitleProperty(page),
  link: page.properties.Link?.type === "url" ? page.properties.Link.url ?? undefined : undefined,
  iconUrl: getFilesProperty(page, "Icon"),
  order: getNumberProperty(page, "Order"),
});

const mapContact = (page: PageObjectResponse): Contact => {
  return {
    id: page.id,
    name: getTitleProperty(page),
    value: getRichTextProperty(page, "Value") || "",
    iconUrl: getFilesProperty(page, "Icon"),
    order: getNumberProperty(page, "Order"),
  };
};

const fetchProjects = async (projectIds: string[]) => {
  const projectsDatabaseId = await getProjectsDatabaseId();
  const rows = await queryAllDatabasePages(projectsDatabaseId);
  const projects = sortByOrder(rows.map(mapProject));

  if (projectIds.length === 0) return projects;
  const idSet = new Set(projectIds);
  return projects.filter((project) => idSet.has(project.id));
};

const fetchContacts = async (contactIds: string[]) => {
  const contactsDatabaseId = await getContactsDatabaseId();
  const rows = await queryAllDatabasePages(contactsDatabaseId);
  const contacts = sortByOrder(rows.map(mapContact));

  if (contactIds.length === 0) return contacts;
  const idSet = new Set(contactIds);
  return contacts.filter((contact) => idSet.has(contact.id));
};

export const fetchHomeConfig = async (fallback: HomeConfig): Promise<HomeConfig> => {
  const homeDatabaseId = await getHomeDatabaseId();
  const page = await queryFirstDatabasePage(homeDatabaseId);

  if (!page) return fallback;

  const projectIds = getRelationPropertyIds(page, "Projects");
  const contactIds = getRelationPropertyIds(page, "Contacts");

  const [projects, contacts] = await Promise.all([
    fetchProjects(projectIds),
    fetchContacts(contactIds),
  ]);

  const categories = getMultiSelectOptions(page, "CategoryList").map((option, index) =>
    mapCategoryOption(
      {
        id: option.id,
        name: option.name,
        color: option.color,
      },
      index,
      true,
      index
    )
  );

  return {
    blogName: getRichTextProperty(page, "BlogName") || fallback.blogName,
    aboutMe: getRichTextProperty(page, "AboutMe") || fallback.aboutMe,
    profileName: getRichTextProperty(page, "ProfileName") || fallback.profileName,
    profileImageUrl: getFilesProperty(page, "ProfileImage") || fallback.profileImageUrl,
    categories,
    projects,
    contacts,
    useNotionProfileAsDefault: getCheckboxProperty(page, "UseNotionProfileAsDefault"),
  };
};
