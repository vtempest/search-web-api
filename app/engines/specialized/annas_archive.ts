import { Engine, EngineResult } from '../../lib/engine.js';
import grab from 'grab-url';
import * as cheerio from 'cheerio';

export const annas_archive: Engine = {
    name: 'annas_archive',
    categories: ['specialized', 'books', 'files'],
    request: async (query: string, params: any = {}) => {
        const pageno = params.pageno || 1;
        const url = `https://annas-archive.org/search?q=${encodeURIComponent(query)}&page=${pageno}`;

        return await grab(url, {
            responseType: 'text',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
            },
            timeout: 10000
        });
    },
    response: async (data: any) => {
        const results: EngineResult[] = [];

        if (!data || typeof data !== 'string') {
            return results;
        }

        const $ = cheerio.load(data);

        $('main div.js-aarecord-list-outer > div').each((_, element) => {
            const $el = $(element);

            const href = $el.find('a').first().attr('href');
            if (!href) return;

            const url = `https://annas-archive.org${href}`;
            const title = $el.find('a[href^="/md5"]').text().trim();
            const author = $el.find('a[href^="/search"]').first().text().trim();
            const publisher = $el.find('a[href^="/search"]').eq(1).text().trim();
            const description = $el.find('div.relative').text().trim();
            const thumbnail = $el.find('img').attr('src');

            const content = [
                description,
                author ? `Author: ${author}` : '',
                publisher ? `Publisher: ${publisher}` : ''
            ].filter(Boolean).join('\n');

            results.push({
                url,
                title,
                content,
                engine: 'annas_archive',
                thumbnail
            });
        });

        return results;
    }
};
