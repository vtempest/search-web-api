import { Engine, EngineResult } from '../lib/engine';
import * as cheerio from 'cheerio';

const extractText = (element: any) => {
    return element.text().trim().replace(/\s+/g, ' ');
};

export const eztv: Engine = {
    name: 'eztv',
    categories: ['files', 'torrent', 'tv'],
    request: async (query: string, params: any = {}) => {
        const pageno = params.pageno || 1;
        const url = `https://eztv.re/search/${encodeURIComponent(query)}`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
            }
        });

        return await response.text();
    },
    response: async (html: string) => {
        const $ = cheerio.load(html);
        const results: EngineResult[] = [];

        $('table.forum_header_border tr.forum_header_border').each((i, el) => {
            const element = $(el);
            const titleColumn = element.find('td').eq(1);
            const titleLink = titleColumn.find('a.epinfo');
            const magnetLink = element.find('a.magnet');
            const title = extractText(titleLink);
            const url = magnetLink.attr('href') || '';

            // Get torrent metadata
            const size = extractText(element.find('td').eq(3));
            const date = extractText(element.find('td').eq(4));
            const seeds = extractText(element.find('td').eq(5));

            if (url && title) {
                results.push({
                    url,
                    title,
                    content: `Size: ${size}, Seeds: ${seeds}, Released: ${date}`,
                    engine: 'eztv'
                });
            }
        });

        return results;
    }
};
