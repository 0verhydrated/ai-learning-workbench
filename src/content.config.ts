import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
const schema = z.object({
 title: z.string(), description: z.string(), order: z.number(),
 part: z.enum(['Foundations', 'Working with AI', 'Building reliably', 'Advanced practice']),
 duration: z.string()
});
export const collections = {
 lessons: defineCollection({loader: glob({pattern: '**/*.{md,mdx}', base: './src/content/lessons'}), schema}),
 korean: defineCollection({loader: glob({pattern: '**/*.{md,mdx}', base: './src/content/korean'}), schema}),
 academy: defineCollection({
  loader: glob({pattern: '**/*.{md,mdx}', base: './src/content/academy'}),
  schema: z.object({title:z.string(),description:z.string(),order:z.number().int().positive(),duration:z.string(),course:z.enum(['ai-foundations','agents-tools','automation']),lang:z.enum(['en','ko'])})
 })
};
