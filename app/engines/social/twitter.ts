import { Engine, EngineResult } from '../lib/engine';
import grab from 'grab-url';
import * as cheerio from 'cheerio';

const extractText = (element: any) => {
    return element.text().trim().replace(/\s+/g, ' ');
};

export const twitter: Engine = {
    name: 'twitter',
    categories: ['social media'],
    request: async (query: string, params: any = {}) => {
        const pageno = params.pageno || 1;
        // Using nitter.net as a privacy-friendly Twitter frontend
        const url = `https://nitter.net/search?f=tweets&q=${encodeURIComponent(query)}`;

        return await grab(url, {
            responseType: 'text',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
            }
        });

    },
    response: async (html: string) => {
        const $ = cheerio.load(html);
        const results: EngineResult[] = [];

        $('.timeline-item').each((i, el) => {
            const element = $(el);
            const tweetLink = element.find('.tweet-link');
            const username = extractText(element.find('.username'));
            const fullname = extractText(element.find('.fullname'));
            const content = extractText(element.find('.tweet-content'));
            const timestamp = extractText(element.find('.tweet-date a'));
            const stats = extractText(element.find('.tweet-stats'));

            const href = tweetLink.attr('href');
            const url = href ? `https://twitter.com${href.replace('/i/web', '')}` : '';

            if (url && content) {
                results.push({
                    url,
                    title: `${fullname} (@${username})`,
                    content: `${content} | ${timestamp} | ${stats}`,
                    engine: 'twitter'
                });
            }
        });

        return results;
    }
};
