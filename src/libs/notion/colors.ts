export const notionColorClass = (color?: string) => {
  if (!color) return "color-default";
  const normalized = color.toLowerCase().replace(" ", "-");
  return `color-${normalized}`;
};
