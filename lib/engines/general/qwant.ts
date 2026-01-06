import { Engine, EngineResult } from '../../engine';
import grab from 'grab-url';

export const qwant: Engine = {
    name: 'qwant',
    categories: ['general'],
    request: async (query: string, params: any = {}) => {
        const pageno = params.pageno || 1;
        const offset = (pageno - 1) * 10;
        // Qwant API (unofficial/web)
        const url = `https://api.qwant.com/v3/search/web?q=${encodeURIComponent(query)}&count=10&offset=${offset}&locale=en_US`;

        return await grab(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            }
        });

    },
    response: async (json: any) => {
        const results: EngineResult[] = [];

        if (json && json.data && json.data.result && json.data.result.items) {
            json.data.result.items.forEach((item: any) => {
                results.push({
                    url: item.url,
                    title: item.title,
                    content: item.desc,
                    engine: 'qwant'
                });
            });
        }

        return results;
    }
};
