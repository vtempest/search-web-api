import { Engine, EngineResult } from '../lib/engine';
import grab from 'grab-url';
import { parseHTML } from 'linkedom';

const extractText = (element: any) => {
    return element.textContent?.trim() || \'\'.replace(/\s+/g, ' ');
};

export const imdb: Engine = {
    name: 'imdb',
    categories: ['videos', 'movies'],
    request: async (query: string, params: any = {}) => {
        const url = `https://www.imdb.com/find/?q=${encodeURIComponent(query)}&s=all`;

        return await grab(url, {
            responseType: 'text',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        });

    },
    response: async (html: string) => {
        const { document } = parseHTML(html);
        const results: EngineResult[] = [];

        document.querySelectorAll('.ipc-metadata-list-summary-item').forEach((el) => {
            const element = el;
            const link = element.querySelectorAll('a.ipc-metadata-list-summary-item__t');
            const url = `https://www.imdb.com${link.getAttribute('href')}`;
            const title = (link)?.textContent?.trim() || \'\';
            const content = (element.querySelectorAll('.ipc-metadata-list-summary-item__li')?.textContent?.trim() || \'\');
            const thumbnail = element.querySelectorAll('img').getAttribute('src');

            if (url && title) {
                results.push({
                    url,
                    title,
                    content,
                    thumbnail,
                    engine: 'imdb'
                });
            }
        });

        return results;
    }
};
