export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  order?: number;
  isPinned: boolean;
  color?: string;
};

export type Series = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  order?: number;
  postIds: string[];
};

export type Project = {
  id: string;
  name: string;
  link?: string;
  iconUrl?: string;
  order?: number;
};

export type Contact = {
  id: string;
  type: string;
  label: string;
  value: string;
  iconUrl?: string;
  order?: number;
};

export type HomeConfig = {
  blogName: string;
  aboutMe: string;
  profileName?: string;
  profileImageUrl?: string;
  categories: Category[];
  projects: Project[];
  contacts: Contact[];
  useNotionProfileAsDefault: boolean;
};

export type Profile = {
  name: string;
  imageUrl?: string;
  role: string;
  blogName: string;
};

export type Post = {
  id: string;
  title: string;
  slug: string;
  date?: string;
  summary?: string;
  thumbnailUrl?: string;
  categories: Category[];
  series?: Series;
  authorNames: string[];
};

export type PostSummary = Post & {
  searchText: string;
};

export type HomePageData = {
  home: HomeConfig;
  posts: PostSummary[];
  profile: Profile;
  contacts: Contact[];
  projects: Project[];
};

export type TocItem = {
  id: string;
  text: string;
  level: 2 | 3 | 4;
};
