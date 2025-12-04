import { Engine, EngineResult } from '../lib/engine';
import grab from 'grab-url';
import * as cheerio from 'cheerio';

const extractText = (element: any) => {
    return element.text().trim().replace(/\s+/g, ' ');
};

export const yahoo: Engine = {
    name: 'yahoo',
    categories: ['general'],
    request: async (query: string, params: any = {}) => {
        const pageno = params.pageno || 1;
        const start = (pageno - 1) * 7; // Yahoo usually displays 7 results per page
        const url = `https://search.yahoo.com/search?p=${encodeURIComponent(query)}&b=${start + 1}`;

        return await grab(url, {
            responseType: 'text',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
            }
        });

    },
    response: async (html: string) => {
        const $ = cheerio.load(html);
        const results: EngineResult[] = [];

        $('.algo-sr').each((i, el) => {
            const element = $(el);
            const link = element.find('a').first();
            const url = link.attr('href');
            const title = extractText(link);
            const content = extractText(element.find('.compText'));

            if (url && title) {
                // Yahoo URLs are often wrapped, try to extract real URL if possible
                // For now, using the direct href
                results.push({
                    url,
                    title,
                    content,
                    engine: 'yahoo'
                });
            }
        });

        return results;
    }
};
