import type { Contact, HomeConfig } from "@/libs/types/blog";
import {
  DEFAULT_CONTACTS,
  DEFAULT_PROFILE_ROLE,
  SITE_DESCRIPTION,
  SITE_NAME,
} from "@/libs/site-config";

const normalizeContactType = (value: string) => value.trim().toLowerCase();

const buildDefaultContacts = (): Contact[] =>
  DEFAULT_CONTACTS.map((contact, index) => ({
    id: `default-${normalizeContactType(contact.type)}`,
    type: contact.type,
    label: contact.label,
    value: contact.value,
    order: index,
  }));

export const getFallbackHomeConfig = (): HomeConfig => ({
  blogName: SITE_NAME,
  aboutMe: SITE_DESCRIPTION,
  profileName: SITE_NAME,
  profileImageUrl: undefined,
  categories: [],
  projects: [],
  contacts: buildDefaultContacts(),
  useNotionProfileAsDefault: true,
});

export const normalizeHomeConfig = (config: HomeConfig): HomeConfig => {
  const defaultContacts = buildDefaultContacts();
  const contactMap = new Map(
    config.contacts.map((contact) => [normalizeContactType(contact.type), contact])
  );

  defaultContacts.forEach((contact) => {
    if (!contactMap.has(normalizeContactType(contact.type))) {
      contactMap.set(normalizeContactType(contact.type), contact);
    }
  });

  const normalizedContacts = Array.from(contactMap.values()).sort((a, b) =>
    (a.order ?? 0) - (b.order ?? 0)
  );

  return {
    ...config,
    blogName: config.blogName || SITE_NAME,
    aboutMe: config.aboutMe || SITE_DESCRIPTION || DEFAULT_PROFILE_ROLE,
    contacts: normalizedContacts,
  };
};
