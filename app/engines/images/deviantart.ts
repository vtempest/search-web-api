import { Engine, EngineResult } from '../../lib/engine.js';
import grab from 'grab-url';
import * as cheerio from 'cheerio';

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

        const $ = cheerio.load(data);

        $('div.V_S0t_ > div > div > a').each((_, element) => {
            const $el = $(element);

            // Skip premium/blurred images
            const premiumText = $el.parent().find('div div div').text();
            if (premiumText && premiumText.includes('Watch the artist to view')) {
                return;
            }

            const url = $el.attr('href');
            const title = $el.attr('aria-label');
            const thumbnail = $el.find('div img').attr('src');

            let imgSrc = $el.find('div img').attr('srcset');
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
                    img_src: imgSrc || thumbnail,
                    thumbnail
                });
            }
        });

        return results;
    }
};
