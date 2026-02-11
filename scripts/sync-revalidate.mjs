import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const configPath = path.join(root, "src", "libs", "revalidate.ts");
const targets = [
  "src/app/page.tsx",
  "src/app/posts/page.tsx",
  "src/app/post/[slug]/page.tsx",
  "src/app/category/page.tsx",
  "src/app/category/[slug]/page.tsx",
  "src/app/series/[slug]/page.tsx",
];

const main = async () => {
  const config = await readFile(configPath, "utf8");
  const match = config.match(/REVALIDATE_SECONDS\s*=\s*(\d+)/);
  if (!match) {
    throw new Error("REVALIDATE_SECONDS not found in src/libs/revalidate.ts");
  }

  const value = match[1];
  const exportLine = `export const revalidate = ${value};`;

  await Promise.all(
    targets.map(async (target) => {
      const absolute = path.join(root, target);
      const source = await readFile(absolute, "utf8");
      const pattern = /export const revalidate = \d+;/;
      if (!pattern.test(source)) {
        throw new Error(`Failed to find revalidate in ${target}`);
      }

      const next = source.replace(pattern, exportLine);

      await writeFile(absolute, next, "utf8");
    })
  );

  process.stdout.write(
    `Updated revalidate to ${value} in ${targets.length} files.\n`
  );
};

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
});
