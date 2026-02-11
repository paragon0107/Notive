import type { HomeConfig } from "@/libs/types/blog";
import {
  DEFAULT_PROFILE_IMAGE_URL,
  DEFAULT_PROFILE_ROLE,
  SITE_DESCRIPTION,
  SITE_NAME,
} from "@/libs/site-config";

export const getFallbackHomeConfig = (): HomeConfig => ({
  blogName: SITE_NAME,
  aboutMe: SITE_DESCRIPTION,
  profileName: SITE_NAME,
  profileImageUrl: DEFAULT_PROFILE_IMAGE_URL,
  categories: [],
  projects: [],
  contacts: [],
  useNotionProfileAsDefault: true,
});

export const normalizeHomeConfig = (config: HomeConfig): HomeConfig => {
  const normalizedContacts = [...config.contacts].sort((a, b) =>
    (a.order ?? 0) - (b.order ?? 0)
  );

  return {
    ...config,
    blogName: config.blogName || SITE_NAME,
    aboutMe: config.aboutMe || SITE_DESCRIPTION || DEFAULT_PROFILE_ROLE,
    contacts: normalizedContacts,
  };
};
