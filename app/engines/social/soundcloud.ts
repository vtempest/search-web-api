import { Engine, EngineResult } from '../lib/engine';
import grab from 'grab-url';
import { parseHTML } from 'linkedom';

const extractText = (element: any) => {
    return element.textContent?.trim() || \'\'.replace(/\s+/g, ' ');
};

export const soundcloud: Engine = {
    name: 'soundcloud',
    categories: ['music'],
    request: async (query: string, params: any = {}) => {
        const pageno = params.pageno || 1;
        const url = `https://soundcloud.com/search?q=${encodeURIComponent(query)}`;

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

        // SoundCloud uses dynamic content, so we'll try to extract from initial HTML
        document.querySelectorAll('article, .searchList__item').forEach((el) => {
            const element = el;
            const titleLink = element.querySelector('a[itemprop="url"], h2 a');
            const title = (element.querySelectorAll('[itemprop="name"], h2')?.textContent?.trim() || \'\');
            const artist = (element.querySelectorAll('[itemprop="byArtist"], .soundTitle__username')?.textContent?.trim() || \'\');
            const href = titleLink.getAttribute('href');
            const url = href ? (href.startsWith('http') ? href : `https://soundcloud.com${href}`) : '';
            const plays = (element.querySelectorAll('.sc-ministats-plays, .soundStats__plays')?.textContent?.trim() || \'\');
            const duration = (element.querySelectorAll('.soundTitle__tagContent time, [itemprop="duration"]')?.textContent?.trim() || \'\');

            if (url && title) {
                results.push({
                    url,
                    title: `${title}${artist ? ' - ' + artist : ''}`,
                    content: `${plays ? 'Plays: ' + plays : ''} ${duration ? '| Duration: ' + duration : ''}`,
                    engine: 'soundcloud'
                });
            }
        });

        return results;
    }
};
