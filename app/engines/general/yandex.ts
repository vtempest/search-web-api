import { Engine, EngineResult } from '../../lib/engine.js';
import * as cheerio from 'cheerio';
import { extractText } from '../../lib/utils.js';

export const yandex: Engine = {
    name: 'yandex',
    categories: ['general'],
    request: async (query: string, params: any = {}) => {
        const pageno = params.pageno || 1;

        const queryParams = new URLSearchParams({
            tmpl_version: 'releases',
            text: query,
            web: '1',
            frame: '1',
            searchid: '3131712',
            lang: 'en',
        });

        if (pageno > 1) {
            queryParams.set('p', String(pageno - 1));
        }

        const url = `https://yandex.com/search/site/?${queryParams.toString()}`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Cookie': 'yp=1716337604.sp.family%3A0#1685406411.szm.1:1920x1080:1920x999',
            }
        });

        // Check for captcha
        if (response.headers.get('x-yandex-captcha') === 'captcha') {
            throw new Error('Yandex CAPTCHA detected');
        }

        return await response.text();
    },
    response: async (html: string) => {
        const $ = cheerio.load(html);
        const results: EngineResult[] = [];

        // Parse Yandex search results
        $('li.serp-item, li[class*="serp-item"]').each((i, el) => {
            const element = $(el);

            const link = element.find('a.b-serp-item__title-link, a[class*="title-link"]').first();
            const url = link.attr('href');
            const title = extractText(link.find('span, h3'));
            const content = extractText(element.find('div.b-serp-item__text, div[class*="text"]'));

            if (url && title) {
                results.push({
                    url,
                    title,
                    content,
                    engine: 'yandex'
                });
            }
        });

        return results;
    }
};
