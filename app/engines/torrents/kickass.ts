import { Engine, EngineResult } from '../../lib/engine.js';
import grab from 'grab-url';
import * as cheerio from 'cheerio';

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

        const $ = cheerio.load(data);

        $('table.data tr').each((i, element) => {
            // Skip header row
            if (i === 0) return;

            const $row = $(element);
            const $link = $row.find('a.cellMainLink');

            if (!$link.length) return;

            const href = $link.attr('href');
            const title = $link.text().trim();
            const description = $row.find('span.font11px.lightgrey.block').text().trim();
            const seed = parseInt($row.find('td.green').text().trim()) || 0;
            const leech = parseInt($row.find('td.red').text().trim()) || 0;
            const filesize = $row.find('td.nobr').text().trim();

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
                engine: 'kickass',
                seed,
                leech,
                filesize
            });
        });

        // Sort by seed count
        return results.sort((a, b) => (b.seed || 0) - (a.seed || 0));
    }
};
