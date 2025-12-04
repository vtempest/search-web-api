import { Engine, EngineResult } from '../lib/engine.js';
import grab from 'grab-url';
import * as cheerio from 'cheerio';
import { extractText } from '../lib/utils.js';

export const yahoo_news: Engine = {
    name: 'yahoo_news',
    categories: ['news'],
    request: async (query: string, params: any = {}) => {
        const pageno = params.pageno || 1;
        const offset = (pageno - 1) * 10 + 1;

        const searchParams = new URLSearchParams({
            p: query
        });

        const url = `https://news.search.yahoo.com/search?${searchParams.toString()}&b=${offset}`;

        return await grab(url, {
            responseType: 'text',
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            }
        });

    },
    response: async (html: string) => {
        const $ = cheerio.load(html);
        const results: EngineResult[] = [];

        // Parse results from Yahoo News search
        $('ol.searchCenterMiddle li, ol[class*="reg"] li').each((i, el) => {
            const element = $(el);

            const link = element.find('h4 a, .fz-16 a, .title a').first();
            let url = link.attr('href');

            if (!url) {
                return; // continue to next iteration
            }

            // Parse Yahoo's redirect URL to get the real URL
            // Yahoo URLs are like: https://r.search.yahoo.com/_ylt=...;_ylu=.../RU=.../RK=.../RS=...
            if (url.includes('r.search.yahoo.com') || url.includes('/RU=')) {
                try {
                    const urlObj = new URL(url);
                    const ruMatch = url.match(/\/RU=([^/]+)/);
                    if (ruMatch) {
                        url = decodeURIComponent(ruMatch[1]);
                    } else if (urlObj.searchParams.has('url')) {
                        url = urlObj.searchParams.get('url') || url;
                    }
                } catch (e) {
                    // If parsing fails, use URL as-is
                }
            }

            const title = extractText(link);
            const content = extractText(element.find('p, .compText, div[class*="desc"]').first());
            const thumbnail = element.find('img').attr('data-src') || element.find('img').attr('src');

            if (url && title) {
                results.push({
                    url,
                    title,
                    content,
                    thumbnail,
                    engine: 'yahoo_news'
                });
            }
        });

        return results;
    }
};
