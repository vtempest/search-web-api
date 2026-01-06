
import { Engine, EngineResult, extractResponseData } from '../../engine.js';
import { parseHTML } from 'linkedom';
import grab from 'grab-url';

export const duckduckgo: Engine = {
    name: 'duckduckgo',
    categories: ['general'],
    request: async (query: string, params: any = {}) => {
        return await grab( 'https://html.duckduckgo.com/html', {
            post: true,
            q: query,
            b: '',
            kl: 'us-en',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept-Language': 'en-US,en;q=0.9'
            },
            responseType: 'text'
        });
    },
    response: async (response: any) => {
        const html = extractResponseData(response);
        const { document } = parseHTML(html);
        const results: EngineResult[] = [];

        // DDG HTML results
        document.querySelectorAll('.result').forEach((el) => {
            const element = el;
            const link = element.querySelector('.result__title a');
            const url = link?.getAttribute('href');
            const title = link?.textContent?.trim() || '';
            const content = element.querySelector('.result__snippet')?.textContent?.trim() || '';

            if (url && title) {
                results.push({
                    url,
                    title,
                    content,
                    engine: 'duckduckgo'
                });
            }
        });

        return results;
    }
};
