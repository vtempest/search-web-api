import { Engine, EngineResult } from '../../lib/engine.js';
import grab from 'grab-url';
import * as cheerio from 'cheerio';

export const openclipart: Engine = {
    name: 'openclipart',
    categories: ['images'],
    request: async (query: string, params: any = {}) => {
        const pageno = params.pageno || 1;
        const url = `https://openclipart.org/search/?query=${encodeURIComponent(query)}&p=${pageno}`;

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

        $('div.gallery div.artwork').each((_, element) => {
            const $el = $(element);

            const $link = $el.find('a').first();
            const href = $link.attr('href');
            const title = $link.find('img').attr('alt');
            const imgSrc = $link.find('img').attr('src');

            if (!href || !title || !imgSrc) return;

            results.push({
                url: `https://openclipart.org${href}`,
                title,
                content: '',
                engine: 'openclipart',
                img_src: `https://openclipart.org${imgSrc}`
            });
        });

        return results;
    }
};
