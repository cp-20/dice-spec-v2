import 'server-only';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

export const getPublishedContents = async () => {
  const root = process.cwd();

  const categoryFolders = await fs.readdir(path.join(root, 'src/app/[locale]/blogs/[category]/[slug]/_contents'), {
    withFileTypes: true,
  });
  const categories = categoryFolders
    .filter((category) => category.isDirectory)
    .map((categoryFolder) => categoryFolder.name);

  const contents = await Promise.all(
    categories.map(async (category) => {
      const files = await fs.readdir(path.join(root, 'src/app/[locale]/blogs/[category]/[slug]/_contents', category));
      const slugs = files.filter((file) => file.endsWith('.mdx')).map((file) => file.replace('.mdx', ''));

      const filter = await Promise.all(
        slugs.map(async (slug) => {
          const file = await fs.readFile(
            path.join(root, 'src/app/[locale]/blogs/[category]/[slug]/_contents', category, `${slug}.mdx`),
            'utf-8',
          );
          // FIXME: more precise parsing
          return /^\s*---(.|\n)*\npublished: true\n(.|\n)*---/m.test(file);
        }),
      );
      const filtered = slugs.filter((_, i) => filter[i]);

      return {
        category,
        slugs: filtered,
      };
    }),
  );

  return contents;
};
