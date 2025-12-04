
import { Engine, EngineResult } from '../lib/engine.js';
import grab from 'grab-url';
import * as cheerio from 'cheerio';
import { extractText } from '../lib/utils.js';

export const bing: Engine = {
    name: 'bing',
    categories: ['general'],
    request: async (query: string, params: any = {}) => {
        const pageno = params.pageno || 1;
        const first = (pageno - 1) * 10 + 1;
        const url = `https://www.bing.com/search?q=${encodeURIComponent(query)}&first=${first}`;

        return await grab(url, {
            responseType: 'text',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cookie': 'CONSENT=YES+'
            }
        });

    },
    response: async (html: string) => {
        const $ = cheerio.load(html);
        const results: EngineResult[] = [];

        // Bing results are typically in li.b_algo
        $('li.b_algo').each((i, el) => {
            const element = $(el);
            const link = element.find('h2 a').first();
            const url = link.attr('href');
            const title = extractText(link);
            const content = extractText(element.find('.b_caption p'));

            if (url && title) {
                results.push({
                    url,
                    title,
                    content,
                    engine: 'bing'
                });
            }
        });

        return results;
    }
};
