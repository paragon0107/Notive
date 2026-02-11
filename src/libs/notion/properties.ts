import type {
  PageObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";

const getPlainText = (value: RichTextItemResponse[]) =>
  value.map((item) => item.plain_text).join("");

export const getTitleProperty = (page: PageObjectResponse) => {
  const titleProp =
    page.properties.Title?.type === "title"
      ? page.properties.Title
      : page.properties.Name?.type === "title"
        ? page.properties.Name
        : null;
  return titleProp ? getPlainText(titleProp.title) : "Untitled";
};

export const getRichTextProperty = (
  page: PageObjectResponse,
  propertyName: string
) => {
  const prop =
    page.properties[propertyName]?.type === "rich_text"
      ? page.properties[propertyName]
      : null;
  return prop ? getPlainText(prop.rich_text) : undefined;
};

export const getCheckboxProperty = (
  page: PageObjectResponse,
  propertyName: string
) => {
  const prop =
    page.properties[propertyName]?.type === "checkbox"
      ? page.properties[propertyName]
      : null;
  return prop ? prop.checkbox : false;
};

export const getDateProperty = (
  page: PageObjectResponse,
  propertyName: string
) => {
  const prop =
    page.properties[propertyName]?.type === "date"
      ? page.properties[propertyName]
      : null;
  return prop?.date?.start ?? undefined;
};

export const getFilesProperty = (
  page: PageObjectResponse,
  propertyName: string
) => {
  const prop =
    page.properties[propertyName]?.type === "files"
      ? page.properties[propertyName]
      : null;
  if (!prop || prop.files.length === 0) return undefined;
  const file = prop.files[0];
  if (file.type === "external" && "external" in file) return file.external.url;
  if (file.type === "file" && "file" in file) return file.file.url;
  return undefined;
};

export const getRelationPropertyIds = (
  page: PageObjectResponse,
  propertyName: string
) => {
  const prop =
    page.properties[propertyName]?.type === "relation"
      ? page.properties[propertyName]
      : null;
  return prop ? prop.relation.map((rel) => rel.id) : [];
};

export const getPeoplePropertyNames = (
  page: PageObjectResponse,
  propertyName: string
) => {
  const prop =
    page.properties[propertyName]?.type === "people"
      ? page.properties[propertyName]
      : null;
  return prop
    ? prop.people.map((person) => ("name" in person ? person.name ?? "" : ""))
    : [];
};

export const getNumberProperty = (
  page: PageObjectResponse,
  propertyName: string
) => {
  const prop =
    page.properties[propertyName]?.type === "number"
      ? page.properties[propertyName]
      : null;
  return prop?.number ?? undefined;
};

export const getSelectProperty = (
  page: PageObjectResponse,
  propertyName: string
) => {
  const prop =
    page.properties[propertyName]?.type === "select"
      ? page.properties[propertyName]
      : null;
  return prop?.select?.name ?? undefined;
};

export const getMultiSelectOptions = (
  page: PageObjectResponse,
  propertyName: string
) => {
  const prop =
    page.properties[propertyName]?.type === "multi_select"
      ? page.properties[propertyName]
      : null;
  return prop?.multi_select.map((option) => ({
    id: option.id,
    name: option.name ?? "",
    color: option.color ?? undefined,
  })) ?? [];
};
