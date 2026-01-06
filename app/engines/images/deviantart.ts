import { Engine, EngineResult } from '../../lib/engine.js';
import grab from 'grab-url';
import { parseHTML } from 'linkedom';

export const deviantart: Engine = {
    name: 'deviantart',
    categories: ['images'],
    request: async (query: string, params: any = {}) => {
        const url = `https://www.deviantart.com/search?q=${encodeURIComponent(query)}`;

        return await grab(url, {
            responseType: 'text',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
            }
        });
    },
    response: async (data: any) => {
        const results: EngineResult[] = [];

        if (!data || typeof data !== 'string') {
            return results;
        }

        const { document } = parseHTML(data);

        document.querySelectorAll('div.V_S0t_ > div > div > a').forEach((element) => {
            const elElem = element;

            // Skip premium/blurred images
            const premiumText = elElem.parentElement?.querySelector('div div div')?.textContent;
            if (premiumText && premiumText.includes('Watch the artist to view')) {
                return;
            }

            const url = elElem.getAttribute('href');
            const title = elElem.getAttribute('aria-label');
            const thumbnail = elElem.querySelector('div img')?.getAttribute('src') || undefined;

            let imgSrc = elElem.querySelector('div img')?.getAttribute('srcset');
            if (imgSrc) {
                // Get the highest quality image from srcset
                imgSrc = imgSrc.split(' ')[0];
                // Remove version suffix from URL
                try {
                    const imgUrl = new URL(imgSrc);
                    const pathParts = imgUrl.pathname.split('/v1');
                    if (pathParts.length > 0) {
                        imgUrl.pathname = pathParts[0];
                        imgSrc = imgUrl.toString();
                    }
                } catch (e) {
                    // If URL parsing fails, keep original
                }
            }

            if (url && title) {
                results.push({
                    url,
                    title,
                    content: '',
                    engine: 'deviantart',
                    thumbnail: imgSrc || thumbnail
                });
            }
        });

        return results;
    }
};
