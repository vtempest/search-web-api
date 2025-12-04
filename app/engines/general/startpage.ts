import { Engine, EngineResult } from '../lib/engine';
import grab from 'grab-url';
import * as cheerio from 'cheerio';

const extractText = (element: any) => {
    return element.text().trim().replace(/\s+/g, ' ');
};

export const startpage: Engine = {
    name: 'startpage',
    categories: ['general'],
    request: async (query: string, params: any = {}) => {
        const pageno = params.pageno || 1;
        // Startpage is harder to scrape without a proper session, trying basic POST
        const url = 'https://www.startpage.com/sp/search';

        const formData = new URLSearchParams();
        formData.append('query', query);
        formData.append('page', String(pageno));

        return await grab(url, {
            responseType: 'text',
            post: true,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData
        });

    },
    response: async (html: string) => {
        const $ = cheerio.load(html);
        const results: EngineResult[] = [];

        $('.w-gl__result').each((i, el) => {
            const element = $(el);
            const link = element.find('.w-gl__result-title');
            const url = link.attr('href');
            const title = extractText(link.find('h3'));
            const content = extractText(element.find('.w-gl__description'));

            if (url && title) {
                results.push({
                    url,
                    title,
                    content,
                    engine: 'startpage'
                });
            }
        });

        return results;
    }
};
