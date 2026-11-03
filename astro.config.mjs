import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
export default defineConfig({
  integrations: [mdx()],
  markdown: { shikiConfig: { theme: 'github-light' } },
  site: 'https://0verhydrated.github.io',
  base: '/vibe-coding-book',
  trailingSlash: 'always',
});
