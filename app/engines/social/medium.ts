import { Engine, EngineResult } from '../lib/engine';
import grab from 'grab-url';
import * as cheerio from 'cheerio';

const extractText = (element: any) => {
    return element.text().trim().replace(/\s+/g, ' ');
};

export const medium: Engine = {
    name: 'medium',
    categories: ['general', 'news'],
    request: async (query: string, params: any = {}) => {
        const pageno = params.pageno || 1;
        const url = `https://medium.com/search?q=${encodeURIComponent(query)}`;

        return await grab(url, {
            responseType: 'text',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
            }
        });

    },
    response: async (html: string) => {
        const $ = cheerio.load(html);
        const results: EngineResult[] = [];

        // Medium uses dynamic content, so we'll parse what we can from the initial HTML
        $('article').each((i, el) => {
            const element = $(el);
            const titleLink = element.find('h2 a, h3 a').first();
            const title = extractText(titleLink);
            const href = titleLink.attr('href');
            const url = href ? (href.startsWith('http') ? href : `https://medium.com${href}`) : '';
            const content = extractText(element.find('p').first());
            const author = extractText(element.find('a[rel="author"]').first());
            const readTime = extractText(element.find('[aria-label*="read"]').first());

            if (url && title) {
                results.push({
                    url,
                    title,
                    content: `${content} | By ${author || 'Unknown'} | ${readTime || ''}`,
                    engine: 'medium'
                });
            }
        });

        return results;
    }
};
