import { Engine, EngineResult, extractResponseData } from '../../lib/engine.js';
import grab from 'grab-url';

export const google_images: Engine = {
    name: 'google_images',
    categories: ['images'],
    request: async (query: string, params: any = {}) => {
        const pageno = params.pageno || 1;

        const queryParams = new URLSearchParams({
            q: query,
            tbm: 'isch',
            asearch: 'isch',
            hl: 'en',
            gl: 'US',
        });

        // Pagination uses zero-based numbering
        const url = `https://www.google.com/search?${queryParams.toString()}&async=_fmt:json,p:1,ijn:${pageno - 1}`;

        return await grab(url, {
            headers: {
                'User-Agent': 'NSTN/3.60.474802233.release Dalvik/2.1.0 (Linux; U; Android 12; US) gzip',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Cookie': 'CONSENT=YES+; SOCS=CAESBQgYEgAgAA=='
            }
        });

    },
    response: async (response: any) => {
        const results: EngineResult[] = [];
        const html = extractResponseData(response);

        // If extractResponseData returned empty (due to error), return empty results
        if (!html || typeof html !== 'string') {
            return results;
        }

        try {
            // Find JSON data in response
            const jsonStart = html.indexOf('{"ischj":');
            if (jsonStart === -1) {
                return results;
            }

            const jsonData = JSON.parse(html.substring(jsonStart));
            const metadata = jsonData?.ischj?.metadata || [];

            for (const item of metadata) {
                if (!item?.result || !item?.original_image) {
                    continue;
                }

                const result = item.result;
                const originalImage = item.original_image;
                const thumbnail = item.thumbnail;

                // Build source/metadata string
                const sourceParts: string[] = [];
                if (result.site_title) {
                    sourceParts.push(result.site_title);
                }

                // Add author if available
                const author = result.iptc?.creator;
                if (author && Array.isArray(author)) {
                    sourceParts.push(`Author: ${author.join(', ')}`);
                }

                // Add copyright if available
                const copyright = result.iptc?.copyright_notice;
                if (copyright) {
                    sourceParts.push(copyright);
                }

                // Add freshness date if available
                if (result.freshness_date) {
                    sourceParts.push(result.freshness_date);
                }

                // Add file size if available
                const fileSize = item.gsa?.file_size;
                if (fileSize) {
                    sourceParts.push(`(${fileSize})`);
                }

                // Resolution
                const resolution = `${originalImage.width} x ${originalImage.height}`;

                const content = [
                    item.text_in_grid?.snippet || '',
                    sourceParts.join(' | '),
                    `Resolution: ${resolution}`
                ].filter(Boolean).join('\n');

                results.push({
                    url: result.referrer_url,
                    title: result.page_title || '',
                    content,
                    thumbnail: thumbnail?.url,
                    engine: 'google_images'
                });
            }
        } catch (e) {
            // If JSON parsing fails, return empty results
            console.error('Error parsing Google Images response:', e);
        }

        return results;
    }
};
