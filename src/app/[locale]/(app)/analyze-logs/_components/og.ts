export const encodeOgImageId = (id: string) => `og_${id}`;

const ogImageRegex = new RegExp('^og_[a-zA-Z0-9_-]+$');
export const decodeOgImageId = (ogp: string) => {
  if (!ogImageRegex.test(ogp)) return null;

  return ogp.slice(3); // Remove 'og_' prefix
};
