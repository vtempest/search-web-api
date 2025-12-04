import { Engine, EngineResult } from '../lib/engine.js';
import grab from 'grab-url';
import * as cheerio from 'cheerio';
import { extractText } from '../lib/utils.js';

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
        const $ = cheerio.load(html);
        const results: EngineResult[] = [];

        // Parse news items from Bing News
        $('div.newsitem, div[class*="newsitem"]').each((i, el) => {
            const element = $(el);

            const link = element.find('a.title, a[class*="title"]').first();
            const url = link.attr('href');
            const title = extractText(link);
            const content = extractText(element.find('div.snippet, div[class*="snippet"]'));

            if (!url || !title) {
                return; // continue to next iteration
            }

            // Extract metadata (source, time, author)
            const metadata: string[] = [];
            const source = element.find('div.source, div[class*="source"]').first();

            if (source.length > 0) {
                const ariaLabel = source.find('span[aria-label]').attr('aria-label');
                const author = link.attr('data-author');

                if (ariaLabel) {
                    metadata.push(ariaLabel);
                }
                if (author) {
                    metadata.push(author);
                }
            }

            // Extract thumbnail
            let thumbnail = element.find('a.imagelink img, a[class*="imagelink"] img').attr('src');
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
