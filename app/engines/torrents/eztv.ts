import { Engine, EngineResult, extractResponseData } from '../../lib/engine';

import { parseHTML } from 'linkedom';
import grab from 'grab-url';

const extractText = (element: any) => {
    return element.textContent?.trim() || ''.replace(/\s+/g, ' ');
};

export const eztv: Engine = {
    name: 'eztv',
    categories: ['files', 'torrent', 'tv'],
    request: async (query: string, params: any = {}) => {
        const pageno = params.pageno || 1;
        const url = `https://eztv.re/search/${encodeURIComponent(query)}`;

        return await grab(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
            },
            responseType: 'text'
        });

    },
    response: async (response: any) => {
        const html = extractResponseData(response);
        const { document } = parseHTML(html);
        const results: EngineResult[] = [];

        document.querySelectorAll('table.forum_header_border tr.forum_header_border').forEach((el) => {
            const element = el;
            const titleColumn = element.querySelectorAll('td')[1];
            const titleLink = titleColumn?.querySelector('a.epinfo');
            const magnetLink = element.querySelector('a.magnet');
            const title = titleLink?.textContent?.trim() || '';
            const url = magnetLink?.getAttribute('href') || '';

            // Get torrent metadata
            const tds = element.querySelectorAll('td');
            const size = tds[3]?.textContent?.trim() || '';
            const date = tds[4]?.textContent?.trim() || '';
            const seeds = tds[5]?.textContent?.trim() || '';

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
