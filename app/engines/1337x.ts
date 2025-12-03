import { Engine, EngineResult } from '../lib/engine';
import * as cheerio from 'cheerio';

const extractText = (element: any) => {
    return element.text().trim().replace(/\s+/g, ' ');
};

export const torrent_1337x: Engine = {
    name: '1337x',
    categories: ['files', 'torrent'],
    request: async (query: string, params: any = {}) => {
        const pageno = params.pageno || 1;
        const url = `https://1337x.to/search/${encodeURIComponent(query)}/${pageno}/`;

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

        $('table.table-list tbody tr').each((i, el) => {
            const element = $(el);
            const link = element.find('td.name a').last(); // Second link is usually the torrent detail page
            const url = `https://1337x.to${link.attr('href')}`;
            const title = extractText(link);
            const seeds = extractText(element.find('td.seeds'));
            const leeches = extractText(element.find('td.leeches'));
            const size = extractText(element.find('td.size'));

            // Remove the uploader name from size if present (it's often in a span inside td.size or just text)
            // For simplicity, just taking the text.

            if (url && title) {
                results.push({
                    url,
                    title,
                    content: `Size: ${size}, Seeds: ${seeds}, Leeches: ${leeches}`,
                    engine: '1337x'
                });
            }
        });

        return results;
    }
};
