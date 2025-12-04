import { Engine, EngineResult } from '../../lib/engine.js';
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

            const $link = $row.querySelectorAll('a.bookTitle');
            const href = $link.getAttribute('href');
            const title = $link.textContent?.trim() || \'\';

            if (!href || !title) return;

            const thumbnail = $row.querySelectorAll('img.bookCover').getAttribute('src');
            const author = $row.querySelectorAll('a.authorName').textContent?.trim() || \'\';
            const info = $row.querySelectorAll('span.uitext').textContent?.trim() || \'\';

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
