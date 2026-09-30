import profileData from '../data/profile.json';
import workData from '../data/work.json';
import updateData from '../data/updates.json';
import municipalitiesData from '../data/municipalities.json';
import issueCategoriesData from '../data/issue-categories.json';
import { profileSchema, workSchema, updateSchema, municipalitySchema, issueCategorySchema, type Profile, type Work, type Update, type Municipality, type IssueCategory } from './schema';

export type { Work, Update, Municipality, IssueCategory } from './schema';
export type Locale = 'en' | 'np';

export const profile: Profile = profileSchema.parse(profileData);
export const works: Work[] = workData.map((item) => workSchema.parse(item));
export const featuredWorks = works.filter((work) => work.featured && !work.draft).slice(0, 3);
export const publishedWorks = works.filter((work) => !work.draft);
export const updates: Update[] = updateData.map((item) => updateSchema.parse(item));
export const featuredUpdates = updates.filter((update) => update.featured && !update.draft).slice(0, 3);
export const publishedUpdates = updates.filter((update) => !update.draft);
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
