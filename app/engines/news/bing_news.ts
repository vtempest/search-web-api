import { Engine, EngineResult } from '../../lib/engine.js';
import grab from 'grab-url';
import { parseHTML } from 'linkedom';
export const bing_news: Engine = {
    name: 'bing_news',
    categories: ['news'],
    request: async (query: string, params: any = {}) => {
        const pageno = params.pageno || 1;
        const page = pageno - 1;

        const queryParams = new URLSearchParams({
            q: query,
            InfiniteScroll: '1',
            first: String(page * 10 + 1),
            SFX: String(page),
            form: 'PTFTNR',
            setlang: 'en',
            cc: 'US',
        });

        const url = `https://www.bing.com/news/infinitescrollajax?${queryParams.toString()}`;

        return await grab(url, {
            responseType: 'text',
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            }
        });

    },
    response: async (html: string) => {
        const { document } = parseHTML(html);
        const results: EngineResult[] = [];

        // Parse news items from Bing News
        document.querySelectorAll('div.newsitem, div[class*="newsitem"]').forEach((el) => {
            const element = el;

            const link = element.querySelector('a.title, a[class*="title"]');
            const url = link.getAttribute('href');
            const title = (link)?.textContent?.trim() || \'\';
            const content = (element.querySelectorAll('div.snippet, div[class*="snippet"]')?.textContent?.trim() || \'\');

            if (!url || !title) {
                return; // continue to next iteration
            }

            // Extract metadata (source, time, author)
            const metadata: string[] = [];
            const source = element.querySelector('div.source, div[class*="source"]');

            if (source.length > 0) {
                const ariaLabel = source.querySelectorAll('span[aria-label]').getAttribute('aria-label');
                const author = link.getAttribute('data-author');

                if (ariaLabel) {
                    metadata.push(ariaLabel);
                }
                if (author) {
                    metadata.push(author);
                }
            }

            // Extract thumbnail
            let thumbnail = element.querySelectorAll('a.imagelink img, a[class*="imagelink"] img').getAttribute('src');
            if (thumbnail && !thumbnail.startsWith('https://www.bing.com')) {
                thumbnail = 'https://www.bing.com/' + thumbnail;
            }

            const metadataStr = metadata.length > 0 ? metadata.join(' | ') : '';
            const fullContent = metadataStr ? `${metadataStr}\n${content}` : content;

            results.push({
                url,
                title,
                content: fullContent,
                thumbnail,
                engine: 'bing_news'
            });
        });

        return results;
    }
};
