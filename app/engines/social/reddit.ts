
import { Engine, EngineResult } from '../lib/engine.js';
import grab from 'grab-url';
import * as cheerio from 'cheerio';
import { extractText } from '../lib/utils.js';

export const reddit: Engine = {
    name: 'reddit',
    categories: ['social media'],
    request: async (query: string, params: any = {}) => {
        const url = `https://old.reddit.com/search?q=${encodeURIComponent(query)}&sort=relevance&t=all`;
        return {
            url,
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            data: {},
            ...params
        };
    },
    response: async (params) => {
        return await grab(params.url, { headers: params.headers });
        const html = await response.text();
        const $ = cheerio.load(html);
        const results: EngineResult[] = [];

        $('.search-result').each((i, el) => {
            const titleLink = $(el).find('a.search-title');
            const title = extractText(titleLink);
            const link = titleLink.attr('href');
            const content = extractText($(el).find('.search-result-body')); // Reddit doesn't always show snippets in old design easily, but let's try

            if (title && link) {
                results.push({
                    title,
                    link: link.startsWith('http') ? link : `https://old.reddit.com${link}`,
                    content: content || '',
                    engine: 'reddit'
                });
            }
        });

        return results;
    }
};
