import type { Metadata } from "next";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/libs/site-config";

const toAbsoluteUrl = (path: string) => new URL(path, SITE_URL).toString();

type MetadataInput = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "article" | "website";
};

export const buildMetadata = ({
  title,
  description,
  path = "/",
  image,
  type = "website",
}: MetadataInput): Metadata => {
  const resolvedTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const resolvedDescription = description ?? SITE_DESCRIPTION;
  const url = toAbsoluteUrl(path);
  const imageUrl = image ? toAbsoluteUrl(image) : undefined;

  return {
    title: resolvedTitle,
    description: resolvedDescription,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type,
      title: resolvedTitle,
      description: resolvedDescription,
      url,
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
