import { Engine, EngineResult, extractResponseData } from '../../engine';

import { parseHTML } from 'linkedom';
import grab from 'grab-url';

const extractText = (element: any) => {
    return element.textContent?.trim() || ''.replace(/\s+/g, ' ');
};

export const thepiratebay: Engine = {
    name: 'thepiratebay',
    categories: ['files', 'torrent'],
    request: async (query: string, params: any = {}) => {
        const pageno = params.pageno || 1;
        const url = `https://thepiratebay.org/search.php?q=${encodeURIComponent(query)}&page=${pageno - 1}`;

        return await grab(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
            },
            responseType: 'text'
        });

    },
    response: async (response: any) => {
        const html = extractResponseData(response);
        const { document} = parseHTML(html);
        const results: EngineResult[] = [];

        document.querySelectorAll('#searchResult tbody tr').forEach((el) => {
            const element = el;
            const titleLink = element.querySelector('td.vertTh a.detLink');
            const magnetLink = element.querySelector('a[href^="magnet:"]');
            const title = titleLink?.textContent?.trim() || '';
            const url = magnetLink?.getAttribute('href') || '';
            const descElement = element.querySelector('font.detDesc');
            const descText = descElement?.textContent?.trim() || '';

            // Extract size, uploader, and date from description
            const sizeMatch = descText.match(/Size\s+([^,]+)/i);
            const uploaderMatch = descText.match(/ULed by\s+([^,]+)/i);
            const size = sizeMatch ? sizeMatch[1] : 'Unknown';
            const uploader = uploaderMatch ? uploaderMatch[1] : 'Unknown';

            // Get seeders and leechers
            const tds = element.querySelectorAll('td');
            const seeders = tds[2]?.textContent?.trim() || '';
            const leechers = tds[3]?.textContent?.trim() || '';

            if (url && title) {
                results.push({
                    url,
                    title,
                    content: `Size: ${size}, Seeds: ${seeders}, Leeches: ${leechers}, Uploader: ${uploader}`,
                    engine: 'thepiratebay'
                });
            }
        });

        return results;
    }
};
