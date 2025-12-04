import { Engine, EngineResult } from '../../lib/engine.js';
import grab from 'grab-url';
import * as cheerio from 'cheerio';

export const solidtorrents: Engine = {
    name: 'solidtorrents',
    categories: ['torrents', 'files'],
    request: async (query: string, params: any = {}) => {
        const pageno = params.pageno || 1;
        const url = `https://solidtorrents.to/search?q=${encodeURIComponent(query)}&page=${pageno}`;

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

        $('li.search-result').each((_, element) => {
            const $el = $(element);

            const torrentfile = $el.find('a.dl-torrent').attr('href');
            const magnet = $el.find('a.dl-magnet').attr('href');

            if (!torrentfile || !magnet) {
                return; // skip results without torrent links
            }

            const title = $el.find('h5.title').text().trim();
            const url = $el.find('h5.title a').attr('href');
            const category = $el.find('a.category').text().trim();

            const stats = $el.find('.stats div').map((_, el) => $(el).text().trim()).get();

            const content = [
                category ? `Category: ${category}` : '',
                stats[1] ? `Size: ${stats[1]}` : '',
                stats[3] ? `Seeds: ${stats[3]}` : '',
                stats[2] ? `Leeches: ${stats[2]}` : '',
                stats[4] ? `Date: ${stats[4]}` : ''
            ].filter(Boolean).join(' | ');

            results.push({
                url: `https://solidtorrents.to${url}`,
                title,
                content,
                engine: 'solidtorrents',
                magnetlink: magnet,
                torrentfile
            });
        });

        return results;
    }
};
