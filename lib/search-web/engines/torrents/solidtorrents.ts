import { Engine, EngineResult } from '../../engine.js';
import grab from 'grab-url';
import { parseHTML } from 'linkedom';

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

        const { document } = parseHTML(data);

        document.querySelectorAll('li.search-result').forEach((element) => {
            const elElem = element;

            const torrentfile = elElem.querySelector('a.dl-torrent')?.getAttribute('href');
            const magnet = elElem.querySelector('a.dl-magnet')?.getAttribute('href');

            if (!torrentfile || !magnet) {
                return; // skip results without torrent links
            }

            const title = elElem.querySelector('h5.title')?.textContent?.trim() || '';
            const url = elElem.querySelector('h5.title a')?.getAttribute('href');
            const category = elElem.querySelector('a.category')?.textContent?.trim() || '';

            const stats = Array.from(elElem.querySelectorAll('.stats div')).map((el) => el.textContent?.trim() || '');

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
                engine: 'solidtorrents'
            });
        });

        return results;
    }
};
