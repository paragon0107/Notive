import { getDatabaseMap } from "@/apis/notion/queries/database-map";
import {
  assertDatabaseSchema,
  CONTACTS_SCHEMA,
  fetchDatabase,
  HOME_SCHEMA,
  POSTS_SCHEMA,
  PROJECTS_SCHEMA,
} from "@/apis/notion/queries/schema";

let postsDatabaseIdPromise: Promise<string> | null = null;
let projectsDatabaseIdPromise: Promise<string> | null = null;
let contactsDatabaseIdPromise: Promise<string> | null = null;
let homeDatabaseIdPromise: Promise<string> | null = null;

export const getPostsDatabaseId = async () => {
  if (!postsDatabaseIdPromise) {
    postsDatabaseIdPromise = (async () => {
      const { postsId } = await getDatabaseMap();
      const database = await fetchDatabase(postsId);
      assertDatabaseSchema(database, POSTS_SCHEMA);
      return postsId;
    })();
  }

  return postsDatabaseIdPromise;
};

export const getProjectsDatabaseId = async () => {
  if (!projectsDatabaseIdPromise) {
    projectsDatabaseIdPromise = (async () => {
      const { projectsId } = await getDatabaseMap();
      const database = await fetchDatabase(projectsId);
      assertDatabaseSchema(database, PROJECTS_SCHEMA);
      return projectsId;
    })();
  }

  return projectsDatabaseIdPromise;
};

export const getContactsDatabaseId = async () => {
  if (!contactsDatabaseIdPromise) {
    contactsDatabaseIdPromise = (async () => {
      const { contactsId } = await getDatabaseMap();
      const database = await fetchDatabase(contactsId);
      assertDatabaseSchema(database, CONTACTS_SCHEMA);
      return contactsId;
    })();
  }

  return contactsDatabaseIdPromise;
};

export const getHomeDatabaseId = async () => {
  if (!homeDatabaseIdPromise) {
    homeDatabaseIdPromise = (async () => {
      const { homeId } = await getDatabaseMap();
      const database = await fetchDatabase(homeId);
      assertDatabaseSchema(database, HOME_SCHEMA);
      return homeId;
    })();
  }

  return homeDatabaseIdPromise;
};
