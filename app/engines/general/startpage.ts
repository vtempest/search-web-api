import { Engine, EngineResult, extractResponseData } from '../../lib/engine';
import { parseHTML } from 'linkedom';
import grab from 'grab-url';

const extractText = (element: any) => {
    return element.textContent?.trim() || ''.replace(/\s+/g, ' ');
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
            method: 'POST',
            body: formData.toString(),
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            responseType: 'text'
        });
    },
    response: async (response: any) => {
        const html = extractResponseData(response);
        const { document } = parseHTML(html);
        const results: EngineResult[] = [];

        document.querySelectorAll('.w-gl__result').forEach((el) => {
            const element = el;
            const link = element.querySelector('.w-gl__result-title');
            const url = link?.getAttribute('href');
            const title = link?.querySelector('h3')?.textContent?.trim() || '';
            const content = element.querySelector('.w-gl__description')?.textContent?.trim() || '';

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
