import { Engine, EngineResult } from '../../lib/engine.js';
import grab from 'grab-url';
import * as cheerio from 'cheerio';

export const mojeek: Engine = {
    name: 'mojeek',
    categories: ['general', 'web'],
    request: async (query: string, params: any = {}) => {
        const pageno = params.pageno || 1;
        const offset = 10 * (pageno - 1);

        const url = `https://www.mojeek.com/search?q=${encodeURIComponent(query)}&s=${offset}&safe=0`;

        return await grab(url, {
            responseType: 'text',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
            }
        });
    },
    response: async (data: any) => {
        const results: EngineResult[] = [];

        if (!data || typeof data !== 'string') {
            return results;
        }

        const $ = cheerio.load(data);

        $('ul.results-standard li a.ob').each((_, element) => {
            const $el = $(element);
            const url = $el.attr('href');
            const $parent = $el.parent();

            const title = $parent.find('h2 a').text().trim();
            const content = $parent.find('p.s').text().trim();

            if (url && title) {
                results.push({
                    url,
                    title,
                    content,
                    engine: 'mojeek'
                });
            }
        });

        return results;
    }
};
