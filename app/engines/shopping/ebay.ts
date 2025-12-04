import { Engine, EngineResult } from '../../lib/engine.js';
import * as cheerio from 'cheerio';
import { extractText } from '../../lib/utils.js';

export const ebay: Engine = {
    name: 'ebay',
    categories: ['shopping'],
    request: async (query: string, params: any = {}) => {
        const pageno = params.pageno || 1;

        const url = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}&_sacat=${pageno}`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            }
        });

        return await response.text();
    },
    response: async (html: string) => {
        const $ = cheerio.load(html);
        const results: EngineResult[] = [];

        // Parse eBay search results
        $('li.s-item, li[class*="s-item"]').each((i, el) => {
            const element = $(el);

            const link = element.find('a.s-item__link').first();
            const url = link.attr('href');
            const title = extractText(element.find('h3.s-item__title, div.s-item__title'));
            const content = extractText(element.find('div[span="SECONDARY_INFO"]'));

            if (!url || !title || title === '') {
                return; // continue to next iteration
            }

            // Extract price
            const price = extractText(element.find('div.s-item__detail span.s-item__price').first());

            // Extract shipping info
            const shipping = extractText(element.find('span.s-item__shipping, span[class*="shipping"]'));

            // Extract location/source country
            const location = extractText(element.find('span.s-item__location, span[class*="location"]'));

            // Extract thumbnail
            const thumbnail = element.find('img.s-item__image-img').attr('src') || '';

            // Build content with metadata
            const metadata: string[] = [];
            if (price) metadata.push(`Price: ${price}`);
            if (shipping) metadata.push(`Shipping: ${shipping}`);
            if (location) metadata.push(`Location: ${location}`);

            const fullContent = metadata.length > 0
                ? `${metadata.join(' | ')}\n${content}`
                : content;

            results.push({
                url,
                title,
                content: fullContent,
                thumbnail,
                engine: 'ebay'
            });
        });

        return results;
    }
};
