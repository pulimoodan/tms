import type { Plugin } from 'vite';

/**
 * Vite plugin that updates og:image and twitter:image meta tags
 * to point to the app's opengraph image.
 */
export function metaImagesPlugin(): Plugin {
  return {
    name: 'vite-plugin-meta-images',
    transformIndexHtml(html) {
      const baseUrl = process.env.VITE_APP_URL || '';
      const imageUrl = baseUrl ? `${baseUrl}/opengraph.jpg` : '/opengraph.jpg';

      html = html.replace(
        /<meta\s+property="og:image"\s+content="[^"]*"\s*\/>/g,
        `<meta property="og:image" content="${imageUrl}" />`,
      );

      html = html.replace(
        /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/>/g,
        `<meta name="twitter:image" content="${imageUrl}" />`,
      );

      return html;
    },
  };
}
