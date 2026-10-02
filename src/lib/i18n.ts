import en from '../locales/en.json';
import ne from '../locales/ne.json';
import type { Locale } from './content';

const locales = { en, np: ne };

export function getUi(locale: Locale) {
	return locales[locale];
}

export function alternateUrl(locale: Locale, pathname = '/') {
	const path = pathname === '/en' ? '/' : pathname.replace(/^\/en(?=\/)/, '');
	return locale === 'en' ? path : path === '/' ? '/en' : `/en${path}`;
}
