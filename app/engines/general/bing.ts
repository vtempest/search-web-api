
import { Engine, EngineResult } from '../../lib/engine.js';
import grab from 'grab-url';
import { parseHTML } from 'linkedom';

export const bing: Engine = {
    name: 'bing',
    categories: ['general'],
    request: async (query: string, params: any = {}) => {
        return await grab('https://www.bing.com/search', {
            q: encodeURIComponent(query),
            first: ((params.pageno || 1) - 1) * 10 + 1,
            responseType: 'text',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cookie': 'CONSENT=YES+'
            }
        });
    },
    response: async (response: any) => {
        const html = response.data || response;
        const { document } = parseHTML(html);
        const results: EngineResult[] = [];

        document.querySelectorAll('li.b_algo').forEach((element) => {
            const link = element.querySelector('h2 a');
            const url = link?.getAttribute('href');
            const title = link?.textContent?.trim() || '';
            const contentEl = element.querySelector('.b_caption p');
            const content = contentEl?.textContent?.trim() || '';

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
