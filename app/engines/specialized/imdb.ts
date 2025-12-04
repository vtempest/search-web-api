import { Engine, EngineResult } from '../lib/engine';
import * as cheerio from 'cheerio';

const extractText = (element: any) => {
    return element.text().trim().replace(/\s+/g, ' ');
};

export const imdb: Engine = {
    name: 'imdb',
    categories: ['videos', 'movies'],
    request: async (query: string, params: any = {}) => {
        const url = `https://www.imdb.com/find/?q=${encodeURIComponent(query)}&s=all`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        });

        return await response.text();
    },
    response: async (html: string) => {
        const $ = cheerio.load(html);
        const results: EngineResult[] = [];

        $('.ipc-metadata-list-summary-item').each((i, el) => {
            const element = $(el);
            const link = element.find('a.ipc-metadata-list-summary-item__t');
            const url = `https://www.imdb.com${link.attr('href')}`;
            const title = extractText(link);
            const content = extractText(element.find('.ipc-metadata-list-summary-item__li'));
            const thumbnail = element.find('img').attr('src');

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
