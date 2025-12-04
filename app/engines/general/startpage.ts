import { Engine, EngineResult } from '../lib/engine';
import grab from 'grab-url';
import { parseHTML } from 'linkedom';

const extractText = (element: any) => {
    return element.textContent?.trim() || \'\'.replace(/\s+/g, ' ');
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
        const { document } = parseHTML(html);
        const results: EngineResult[] = [];

        document.querySelectorAll('.w-gl__result').forEach((el) => {
            const element = el;
            const link = element.querySelectorAll('.w-gl__result-title');
            const url = link.getAttribute('href');
            const title = (link.querySelectorAll('h3')?.textContent?.trim() || \'\');
            const content = (element.querySelectorAll('.w-gl__description')?.textContent?.trim() || \'\');

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
