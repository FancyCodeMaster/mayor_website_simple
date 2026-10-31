import { publishedUpdates, publishedWorks } from '../lib/content';

export const prerender = true;

const site = 'https://shyamsundardhimal.com.np';
const staticPaths = ['/', '/en', '/work', '/en/work', '/updates', '/en/updates'];

function escapeXml(value: string) {
	return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function alternateLinks(path: string) {
	const nepaliPath = path.startsWith('/en') ? path.replace(/^\/en/, '') || '/' : path;
	const englishPath = nepaliPath === '/' ? '/en' : `/en${nepaliPath}`;
	return `<xhtml:link rel="alternate" hreflang="ne" href="${site}${nepaliPath}"/><xhtml:link rel="alternate" hreflang="en" href="${site}${englishPath}"/><xhtml:link rel="alternate" hreflang="x-default" href="${site}${nepaliPath}"/>`;
}

export function GET() {
	const paths = [
		...staticPaths,
		...publishedWorks.flatMap((work) => [`/work/${work.slug}`, `/en/work/${work.slug}`]),
		...publishedUpdates.flatMap((update) => [`/updates/${update.slug}`, `/en/updates/${update.slug}`]),
	];
	const uniquePaths = [...new Set(paths)];
	const body = uniquePaths.map((path) => `<url><loc>${escapeXml(`${site}${path}`)}</loc>${alternateLinks(path)}</url>`).join('');
	return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${body}</urlset>`, {
		headers: { 'Content-Type': 'application/xml; charset=utf-8' },
	});
}
