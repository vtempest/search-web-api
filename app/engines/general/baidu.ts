import { Engine, EngineResult } from '../../lib/engine.js';

import { parseHTML } from 'linkedom';
export const baidu: Engine = {
    name: 'baidu',
    categories: ['general'],
    request: async (query: string, params: any = {}) => {
        const pageno = params.pageno || 1;
        const resultsPerPage = 10;
        const pn = (pageno - 1) * resultsPerPage;

        const queryParams = new URLSearchParams({
            wd: query,
            rn: String(resultsPerPage),
            pn: String(pn),
        });

        const url = `https://www.baidu.com/s?${queryParams.toString()}`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                'Cookie': 'BAIDUID=1234567890:FG=1',
            }
        });
        return await response.text();
    },
    response: async (response: any) => {
        const html = typeof response === 'string' ? response : response.data || response;
        const { document } = parseHTML(html);
        const results: EngineResult[] = [];

        // Parse Baidu search results
        document.querySelectorAll('#content_left > div.result, div.c-container').forEach((el) => {
            const element = el;

            // Get title and URL
            const titleLink = element.querySelector('h3 a, h3.c-title a');
            let url = titleLink?.getAttribute('href') || '';
            const title = titleLink?.textContent?.trim() || '';

            if (!url || !title) {
                return; // continue to next iteration
            }

            // Baidu uses redirect URLs, extract real URL if present
            // Format: https://www.baidu.com/link?url=...
            if (url.includes('/link?url=') || url.includes('baidu.com/link')) {
                // For now, keep the Baidu redirect URL
                // In production, you might want to resolve these
            }

            // Get content/description
            const content = element.querySelector('div.c-abstract, div.c-span9, span.content-right_2s-H4')?.textContent?.trim() || '';

            // Get timestamp if available
            const timestamp = element.querySelector('span.c-color-gray2, span.newTimeFactor_2s-H4')?.textContent?.trim() || '';

            const fullContent = timestamp ? `${timestamp}\n${content}` : content;

            results.push({
                url,
                title,
                content: fullContent,
                engine: 'baidu'
            });
        });

        return results;
    }
};
