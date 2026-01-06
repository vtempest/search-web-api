import { Engine, EngineResult } from '../../engine.js';
import grab from 'grab-url';
import { parseHTML } from 'linkedom';

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

        const { document } = parseHTML(data);

        document.querySelectorAll('table tr').forEach((element) => {
            const rowElem = element;

            const $link = rowElem.querySelector('a.bookTitle');
            const href = $link?.getAttribute('href');
            const title = $link?.textContent?.trim() || '';

            if (!href || !title) return;

            const thumbnail = rowElem.querySelector('img.bookCover')?.getAttribute('src') || undefined;
            const author = rowElem.querySelector('a.authorName')?.textContent?.trim() || '';
            const info = rowElem.querySelector('span.uitext')?.textContent?.trim() || '';

            const content = [info, author ? `Author: ${author}` : ''].filter(Boolean).join(' | ');

            results.push({
                url: `https://www.goodreads.com${href}`,
                title,
                content,
                engine: 'goodreads',
                thumbnail
            });
        });

        return results;
    }
};
