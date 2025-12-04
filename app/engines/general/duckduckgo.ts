
import { Engine, EngineResult } from '../../lib/engine.js';
import grab from 'grab-url';
import { parseHTML } from 'linkedom';
export const duckduckgo: Engine = {
    name: 'duckduckgo',
    categories: ['general'],
    request: async (query: string, params: any = {}) => {
        // Using the HTML version of DDG which is easier to scrape and doesn't require VQD immediately for first page
        const url = 'https://html.duckduckgo.com/html/';

        const formData = new URLSearchParams();
        formData.append('q', query);
        formData.append('b', '');
        formData.append('kl', 'us-en'); // Default to US English

        return await grab(url, {
            responseType: 'text',
            post: true,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept-Language': 'en-US,en;q=0.9'
            },
            body: formData
        });

    },
    response: async (html: string) => {
        const { document } = parseHTML(html);
        const results: EngineResult[] = [];

        // DDG HTML results
        document.querySelectorAll('.result').forEach((el) => {
            const element = el;
            const link = element.querySelector('.result__title a');
            const url = link.getAttribute('href');
            const title = (link)?.textContent?.trim() || \'\';
            const content = (element.querySelectorAll('.result__snippet')?.textContent?.trim() || \'\');

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
