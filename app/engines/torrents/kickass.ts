import { Engine, EngineResult } from '../../lib/engine.js';
import grab from 'grab-url';
import { parseHTML } from 'linkedom';

export const kickass: Engine = {
    name: 'kickass',
    categories: ['torrents', 'files'],
    request: async (query: string, params: any = {}) => {
        const pageno = params.pageno || 1;
        const url = `https://kickasstorrents.to/usearch/${encodeURIComponent(query)}/${pageno}/`;

        return await grab(url, {
            responseType: 'text',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
            }
        });
    },
    response: async (data: any) => {
        const results: EngineResult[] = [];

        if (!data || typeof data !== 'string') {
            return results;
        }

        const { document } = parseHTML(data);

        document.querySelectorAll('table.data tr').forEach((element, i) => {
            // Skip header row
            if (i === 0) return;

            const rowElem = element;
            const $link = rowElem.querySelectorAll('a.cellMainLink');

            if (!$link.length) return;

            const href = $link[0]?.getAttribute('href');
            const title = $link[0]?.textContent?.trim() || '';
            const description = rowElem.querySelector('span.font11px.lightgrey.block')?.textContent?.trim() || '';
            const seed = parseInt(rowElem.querySelector('td.green')?.textContent?.trim() || '') || 0;
            const leech = parseInt(rowElem.querySelector('td.red')?.textContent?.trim() || '') || 0;
            const filesize = rowElem.querySelector('td.nobr')?.textContent?.trim() || '';

            const content = [
                description,
                filesize ? `Size: ${filesize}` : '',
                `Seeds: ${seed}`,
                `Leeches: ${leech}`
            ].filter(Boolean).join(' | ');

            results.push({
                url: `https://kickasstorrents.to${href}`,
                title,
                content,
                engine: 'kickass'
            });
        });

        return results;
    }
};
