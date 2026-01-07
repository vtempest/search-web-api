import { Engine, EngineResult } from '../../engine';
import grab from 'grab-url';
import { parseHTML } from 'linkedom';

export const bing_images: Engine = {
    name: 'bing_images',
    categories: ['images'],
    request: async (query: string, params: any = {}) => {
        const pageno = params.pageno || 1;
        const first = (pageno - 1) * 35 + 1;

        const queryParams = new URLSearchParams({
            q: query,
            async: '1',
            first: String(first),
            count: '35',
        });

        const url = `https://www.bing.com/images/async?${queryParams.toString()}`;

        return await grab(url, {
            responseType: 'text',
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            }
        });

    },
    response: async (response: any) => {
        const html = response.data || response;
        const { document } = parseHTML(html);
        const results: EngineResult[] = [];

        // Parse image results from Bing Images
        document.querySelectorAll('ul.dgControl_list li, li[class*="dgControl"]').forEach((el) => {
            const element = el;

            // Extract metadata from 'm' attribute
            const metadataStr = element.querySelector('a.iusc')?.getAttribute('m');
            if (!metadataStr) {
                return; // continue to next iteration
            }

            try {
                const metadata = JSON.parse(metadataStr);

                // Extract additional info
                const title = element.querySelector('div.infnmpt a')?.textContent?.trim() || metadata.t || '';
                const imgFormat = element.querySelector('div.imgpt div span')?.textContent?.trim() || '';
                const source = element.querySelector('div.imgpt div.lnkw a')?.textContent?.trim() || '';

                // Parse resolution and format from imgFormat
                const formatParts = imgFormat.split(' · ');
                const resolution = formatParts[0] || '';
                const format = formatParts[1] || '';

                results.push({
                    url: metadata.purl, // Page URL
                    title: title,
                    content: metadata.desc || source || '',
                    thumbnail: metadata.turl, // Thumbnail URL
                    engine: 'bing_images'
                });
            } catch (e) {
                // Skip if metadata parsing fails
            }
        });

        return results;
    }
};
