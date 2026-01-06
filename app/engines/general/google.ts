
import { Engine, EngineResult, extractResponseData } from '../../lib/engine.js';
import { parseHTML } from 'linkedom';
import grab from 'grab-url';

export const google: Engine = {
    name: 'google',
    categories: ['general'],
    request: async (query: string, params: any = {}) => {
        const pageno = params.pageno || 1;

        return await grab('https://www.google.com/search', {
            q: encodeURIComponent(query),
            start: (pageno - 1) * 10,
            gbv: 1,
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Cookie': 'CONSENT=YES+; SOCS=CAESBQgYEgAgAA=='
            },
            responseType: 'text'
        });
    },
    response: async (response: any) => {
        const html = extractResponseData(response);
        const { document } = parseHTML(html);
        const results: EngineResult[] = [];

        // Google Basic Version (gbv=1) results
        const elements = document.querySelectorAll('.Gx5Zad.fP1Qef.xpd.EtOod.pkphOe');

        elements.forEach((element) => {
            const link = element.querySelector('a');
            const url = link?.getAttribute('href');

            // Extract real URL from /url?q=...
            let realUrl = url;
            if (url && url.startsWith('/url?q=')) {
                realUrl = url.split('/url?q=')[1].split('&')[0];
                realUrl = decodeURIComponent(realUrl);
            }

            const titleEl = element.querySelector('.BNeawe.vvjwJb.AP7Wnd');
            const contentEl = element.querySelector('.BNeawe.s3v9rd.AP7Wnd');

            const title = titleEl?.textContent?.trim() || '';
            const content = contentEl?.textContent?.trim() || '';

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
