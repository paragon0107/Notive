import type { MetadataRoute } from "next";
import { SITE_URL } from "@/libs/site-config";

const toAbsolute = (path: string) => new URL(path, SITE_URL).toString();

export default function robots(): MetadataRoute.Robots {
  const allowAll = process.env.NODE_ENV === "production";

  return {
    rules: allowAll
      ? {
          userAgent: "*",
          allow: "/",
        }
      : {
          userAgent: "*",
          disallow: "/",
        },
    sitemap: toAbsolute("/sitemap.xml"),
    host: SITE_URL,
  };
}
