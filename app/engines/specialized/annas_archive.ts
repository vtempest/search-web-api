import { Engine, EngineResult } from '../../lib/engine.js';
import grab from 'grab-url';
import { parseHTML } from 'linkedom';

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

        const { document } = parseHTML(data);

        document.querySelectorAll('main div.js-aarecord-list-outer > div').forEach((element) => {
            const elElem = element;

            const href = elElem.querySelector('a')?.getAttribute('href');
            if (!href) return;

            const url = `https://annas-archive.org${href}`;
            const title = elElem.querySelector('a[href^="/md5"]')?.textContent?.trim() || '';
            const author = elElem.querySelector('a[href^="/search"]')?.textContent?.trim() || '';
            const publisher = elElem.querySelectorAll('a[href^="/search"]')[1]?.textContent?.trim() || '';
            const description = elElem.querySelector('div.relative')?.textContent?.trim() || '';
            const thumbnail = elElem.querySelector('img')?.getAttribute('src') || undefined;

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
