import type { Metadata } from "next";
import {
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_URL,
} from "@/libs/site-config";

const metadataBase = new URL(SITE_URL);
const toAbsoluteUrl = (path: string) => new URL(path, metadataBase).toString();

type MetadataInput = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "article" | "website";
  noIndex?: boolean;
  keywords?: string[];
};

export const buildMetadata = ({
  title,
  description,
  path = "/",
  image,
  type = "website",
  noIndex = false,
  keywords = [],
}: MetadataInput): Metadata => {
  const resolvedTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const resolvedDescription = description ?? SITE_DESCRIPTION;
  const url = toAbsoluteUrl(path);
  const imageUrl = image ? toAbsoluteUrl(image) : undefined;
  const resolvedKeywords = [...new Set([...SITE_KEYWORDS, ...keywords])];

  return {
    metadataBase,
    applicationName: SITE_NAME,
    title: resolvedTitle,
    description: resolvedDescription,
    keywords: resolvedKeywords,
    alternates: {
      canonical: url,
    },
    icons: {
      icon: [{ url: "/favicon.ico", type: "image/x-icon" }],
      shortcut: [{ url: "/favicon.ico", type: "image/x-icon" }],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          nocache: true,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    openGraph: {
      type,
      title: resolvedTitle,
      description: resolvedDescription,
      url,
      siteName: SITE_NAME,
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title: resolvedTitle,
      description: resolvedDescription,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
};
