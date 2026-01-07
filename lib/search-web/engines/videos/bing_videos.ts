import { Engine, EngineResult, extractResponseData } from '../../engine';
import { parseHTML } from 'linkedom';
import grab from 'grab-url';

/**
 * Bing Videos Search Engine
 * 
 * Searches Bing for video content, including:
 * - Video URLs
 * - Thumbnails
 * - Duration and metadata
 */
export const bing_videos: Engine = {
    name: 'bing_videos',
    categories: ['videos'],
    request: async (query: string, params: any = {}) => {
        const pageno = params.pageno || 1;
        const first = (pageno - 1) * 35 + 1;

        const queryParams = new URLSearchParams({
            q: query,
            async: 'content',
            first: String(first),
            count: '35',
        });

        const url = `https://www.bing.com/videos/asyncv2?${queryParams.toString()}`;

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

        // Find video result containers
        const videoElements = document.querySelectorAll('div.dg_u div[id*="mc_vtvc_video"]');

        for (const element of Array.from(videoElements)) {
            try {
                // Extract metadata from vrhdata attribute
                const vrhDataElement = element.querySelector('div.vrhdata');
                const vrhmAttr = vrhDataElement?.getAttribute('vrhm');

                if (!vrhmAttr) {
                    continue;
                }

                const metadata = JSON.parse(vrhmAttr);

                // Extract additional info
                const metaSpans = element.querySelectorAll('div.mc_vtvc_meta_block span');
                const info = Array.from(metaSpans)
                    .map(span => span.textContent?.trim())
                    .filter(Boolean)
                    .join(' - ');

                const duration = metadata.du || '';
                const content = `${duration} - ${info}`.trim();

                // Extract thumbnail
                const thumbnailElement = element.querySelector('div.mc_vtvc_th img, img');
                const thumbnail = thumbnailElement?.getAttribute('src');

                const result: EngineResult = {
                    url: metadata.murl || '',
                    title: metadata.vt || '',
                    content,
                    thumbnail,
                    engine: 'bing_videos'
                };

                (result as any).template = 'videos';

                results.push(result);
            } catch (error) {
                // Skip malformed results
                continue;
            }
        }

        return results;
    }
};
