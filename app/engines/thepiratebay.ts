import { Engine, EngineResult } from '../lib/engine';
import * as cheerio from 'cheerio';

const extractText = (element: any) => {
    return element.text().trim().replace(/\s+/g, ' ');
};

export const thepiratebay: Engine = {
    name: 'thepiratebay',
    categories: ['files', 'torrent'],
    request: async (query: string, params: any = {}) => {
        const pageno = params.pageno || 1;
        const url = `https://thepiratebay.org/search.php?q=${encodeURIComponent(query)}&page=${pageno - 1}`;

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

        $('#searchResult tbody tr').each((i, el) => {
            const element = $(el);
            const titleLink = element.find('td.vertTh a.detLink');
            const magnetLink = element.find('a[href^="magnet:"]');
            const title = extractText(titleLink);
            const url = magnetLink.attr('href') || '';
            const descElement = element.find('font.detDesc');
            const descText = extractText(descElement);

            // Extract size, uploader, and date from description
            const sizeMatch = descText.match(/Size\s+([^,]+)/i);
            const uploaderMatch = descText.match(/ULed by\s+([^,]+)/i);
            const size = sizeMatch ? sizeMatch[1] : 'Unknown';
            const uploader = uploaderMatch ? uploaderMatch[1] : 'Unknown';

            // Get seeders and leechers
            const seeders = extractText(element.find('td').eq(2));
            const leechers = extractText(element.find('td').eq(3));

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
