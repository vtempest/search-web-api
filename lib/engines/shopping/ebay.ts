import { Engine, EngineResult, extractResponseData } from '../../engine';
import { parseHTML } from 'linkedom';
import grab from 'grab-url';

/**
 * eBay Shopping Search Engine
 *
 * Searches eBay marketplace for products, including:
 * - Product listings
 * - Prices and shipping info
 * - Images and thumbnails
 * - Source country information
 */
export const ebay: Engine = {
    name: 'ebay',
    categories: ['shopping'],
    request: async (query: string, params: any = {}) => {
        const pageno = params.pageno || 1;
        const baseUrl = params.base_url || 'https://www.ebay.com';

        const url = `${baseUrl}/sch/i.html?_nkw=${encodeURIComponent(query)}&_sacat=${pageno}`;

        return await grab(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
            },
            responseType: 'text'
        });
    },
    response: async (response: any) => {
        const html = extractResponseData(response);
        const { document } = parseHTML(html);
        const results: EngineResult[] = [];

        // XPath equivalent: //li[contains(@class, "s-item")]
        const resultElements = document.querySelectorAll('li.s-item, li[class*="s-item"]');

        for (const element of Array.from(resultElements)) {
            try {
                // Extract data from DOM
                const linkElement = element.querySelector('a.s-item__link');
                const url = linkElement?.getAttribute('href');

                const titleElement = element.querySelector('h3.s-item__title');
                const title = titleElement?.textContent?.trim();

                const contentElement = element.querySelector('div[span="SECONDARY_INFO"]');
                const content = contentElement?.textContent?.trim();

                const priceElement = element.querySelector('div.s-item__detail span.s-item__price, span.s-item__price');
                const price = priceElement?.textContent?.trim();

                const shippingElement = element.querySelector('span.s-item__shipping, span[class*="s-item__shipping"]');
                const shipping = shippingElement?.textContent?.trim();

                const locationElement = element.querySelector('span.s-item__location, span[class*="s-item__location"]');
                const source_country = locationElement?.textContent?.trim();

                const thumbnailElement = element.querySelector('img.s-item__image-img');
                const thumbnail = thumbnailElement?.getAttribute('src');

                // Skip if no title
                if (!title || title === '') {
                    continue;
                }

                const result: EngineResult = {
                    url: url || '',
                    title,
                    content: content || '',
                    thumbnail,
                    engine: 'ebay'
                };

                // Add extra fields
                (result as any).price = price;
                (result as any).shipping = shipping;
                (result as any).source_country = source_country;
                (result as any).template = 'products';

                results.push(result);
            } catch (error) {
                // Skip malformed results
                continue;
            }
        }

        return results;
    }
};
