import { Engine, EngineResult } from '../lib/engine';
import grab from 'grab-url';

export const stackoverflow: Engine = {
    name: 'stackoverflow',
    categories: ['it', 'q&a'],
    request: async (query: string, params: any = {}) => {
        const pageno = params.pageno || 1;
        // StackExchange API
        const url = `https://api.stackexchange.com/2.3/search?order=desc&sort=relevance&q=${encodeURIComponent(query)}&site=stackoverflow&page=${pageno}&pagesize=10`;

        return await grab(url, {
            headers: {
                'User-Agent': 'HonoxSearX/1.0'
            }
        });

    },
    response: async (json: any) => {
        const results: EngineResult[] = [];

        if (json && json.items) {
            json.items.forEach((item: any) => {
                results.push({
                    url: item.link,
                    title: item.title,
                    content: item.tags ? `Tags: ${item.tags.join(', ')}` : '',
                    engine: 'stackoverflow'
                });
            });
        }

        return results;
    }
};
