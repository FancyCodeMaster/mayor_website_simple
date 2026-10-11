import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { updateSchema, workSchema } from './lib/schema';

const workEn = defineCollection({
	loader: glob({ pattern: '**/en.md', base: './src/content/work' }),
	schema: workSchema.omit({ body: true }),
});

const workNp = defineCollection({
	loader: glob({ pattern: '**/np.md', base: './src/content/work' }),
	schema: workSchema.omit({ body: true }),
});

const updatesEn = defineCollection({
	loader: glob({ pattern: '**/en.md', base: './src/content/updates' }),
	schema: updateSchema.omit({ body: true }),
});

const updatesNp = defineCollection({
	loader: glob({ pattern: '**/np.md', base: './src/content/updates' }),
	schema: updateSchema.omit({ body: true }),
});

export const collections = { workEn, workNp, updatesEn, updatesNp };
