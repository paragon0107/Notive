import { Client } from "@notionhq/client";
import { readFile } from "node:fs/promises";
import path from "node:path";

const loadEnvFromFile = async () => {
  const envPath = path.join(process.cwd(), ".env.local");
  try {
    const raw = await readFile(envPath, "utf8");
    raw.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const index = trimmed.indexOf("=");
      if (index === -1) return;
      const key = trimmed.slice(0, index).trim();
      const value = trimmed.slice(index + 1).trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    });
  } catch {
    // ignore if .env.local doesn't exist
  }
};

await loadEnvFromFile();

const token = process.env.NOTION_TOKEN;
const pageId = process.env.NOTION_PAGE_ID;

if (!token) {
  throw new Error("NOTION_TOKEN is required. Check .env.local.");
}

if (!pageId) {
  throw new Error("NOTION_PAGE_ID is required. Check .env.local.");
}

const notion = new Client({ auth: token });

const createDatabase = async (title, properties) => {
  const response = await notion.databases.create({
    parent: { type: "page_id", page_id: pageId },
    title: [{ type: "text", text: { content: title } }],
    properties,
  });
  return { id: response.id, url: response.url, title };
};

const assertProperties = async (databaseId, expectedKeys) => {
  const db = await notion.databases.retrieve({ database_id: databaseId });
  const keys = Object.keys(db.properties ?? {});
  const missing = expectedKeys.filter((key) => !keys.includes(key));
  if (missing.length > 0) {
    throw new Error(
      `Database ${databaseId} missing properties: ${missing.join(", ")}`
    );
  }
};

const main = async () => {
  const categoryOptions = [
    { name: "Default", color: "default" },
    { name: "Blue", color: "blue" },
    { name: "Green", color: "green" },
    { name: "Purple", color: "purple" },
  ];

  const seriesOptions = [
    { name: "Series A", color: "default" },
    { name: "Series B", color: "gray" },
  ];

  const contactOptions = [
    { name: "GitHub", color: "gray" },
    { name: "Email", color: "blue" },
    { name: "LinkedIn", color: "blue" },
    { name: "Instagram", color: "pink" },
    { name: "Custom", color: "default" },
  ];

  const projects = await createDatabase("Projects", {
    Name: { title: {} },
    Icon: { files: {} },
    Link: { url: {} },
    Order: { number: {} },
  });

  const contacts = await createDatabase("Contacts", {
    Name: { title: {} },
    Type: {
      select: {
        options: contactOptions,
      },
    },
    Label: { rich_text: {} },
    Value: { rich_text: {} },
    Icon: { files: {} },
    Order: { number: {} },
  });

  const posts = await createDatabase("Posts", {
    Title: { title: {} },
    Slug: { rich_text: {} },
    Published: { checkbox: {} },
    Date: { date: {} },
    Summary: { rich_text: {} },
    Thumbnail: { files: {} },
    Category: {
      multi_select: {
        options: categoryOptions,
      },
    },
    Series: { select: { options: seriesOptions } },
    Author: { people: {} },
  });

  const home = await createDatabase("Home", {
    Name: { title: {} },
    BlogName: { rich_text: {} },
    AboutMe: { rich_text: {} },
    ProfileName: { rich_text: {} },
    ProfileImage: { files: {} },
    CategoryList: { multi_select: { options: categoryOptions } },
    Projects: {
      relation: {
        database_id: projects.id,
        type: "single_property",
        single_property: {},
      },
    },
    Contacts: {
      relation: {
        database_id: contacts.id,
        type: "single_property",
        single_property: {},
      },
    },
    UseNotionProfileAsDefault: { checkbox: {} },
  });

  await assertProperties(posts.id, [
    "Title",
    "Slug",
    "Published",
    "Date",
    "Summary",
    "Thumbnail",
    "Category",
    "Series",
    "Author",
  ]);
  await assertProperties(contacts.id, [
    "Name",
    "Type",
    "Label",
    "Value",
    "Icon",
    "Order",
  ]);
  await assertProperties(projects.id, ["Name", "Icon", "Link", "Order"]);
  await assertProperties(home.id, [
    "Name",
    "BlogName",
    "AboutMe",
    "ProfileName",
    "ProfileImage",
    "CategoryList",
    "Projects",
    "Contacts",
    "UseNotionProfileAsDefault",
  ]);

  process.stdout.write(
    `Created databases:\n` +
      `Posts: ${posts.id}\n` +
      `Projects: ${projects.id}\n` +
      `Contacts: ${contacts.id}\n` +
      `Home: ${home.id}\n` +
      `\nURLs:\n` +
      `Posts: ${posts.url}\n` +
      `Projects: ${projects.url}\n` +
      `Contacts: ${contacts.url}\n` +
      `Home: ${home.url}\n`
  );
};

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
});
