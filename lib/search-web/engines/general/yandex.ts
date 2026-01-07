import { Engine, EngineResult, extractResponseData } from '../../engine.js';
import { parseHTML } from 'linkedom';
import grab from 'grab-url';

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

        return await grab(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Cookie': 'yp=1716337604.sp.family%3A0#1685406411.szm.1:1920x1080:1920x999',
            },
            responseType: 'text'
        });
    },
    response: async (response: any) => {
        const html = extractResponseData(response);
        const { document } = parseHTML(html);
        const results: EngineResult[] = [];

        // Parse Yandex search results
        document.querySelectorAll('li.serp-item, li[class*="serp-item"]').forEach((el) => {
            const element = el;

            const link = element.querySelector('a.b-serp-item__title-link, a[class*="title-link"]');
            const url = link?.getAttribute('href');
            const title = link?.querySelector('span, h3')?.textContent?.trim() || '';
            const content = element.querySelector('div.b-serp-item__text, div[class*="text"]')?.textContent?.trim() || '';

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
