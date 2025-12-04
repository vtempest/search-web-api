import { Engine, EngineResult } from '../../lib/engine.js';
import grab from 'grab-url';
import * as cheerio from 'cheerio';

export const google_news: Engine = {
    name: 'google_news',
    categories: ['news'],
    request: async (query: string, params: any = {}) => {
        const hl = 'en';
        const gl = 'US';
        const ceid = 'US:en';

        const url = `https://news.google.com/search?q=${encodeURIComponent(query)}&hl=${hl}&gl=${gl}&ceid=${ceid}`;

        return await grab(url, {
            responseType: 'text',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Cookie': 'CONSENT=YES+; SOCS=CAESBQgYEgAgAA=='
            }
        });
    },
    response: async (data: any) => {
        const results: EngineResult[] = [];

        if (!data || typeof data !== 'string') {
            return results;
        }

        const $ = cheerio.load(data);

        $('div.xrnccd').each((_, element) => {
            const $el = $(element);

            // Extract the article link
            const href = $el.find('article a').first().attr('href');
            if (!href) return;

            // Decode the Google News internal link
            try {
                const hrefParts = href.split('/');
                const encodedUrl = hrefParts[hrefParts.length - 1].split('?')[0];
                const decodedBytes = Buffer.from(encodedUrl + '====', 'base64url');
                const decodedStr = decodedBytes.toString('utf-8');
                const httpIndex = decodedStr.indexOf('http');
                if (httpIndex === -1) return;
                const actualUrl = decodedStr.slice(httpIndex).split('\xd2')[0];

                const title = $el.find('article h3').first().text().trim();
                const pubDate = $el.find('article time').text().trim();
                const pubOrigin = $el.find('article a[data-n-tid]').text().trim();
                const thumbnail = $el.prev('a').find('figure img').attr('src') || '';

                const content = [pubOrigin, pubDate].filter(Boolean).join(' / ');

                results.push({
                    url: actualUrl,
                    title,
                    content,
                    engine: 'google_news',
                    thumbnail
                });
            } catch (err) {
                // Skip malformed URLs
                return;
            }
        });

        return results;
    }
};
