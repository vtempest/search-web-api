
import { Engine, EngineResult } from '../lib/engine.js';
import * as cheerio from 'cheerio';
import { extractText } from '../lib/utils.js';

export const google: Engine = {
    name: 'google',
    categories: ['general'],
    request: async (query: string, params: any = {}) => {
        const pageno = params.pageno || 1;
        const start = (pageno - 1) * 10;
        const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&start=${start}&gbv=1`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Cookie': 'CONSENT=YES+; SOCS=CAESBQgYEgAgAA=='
            }
        });

        return await response.text();
    },
    response: async (html: string) => {
        const $ = cheerio.load(html);
        const results: EngineResult[] = [];

        // Google Basic Version (gbv=1) results
        // Selectors are different for gbv=1
        $('.Gx5Zad.fP1Qef.xpd.EtOod.pkphOe').each((i, el) => {
            const element = $(el);
            const link = element.find('a').first();
            const url = link.attr('href');

            // Extract real URL from /url?q=...
            let realUrl = url;
            if (url && url.startsWith('/url?q=')) {
                realUrl = url.split('/url?q=')[1].split('&')[0];
                realUrl = decodeURIComponent(realUrl);
            }

            const title = extractText(element.find('.BNeawe.vvjwJb.AP7Wnd'));
            const content = extractText(element.find('.BNeawe.s3v9rd.AP7Wnd'));

            if (realUrl && title) {
                results.push({
                    url: realUrl,
                    title,
                    content,
                    engine: 'google'
                });
            }
        });

        return results;
    }
};
