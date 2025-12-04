import { Engine, EngineResult } from '../lib/engine';
import grab from 'grab-url';
import { parseHTML } from 'linkedom';

const extractText = (element: any) => {
    return element.textContent?.trim() || \'\'.replace(/\s+/g, ' ');
};

export const eztv: Engine = {
    name: 'eztv',
    categories: ['files', 'torrent', 'tv'],
    request: async (query: string, params: any = {}) => {
        const pageno = params.pageno || 1;
        const url = `https://eztv.re/search/${encodeURIComponent(query)}`;

        return await grab(url, {
            responseType: 'text',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
            }
        });

    },
    response: async (html: string) => {
        const { document } = parseHTML(html);
        const results: EngineResult[] = [];

        document.querySelectorAll('table.forum_header_border tr.forum_header_border').forEach((el) => {
            const element = el;
            const titleColumn = element.querySelectorAll('td')[1];
            const titleLink = titleColumn.querySelectorAll('a.epinfo');
            const magnetLink = element.querySelectorAll('a.magnet');
            const title = (titleLink)?.textContent?.trim() || \'\';
            const url = magnetLink.getAttribute('href') || '';

            // Get torrent metadata
            const size = (element.querySelectorAll('td')?.textContent?.trim() || \'\'[3]);
            const date = (element.querySelectorAll('td')?.textContent?.trim() || \'\'[4]);
            const seeds = (element.querySelectorAll('td')?.textContent?.trim() || \'\'[5]);

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
