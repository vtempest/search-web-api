import { Engine, EngineResult } from '../lib/engine';
import grab from 'grab-url';
import * as cheerio from 'cheerio';

const extractText = (element: any) => {
    return element.text().trim().replace(/\s+/g, ' ');
};

export const brave: Engine = {
    name: 'brave',
    categories: ['general'],
    request: async (query: string, params: any = {}) => {
        const pageno = params.pageno || 1;
        const offset = (pageno - 1) * 1; // Brave pagination is tricky without API, trying basic offset if supported or just page
        // Brave Search scraping is difficult due to dynamic content. 
        // Let's try a basic fetch to see if we get HTML.
        const url = `https://search.brave.com/search?q=${encodeURIComponent(query)}&page=${pageno}`;

        return await grab(url, {
            responseType: 'text',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
            }
        });

    },
    response: async (html: string) => {
        const $ = cheerio.load(html);
        const results: EngineResult[] = [];

        $('.snippet').each((i, el) => {
            const element = $(el);
            const link = element.find('a').first();
            const url = link.attr('href');
            const title = extractText(element.find('.title'));
            const content = extractText(element.find('.snippet-description, .snippet-content'));

            if (url && title) {
                results.push({
                    url,
                    title,
                    content,
                    engine: 'brave'
                });
            }
        });

        return results;
    }
};
