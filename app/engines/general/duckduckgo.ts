
import { Engine, EngineResult } from '../../lib/engine.js';
import { parseHTML } from 'linkedom';

export const duckduckgo: Engine = {
    name: 'duckduckgo',
    categories: ['general'],
    request: async (query: string, params: any = {}) => {
        const url = 'https://html.duckduckgo.com/html/';

        const formData = new URLSearchParams();
        formData.append('q', query);
        formData.append('b', '');
        formData.append('kl', 'us-en');

        const response = await fetch(url, {
            method: 'POST',
            body: formData,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        });

        return await response.text();
    },
    response: async (response: any) => {
        const html = typeof response === 'string' ? response : response.data || response;
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
