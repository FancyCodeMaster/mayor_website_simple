import { z } from 'zod';

export const bilingualSchema = z.object({ en: z.string(), np: z.string() });

export const profileSchema = z.object({
	name: bilingualSchema,
	title: bilingualSchema,
	location: bilingualSchema,
	tagline: bilingualSchema,
	bio: z.object({ en: z.array(z.string()), np: z.array(z.string()) }),
	heroImage: z.object({ src: z.string().startsWith('/images/'), alt: bilingualSchema }),
	contactEmail: z.email(),
	contactPhone: z.string(),
	officeAddress: bilingualSchema,
	socialLinks: z.array(z.object({ platform: z.enum(['facebook', 'instagram', 'tiktok']), username: z.string(), url: z.url(), icon: z.string().startsWith('/images/') })),
});

export const workSchema = z.object({
	slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
	title: bilingualSchema,
	summary: bilingualSchema,
	body: z.object({ en: z.array(z.string()), np: z.array(z.string()) }),
	coverImage: z.object({ src: z.string().startsWith('/images/'), alt: bilingualSchema }),
	category: z.enum(['infrastructure', 'education', 'health', 'other']),
	status: z.enum(['planned', 'in_progress', 'completed', 'stalled']),
	startDate: z.iso.date(),
	endDate: z.iso.date().nullable(),
	location: bilingualSchema,
	featured: z.boolean(),
	draft: z.boolean(),
});

export const municipalitySchema = z.object({
	id: z.string(),
	name: bilingualSchema,
	wardCount: z.number().int().positive(),
});

export const issueCategorySchema = z.object({ id: z.string(), name: bilingualSchema });

export const updateSchema = z.object({
	slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
	type: z.enum(['speech', 'interview', 'press', 'activity']),
	date: z.iso.date(),
	summary: bilingualSchema,
	body: z.object({ en: z.array(z.string()), np: z.array(z.string()) }),
	coverImage: z.object({ src: z.string().startsWith('/images/'), alt: bilingualSchema }).nullable(),
	externalUrl: z.url().nullable(),
	sourceName: bilingualSchema.nullable(),
	featured: z.boolean(),
	draft: z.boolean(),
});

export type Profile = z.infer<typeof profileSchema>;
export type Work = z.infer<typeof workSchema>;
export type Update = z.infer<typeof updateSchema>;
export type Municipality = z.infer<typeof municipalitySchema>;
export type IssueCategory = z.infer<typeof issueCategorySchema>;
