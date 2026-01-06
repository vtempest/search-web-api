import { Engine, EngineResult } from '../../lib/engine.js';
import grab from 'grab-url';
import { parseHTML } from 'linkedom';

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

        const { document } = parseHTML(data);

        document.querySelectorAll('ul.results-standard li a.ob').forEach((element) => {
            const elElem = element;
            const url = elElem.getAttribute('href');
            const $parent = elElem.parentElement;

            const title = $parent?.querySelector('h2 a')?.textContent?.trim() || '';
            const content = $parent?.querySelector('p.s')?.textContent?.trim() || '';

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
