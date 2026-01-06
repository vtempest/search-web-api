import { Engine, EngineResult } from '../../engine';
import grab from 'grab-url';
import { parseHTML } from 'linkedom';

const extractText = (element: any) => {
    return element.textContent?.trim() || ''.replace(/\s+/g, ' ');
};

export const torrent_1337x: Engine = {
    name: '1337x',
    categories: ['files', 'torrent'],
    request: async (query: string, params: any = {}) => {
        const pageno = params.pageno || 1;
        const url = `https://1337x.to/search/${encodeURIComponent(query)}/${pageno}/`;

        return await grab(url, {
            responseType: 'text',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
            }
        });

    },
    response: async (response: any) => {
        const html = response.data || response;
        const { document } = parseHTML(html);
        const results: EngineResult[] = [];

        document.querySelectorAll('table.table-list tbody tr').forEach((el) => {
            const element = el;
            const links = element.querySelectorAll('td.name a');
            const link = links[1] || links[0]; // Second link is usually the torrent detail page
            const url = `https://1337x.to${link?.getAttribute('href')}`;
            const title = link?.textContent?.trim() || '';
            const seeds = element.querySelector('td.seeds')?.textContent?.trim() || '';
            const leeches = element.querySelector('td.leeches')?.textContent?.trim() || '';
            const size = element.querySelector('td.size')?.textContent?.trim() || '';

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
