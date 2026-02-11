export const SITE_NAME = "LifeIstory";

export const SITE_DESCRIPTION = "Notion based blog";

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export const SITE_URL = rawSiteUrl.replace(/\/+$/, "");

export const SITE_KEYWORDS = ["Notion", "Blog", "Tech", "Backend"];


export const DEFAULT_PROFILE_ROLE = "Creator";

export const DEFAULT_PROFILE_IMAGE_URL ="";
