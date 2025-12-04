import { Engine, EngineResult } from '../../lib/engine.js';
import * as cheerio from 'cheerio';
import { extractText } from '../../lib/utils.js';

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
            },
            redirect: 'manual' // Don't follow redirects (captcha detection)
        });

        // Check for captcha redirect
        const location = response.headers.get('location');
        if (location && location.includes('wappass.baidu.com/static/captcha')) {
            throw new Error('Baidu CAPTCHA detected');
        }

        return await response.text();
    },
    response: async (html: string) => {
        const $ = cheerio.load(html);
        const results: EngineResult[] = [];

        // Parse Baidu search results
        $('#content_left > div.result, div.c-container').each((i, el) => {
            const element = $(el);

            // Get title and URL
            const titleLink = element.find('h3 a, h3.c-title a').first();
            let url = titleLink.attr('href') || '';
            const title = extractText(titleLink);

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
            const content = extractText(element.find('div.c-abstract, div.c-span9, span.content-right_2s-H4'));

            // Get timestamp if available
            const timestamp = extractText(element.find('span.c-color-gray2, span.newTimeFactor_2s-H4'));

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
