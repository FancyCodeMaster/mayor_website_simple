import { getCollection } from 'astro:content';
import profileData from '../data/profile.json';
import municipalitiesData from '../data/municipalities.json';
import issueCategoriesData from '../data/issue-categories.json';
import { profileSchema, workSchema, updateSchema, municipalitySchema, issueCategorySchema, type Profile, type Work, type Update, type Municipality, type IssueCategory } from './schema';

export type { Work, Update, Municipality, IssueCategory } from './schema';
export type Locale = 'en' | 'np';

function markdownBlocks(body: string | undefined) {
	const normalized = body?.trim() ?? '';
	return normalized ? normalized.split(/\n\s*\n/) : [];
}

function mergeEntries<T extends { slug: string }>(english: { data: T; body?: string }[], nepali: { data: T; body?: string }[]) {
	const bySlug = new Map<string, { en?: (typeof english)[number]; np?: (typeof nepali)[number] }>();
	for (const entry of english) {
		if (bySlug.get(entry.data.slug)?.en) throw new Error(`Duplicate content slug: ${entry.data.slug}`);
		bySlug.set(entry.data.slug, { ...bySlug.get(entry.data.slug), en: entry });
	}
	for (const entry of nepali) {
		if (bySlug.get(entry.data.slug)?.np) throw new Error(`Duplicate content slug: ${entry.data.slug}`);
		bySlug.set(entry.data.slug, { ...bySlug.get(entry.data.slug), np: entry });
	}
	return bySlug;
}

const workEntriesEn = await getCollection('workEn');
const workEntriesNp = await getCollection('workNp');
export const works: Work[] = [...mergeEntries(workEntriesEn, workEntriesNp)].map(([slug, entries]) => {
	const source = entries.en ?? entries.np;
	if (!source) throw new Error(`Missing content for work: ${slug}`);
	return workSchema.parse({ ...source.data, slug, body: { en: markdownBlocks(entries.en?.body), np: markdownBlocks(entries.np?.body) } });
});
export const publishedWorks = works.filter((work) => !work.draft).sort((a, b) => b.startDate.localeCompare(a.startDate));
export const featuredWorks = publishedWorks.slice(0, 3);

const updateEntriesEn = await getCollection('updatesEn');
const updateEntriesNp = await getCollection('updatesNp');
export const updates: Update[] = [...mergeEntries(updateEntriesEn, updateEntriesNp)].map(([slug, entries]) => {
	const source = entries.en ?? entries.np;
	if (!source) throw new Error(`Missing content for update: ${slug}`);
	return updateSchema.parse({ ...source.data, slug, body: { en: markdownBlocks(entries.en?.body), np: markdownBlocks(entries.np?.body) } });
});
export const publishedUpdates = updates.filter((update) => !update.draft).sort((a, b) => b.date.localeCompare(a.date));
export const featuredUpdates = publishedUpdates.slice(0, 3);

export const profile: Profile = profileSchema.parse(profileData);
export const municipalities: Municipality[] = municipalitiesData.map((item) => municipalitySchema.parse(item));
export const issueCategories: IssueCategory[] = issueCategoriesData.map((item) => issueCategorySchema.parse(item));

export function pick(field: { en: string; np: string }, locale: Locale) {
	const value = field[locale];
	return { value: value || field[locale === 'en' ? 'np' : 'en'], isFallback: !value };
}

export function pickBlocks(field: { en: string[]; np: string[] }, locale: Locale) {
	const value = field[locale];
	return { value: value.length > 0 ? value : field[locale === 'en' ? 'np' : 'en'], isFallback: value.length === 0 };
}
