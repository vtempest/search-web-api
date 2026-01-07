import { Engine, EngineResult } from '../../engine.js';
import grab from 'grab-url';

export const pixabay: Engine = {
    name: 'pixabay',
    categories: ['images'],
    request: async (query: string, params: any = {}) => {
        const pageno = params.pageno || 1;
        const url = `https://pixabay.com/images/search/${encodeURIComponent(query)}/?pagi=${pageno}`;

        return await grab(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Pixabay',
                'x-bootstrap-cache-miss': '1',
                'x-fetch-bootstrap': '1'
            },
            redirect: 'manual'  // prevent automatic redirects to first page on pagination
        });
    },
    response: async (json: any) => {
        const results: EngineResult[] = [];

        if (!json || !json.page || !json.page.results) {
            return results;
        }

        for (const result of json.page.results) {
            if (!result.mediaType || !['photo', 'illustration', 'vector'].includes(result.mediaType)) {
                continue;
            }

            const sources = result.sources || {};
            const thumbnail = Object.values(sources)[0] as string || '';
            const img_src = Object.values(sources)[Object.values(sources).length - 1] as string || '';

            results.push({
                url: `https://pixabay.com${result.href}`,
                title: result.name || '',
                content: result.description || '',
                engine: 'pixabay',
                thumbnail,
                img_src
            });
        }

        return results;
    }
};
