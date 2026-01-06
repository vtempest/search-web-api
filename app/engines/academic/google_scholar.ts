import { Engine, EngineResult } from '../../lib/engine';

import { parseHTML } from 'linkedom';

const extractText = (element: any) => {
    return element.textContent?.trim() || ''.replace(/\s+/g, ' ');
};

export const google_scholar: Engine = {
    name: 'google_scholar',
    categories: ['science'],
    request: async (query: string, params: any = {}) => {
        const pageno = params.pageno || 1;
        const start = (pageno - 1) * 10;
        const url = `https://scholar.google.com/scholar?q=${encodeURIComponent(query)}&start=${start}&hl=en`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cookie': 'CONSENT=YES+'
            }
        });
        return await response.text();

    },
    response: async (response: any) => {
        const html = typeof response === 'string' ? response : response.data || response;
        const { document } = parseHTML(html);
        const results: EngineResult[] = [];

        document.querySelectorAll('.gs_r.gs_or.gs_scl').forEach((el) => {
            const element = el;
            const titleLink = element.querySelector('.gs_rt a');
            const url = titleLink?.getAttribute('href');
            const title = titleLink?.textContent?.trim() || '';
            const content = element.querySelector('.gs_rs')?.textContent?.trim() || '';
            const publicationInfo = element.querySelector('.gs_a')?.textContent?.trim() || '';

            if (url && title) {
                results.push({
                    url,
                    title,
                    content: `${publicationInfo} - ${content}`,
                    engine: 'google_scholar'
                });
            }
        });

        return results;
    }
};
