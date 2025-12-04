import { Engine, EngineResult } from '../../lib/engine.js';
import grab from 'grab-url';
import * as cheerio from 'cheerio';

export const goodreads: Engine = {
    name: 'goodreads',
    categories: ['specialized', 'books'],
    request: async (query: string, params: any = {}) => {
        const pageno = params.pageno || 1;
        const url = `https://www.goodreads.com/search?q=${encodeURIComponent(query)}&page=${pageno}`;

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

        $('table tr').each((_, element) => {
            const $row = $(element);

            const $link = $row.find('a.bookTitle');
            const href = $link.attr('href');
            const title = $link.text().trim();

            if (!href || !title) return;

            const thumbnail = $row.find('img.bookCover').attr('src');
            const author = $row.find('a.authorName').text().trim();
            const info = $row.find('span.uitext').text().trim();

            results.push({
                url: `https://www.goodreads.com${href}`,
                title,
                content: info,
                engine: 'goodreads',
                thumbnail,
                metadata: author
            });
        });

        return results;
    }
};
