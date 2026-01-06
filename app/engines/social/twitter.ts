import { Engine, EngineResult } from '../../lib/engine';

import { parseHTML } from 'linkedom';

const extractText = (element: any) => {
    return element.textContent?.trim() || ''.replace(/\s+/g, ' ');
};

export const twitter: Engine = {
    name: 'twitter',
    categories: ['social media'],
    request: async (query: string, params: any = {}) => {
        const pageno = params.pageno || 1;
        // Using nitter.net as a privacy-friendly Twitter frontend
        const url = `https://nitter.net/search?f=tweets&q=${encodeURIComponent(query)}`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
            }
        });
        return await response.text();

    },
    response: async (response: any) => {
        const html = typeof response === 'string' ? response : response.data || response;
        const { document } = parseHTML(html);
        const results: EngineResult[] = [];

        document.querySelectorAll('.timeline-item').forEach((el) => {
            const element = el;
            const tweetLink = element.querySelector('.tweet-link');
            const username = element.querySelector('.username')?.textContent?.trim() || '';
            const fullname = element.querySelector('.fullname')?.textContent?.trim() || '';
            const content = element.querySelector('.tweet-content')?.textContent?.trim() || '';
            const timestamp = element.querySelector('.tweet-date a')?.textContent?.trim() || '';
            const stats = element.querySelector('.tweet-stats')?.textContent?.trim() || '';

            const href = tweetLink?.getAttribute('href');
            const url = href ? `https://twitter.com${href.replace('/i/web', '')}` : '';

            if (url && content) {
                results.push({
                    url,
                    title: `${fullname} (@${username})`,
                    content: `${content} | ${timestamp} | ${stats}`,
                    engine: 'twitter'
                });
            }
        });

        return results;
    }
};
