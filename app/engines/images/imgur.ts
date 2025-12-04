import { Engine, EngineResult } from '../../lib/engine.js';
import * as cheerio from 'cheerio';
import { extractText } from '../../lib/utils.js';

export const imgur: Engine = {
    name: 'imgur',
    categories: ['images'],
    request: async (query: string, params: any = {}) => {
        const pageno = params.pageno || 1;
        const timeRange = 'all'; // all, day, week, month, year

        const queryParams = new URLSearchParams({
            q: query,
            qs: 'thumbs',
            p: String(pageno - 1),
        });

        const url = `https://imgur.com/search/score/${timeRange}?${queryParams.toString()}`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            }
        });

        return await response.text();
    },
    response: async (html: string) => {
        const $ = cheerio.load(html);
        const results: EngineResult[] = [];

        // Parse Imgur search results
        $('div.cards div.post, div[class*="post"]').each((i, el) => {
            const element = $(el);

            const link = element.find('a').first();
            const url = link.attr('href');
            const title = link.find('img').attr('alt') || '';
            let thumbnail = link.find('img').attr('src') || '';

            if (!url || !thumbnail) {
                return; // continue to next iteration
            }

            // Bug fix: sometimes there's no preview image (len < 25)
            if (thumbnail.length < 25) {
                return;
            }

            // Convert thumbnail to full image (remove 'b.' prefix)
            const imgSrc = thumbnail.replace('b.', '.');

            results.push({
                url: `https://imgur.com${url}`,
                title,
                content: '',
                thumbnail,
                engine: 'imgur'
            });
        });

        return results;
    }
};
