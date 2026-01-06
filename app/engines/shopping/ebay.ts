import { Engine, EngineResult } from '../../lib/engine';

import { parseHTML } from 'linkedom';
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
    response: async (response: any) => {
        const html = typeof response === 'string' ? response : response.data || response;
        const { document } = parseHTML(html);
        const results: EngineResult[] = [];

        // Parse eBay search results
        document.querySelectorAll('li.s-item, li[class*="s-item"]').forEach((el) => {
            const element = el;

            const link = element.querySelector('a.s-item__link');
            const url = link?.getAttribute('href');
            const title = element.querySelector('h3.s-item__title, div.s-item__title')?.textContent?.trim() || '';
            const content = element.querySelector('div[span="SECONDARY_INFO"]')?.textContent?.trim() || '';

            if (!url || !title || title === '') {
                return; // continue to next iteration
            }

            // Extract price
            const price = element.querySelector('div.s-item__detail span.s-item__price')?.textContent?.trim() || '';

            // Extract shipping info
            const shipping = element.querySelector('span.s-item__shipping, span[class*="shipping"]')?.textContent?.trim() || '';

            // Extract location/source country
            const location = element.querySelector('span.s-item__location, span[class*="location"]')?.textContent?.trim() || '';

            // Extract thumbnail
            const thumbnail = element.querySelector('img.s-item__image-img')?.getAttribute('src') || '';

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
