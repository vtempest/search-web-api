import { Engine, EngineResult } from '../lib/engine';
import grab from 'grab-url';
import * as cheerio from 'cheerio';

const extractText = (element: any) => {
    return element.text().trim().replace(/\s+/g, ' ');
};

export const nyaa: Engine = {
    name: 'nyaa',
    categories: ['files', 'torrent', 'anime'],
    request: async (query: string, params: any = {}) => {
        const pageno = params.pageno || 1;
        const url = `https://nyaa.si/?f=0&c=0_0&q=${encodeURIComponent(query)}&p=${pageno}`;

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

        $('table.torrent-list tbody tr').each((i, el) => {
            const element = $(el);
            const category = extractText(element.find('td').eq(0));
            const titleColumn = element.find('td').eq(1);
            const titleLink = titleColumn.find('a').not('.comments').last();
            const magnetLink = element.find('a[href^="magnet:"]');
            const title = extractText(titleLink);
            const url = magnetLink.attr('href') || '';

            // Get torrent metadata
            const size = extractText(element.find('td').eq(3));
            const seeders = extractText(element.find('td').eq(5));
            const leechers = extractText(element.find('td').eq(6));
            const downloads = extractText(element.find('td').eq(7));

            if (url && title) {
                results.push({
                    url,
                    title,
                    content: `Category: ${category}, Size: ${size}, Seeds: ${seeders}, Leeches: ${leechers}, Downloads: ${downloads}`,
                    engine: 'nyaa'
                });
            }
        });

        return results;
    }
};
