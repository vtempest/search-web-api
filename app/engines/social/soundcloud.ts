import { Engine, EngineResult } from '../lib/engine';
import grab from 'grab-url';
import * as cheerio from 'cheerio';

const extractText = (element: any) => {
    return element.text().trim().replace(/\s+/g, ' ');
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
        const $ = cheerio.load(html);
        const results: EngineResult[] = [];

        // SoundCloud uses dynamic content, so we'll try to extract from initial HTML
        $('article, .searchList__item').each((i, el) => {
            const element = $(el);
            const titleLink = element.find('a[itemprop="url"], h2 a').first();
            const title = extractText(element.find('[itemprop="name"], h2'));
            const artist = extractText(element.find('[itemprop="byArtist"], .soundTitle__username'));
            const href = titleLink.attr('href');
            const url = href ? (href.startsWith('http') ? href : `https://soundcloud.com${href}`) : '';
            const plays = extractText(element.find('.sc-ministats-plays, .soundStats__plays'));
            const duration = extractText(element.find('.soundTitle__tagContent time, [itemprop="duration"]'));

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
