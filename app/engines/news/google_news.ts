import { Engine, EngineResult } from '../../lib/engine.js';
import grab from 'grab-url';
import { parseHTML } from 'linkedom';

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

        const { document } = parseHTML(data);

        document.querySelectorAll('div.xrnccd').forEach((element) => {
            const elElem = element;

            // Extract the article link
            const href = elElem.querySelector('article a')?.getAttribute('href');
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

                const title = elElem.querySelector('article h3')?.textContent?.trim() || '';
                const pubDate = elElem.querySelector('article time')?.textContent?.trim() || '';
                const pubOrigin = elElem.querySelector('article a[data-n-tid]')?.textContent?.trim() || '';
                const thumbnail = elElem.previousElementSibling?.querySelector('figure img')?.getAttribute('src') || undefined;

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
