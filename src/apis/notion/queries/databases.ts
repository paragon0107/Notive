import { getDatabaseMap } from "@/apis/notion/queries/database-map";
import {
  assertDatabaseSchema,
  CONTACTS_SCHEMA,
  fetchDatabase,
  HOME_SCHEMA,
  POSTS_SCHEMA,
  PROJECTS_SCHEMA,
} from "@/apis/notion/queries/schema";

type CachedIdPromise = {
  promise: Promise<string>;
  expiresAt: number;
};

const DATABASE_ID_CACHE_TTL_MS = 30 * 1000;

let postsDatabaseIdCache: CachedIdPromise | null = null;
let projectsDatabaseIdCache: CachedIdPromise | null = null;
let contactsDatabaseIdCache: CachedIdPromise | null = null;
let homeDatabaseIdCache: CachedIdPromise | null = null;

export const getPostsDatabaseId = async () => {
  if (postsDatabaseIdCache && postsDatabaseIdCache.expiresAt > Date.now()) {
    return postsDatabaseIdCache.promise;
  }

  const promise = (async () => {
    const { postsId } = await getDatabaseMap();
    const database = await fetchDatabase(postsId);
    assertDatabaseSchema(database, POSTS_SCHEMA);
    return postsId;
  })();

  postsDatabaseIdCache = {
    promise,
    expiresAt: Date.now() + DATABASE_ID_CACHE_TTL_MS,
  };
  return promise;
};

export const getProjectsDatabaseId = async () => {
  if (projectsDatabaseIdCache && projectsDatabaseIdCache.expiresAt > Date.now()) {
    return projectsDatabaseIdCache.promise;
  }

  const promise = (async () => {
    const { projectsId } = await getDatabaseMap();
    const database = await fetchDatabase(projectsId);
    assertDatabaseSchema(database, PROJECTS_SCHEMA);
    return projectsId;
  })();

  projectsDatabaseIdCache = {
    promise,
    expiresAt: Date.now() + DATABASE_ID_CACHE_TTL_MS,
  };
  return promise;
};

export const getContactsDatabaseId = async () => {
  if (contactsDatabaseIdCache && contactsDatabaseIdCache.expiresAt > Date.now()) {
    return contactsDatabaseIdCache.promise;
  }

  const promise = (async () => {
    const { contactsId } = await getDatabaseMap();
    const database = await fetchDatabase(contactsId);
    assertDatabaseSchema(database, CONTACTS_SCHEMA);
    return contactsId;
  })();

  contactsDatabaseIdCache = {
    promise,
    expiresAt: Date.now() + DATABASE_ID_CACHE_TTL_MS,
  };
  return promise;
};

export const getHomeDatabaseId = async () => {
  if (homeDatabaseIdCache && homeDatabaseIdCache.expiresAt > Date.now()) {
    return homeDatabaseIdCache.promise;
  }

  const promise = (async () => {
    const { homeId } = await getDatabaseMap();
    const database = await fetchDatabase(homeId);
    assertDatabaseSchema(database, HOME_SCHEMA);
    return homeId;
  })();

  homeDatabaseIdCache = {
    promise,
    expiresAt: Date.now() + DATABASE_ID_CACHE_TTL_MS,
  };
  return promise;
};
