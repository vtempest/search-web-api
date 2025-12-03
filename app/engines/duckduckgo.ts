
import { Engine, EngineResult } from '../lib/engine.js';
import * as cheerio from 'cheerio';
import { extractText } from '../lib/utils.js';

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

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept-Language': 'en-US,en;q=0.9'
            },
            body: formData
        });

        return await response.text();
    },
    response: async (html: string) => {
        const $ = cheerio.load(html);
        const results: EngineResult[] = [];

        // DDG HTML results
        $('.result').each((i, el) => {
            const element = $(el);
            const link = element.find('.result__title a').first();
            const url = link.attr('href');
            const title = extractText(link);
            const content = extractText(element.find('.result__snippet'));

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
