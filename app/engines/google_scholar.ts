import { Engine, EngineResult } from '../lib/engine';
import * as cheerio from 'cheerio';

const extractText = (element: any) => {
    return element.text().trim().replace(/\s+/g, ' ');
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
    response: async (html: string) => {
        const $ = cheerio.load(html);
        const results: EngineResult[] = [];

        $('.gs_r.gs_or.gs_scl').each((i, el) => {
            const element = $(el);
            const titleLink = element.find('.gs_rt a');
            const url = titleLink.attr('href');
            const title = extractText(titleLink);
            const content = extractText(element.find('.gs_rs'));
            const publicationInfo = extractText(element.find('.gs_a'));

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
