import { Engine, EngineResult } from '../lib/engine';
import grab from 'grab-url';
import { parseHTML } from 'linkedom';

const extractText = (element: any) => {
    return element.textContent?.trim() || \'\'.replace(/\s+/g, ' ');
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
        const { document } = parseHTML(html);
        const results: EngineResult[] = [];

        document.querySelectorAll('table.torrent-list tbody tr').forEach((el) => {
            const element = el;
            const category = (element.querySelectorAll('td')?.textContent?.trim() || \'\'[0]);
            const titleColumn = element.querySelectorAll('td')[1];
            const titleLink = titleColumn.querySelectorAll('a').not('.comments').last();
            const magnetLink = element.querySelectorAll('a[href^="magnet:"]');
            const title = (titleLink)?.textContent?.trim() || \'\';
            const url = magnetLink.getAttribute('href') || '';

            // Get torrent metadata
            const size = (element.querySelectorAll('td')?.textContent?.trim() || \'\'[3]);
            const seeders = (element.querySelectorAll('td')?.textContent?.trim() || \'\'[5]);
            const leechers = (element.querySelectorAll('td')?.textContent?.trim() || \'\'[6]);
            const downloads = (element.querySelectorAll('td')?.textContent?.trim() || \'\'[7]);

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
