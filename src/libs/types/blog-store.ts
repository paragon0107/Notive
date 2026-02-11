import type { Post, HomeConfig } from "@/libs/types/blog";
import type { BlockNode } from "@/libs/notion/blocks";

export type NotionDatabaseMap = {
  postsId: string;
  projectsId: string;
  contactsId: string;
  homeId: string;
};

export type BlogBootstrapPayload = {
  databaseMap: NotionDatabaseMap;
  home: HomeConfig;
  posts: Post[];
};

export type BlogPostDetailPayload = {
  databaseMap: NotionDatabaseMap;
  posts: Post[];
  post: Post;
  blocks: BlockNode[];
};
