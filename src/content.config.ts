import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
const lessons = defineCollection({
 loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/lessons' }),
 schema: z.object({ title: z.string(), description: z.string(), order: z.number(), part: z.enum(['Foundations', 'Working with AI', 'Building reliably', 'Advanced practice']), duration: z.string() })
});
export const collections = { lessons };
