export const SITE_NAME =
  process.env.NEXT_PUBLIC_SITE_NAME ?? "LifeIstory";

export const SITE_DESCRIPTION =
  process.env.NEXT_PUBLIC_SITE_DESCRIPTION ?? "Notion 기반 블로그";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";


export const DEFAULT_PROFILE_ROLE =
  process.env.NEXT_PUBLIC_PROFILE_ROLE ?? "Creator";

export const DEFAULT_CONTACTS = [
  { type: "GitHub", label: "GitHub", value: "" },
  { type: "Email", label: "Email", value: "" },
  { type: "LinkedIn", label: "LinkedIn", value: "" },
];
